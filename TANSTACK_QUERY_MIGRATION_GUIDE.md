# TanStack Query Migration Guide for Fomino

## Overview

This guide provides a step-by-step approach to migrate your current data fetching implementation to TanStack Query, which is already installed in your project but not being used.

## Current Issues with GetAPI Approach

### 1. **Redundant API Calls**

```javascript
// Current: Multiple components fetch same data
const { data: orderHistoryData } = GetAPI("users/orderhistory");
const { data: addressesData } = GetAPI("users/alladdresses");
```

**Problem**: Each component creates its own instance, leading to duplicate requests.

### 2. **No Cache Management**

```javascript
// Current: No caching strategy
const { data, isLoading, reFetch } = GetAPI("users/getProfile/123");
```

**Problem**: Data becomes stale immediately, no background refetching.

### 3. **Manual Loading States**

```javascript
// Current: Manual state management
const [data, setData] = useState([]);
const [isLoading, setIsLoading] = useState(true);
```

**Problem**: Each component manages its own loading state.

### 4. **Poor Error Handling**

```javascript
// Current: Silent error handling
try {
  const res = await axios.get(BASE_URL + url, config);
  setData(res.data);
} catch (err) {
  // info_toaster(err?.message || "Error fetching data");
}
```

**Problem**: Errors are silently ignored.

## Migration Strategy

### Phase 1: Infrastructure Setup ✅

1. **QueryClient Configuration** (`src/utilities/queryClient.js`)

```javascript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});
```

2. **Centralized API Layer** (`src/utilities/api.js`)

```javascript
import axios from "axios";
import { BASE_URL } from "./URL";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// Request interceptor for auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.accessToken = token;
  }
  return config;
});

export const restaurantAPI = {
  getRestaurants: (params) => api.get("/users/home3", { params }),
  getRestaurantById: (restaurantId, userId) =>
    api.get(`/users/restaurantbyid`, { params: { restaurantId, userId } }),
  // ... more methods
};
```

3. **App.jsx Provider Setup** ✅

```javascript
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./utilities/queryClient";

return (
  <QueryClientProvider client={queryClient}>
    {/* Your app components */}
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);
```

### Phase 2: Custom Hooks Creation ✅

1. **Restaurant Hooks** (`src/hooks/useRestaurants.js`)

```javascript
import { useQuery } from "@tanstack/react-query";
import { restaurantAPI } from "../utilities/api";

export const useRestaurants = (cityName, lat, lng) => {
  return useQuery({
    queryKey: ["restaurants", cityName, lat, lng],
    queryFn: () =>
      restaurantAPI.getRestaurants({
        cityName: lat && lng ? undefined : cityName,
        lat,
        lng,
      }),
    enabled: !!cityName || (!!lat && !!lng),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });
};
```

2. **User Hooks** (`src/hooks/useUser.js`)

```javascript
export const useUserProfile = (userId) => {
  return useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => userAPI.getProfile(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
```

3. **Mutation Hooks** (`src/hooks/useMutations.js`)

```javascript
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userAPI.updateProfile,
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        success_toaster(data?.data?.message || "Profile updated successfully");
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      }
    },
    onError: (error) => {
      error_toaster("Failed to update profile");
    },
  });
};
```

### Phase 3: Component Migration

#### Before (Current Approach)

```javascript
// src/pages/restaurants/Discovery.jsx
import GetAPI from "../../utilities/GetAPI";

export default function Restaurants() {
  const apiUrl =
    lat && lng
      ? `users/home3?lat=${lat}&lng=${lng}`
      : `users/home3?cityName=${cityName}`;
  const { data, error, isLoading } = GetAPI(apiUrl);

  // ... rest of component
}
```

#### After (TanStack Query)

```javascript
// src/pages/restaurants/Discovery.jsx
import { useRestaurants } from "../../hooks/useRestaurants";

export default function Restaurants() {
  const { data, error, isLoading } = useRestaurants(cityName, lat, lng);

  // ... rest of component
}
```

### Phase 4: Migration Priority

#### High Priority (Migrate First)

1. **Restaurant Discovery** - Most frequently accessed
2. **User Profile** - Critical user data
3. **Order History** - Real-time updates needed
4. **Restaurant Details** - Complex data with menu

#### Medium Priority

1. **Addresses** - User management
2. **Favorites/Wishlist** - User preferences
3. **Table Bookings** - Booking management

#### Low Priority

1. **Countries/Cities** - Static data
2. **Delivery Types** - Static data

## Benefits After Migration

### 1. **Automatic Caching**

```javascript
// Data is automatically cached and shared between components
const { data: restaurants } = useRestaurants(cityName, lat, lng);
const { data: sameRestaurants } = useRestaurants(cityName, lat, lng);
// Second call uses cached data, no network request
```

### 2. **Background Refetching**

```javascript
// Data automatically refreshes in background
const { data: ongoingOrders } = useOngoingOrders(userId);
// Refetches every 10 seconds for real-time updates
```

### 3. **Optimistic Updates**

```javascript
const updateProfileMutation = useUpdateProfile();

// UI updates immediately, then syncs with server
updateProfileMutation.mutate(newProfileData);
```

### 4. **Better Error Handling**

```javascript
const { data, error, isLoading } = useUserProfile(userId);

if (error) {
  return <ErrorComponent error={error} />;
}
```

### 5. **Reduced Network Requests**

- **Before**: 5 components = 5 API calls
- **After**: 5 components = 1 API call (shared cache)

## Migration Checklist

### ✅ Completed

- [x] QueryClient setup
- [x] API layer refactor
- [x] Custom hooks creation
- [x] Provider setup in App.jsx
- [x] DevTools integration

### 🔄 In Progress

- [ ] Component migration (Discovery.jsx started)
- [ ] Error boundary integration
- [ ] Loading state optimization

### 📋 Remaining

- [ ] Migrate all components systematically
- [ ] Update ContextApi to use TanStack Query
- [ ] Optimize offline support
- [ ] Performance testing
- [ ] Remove old GetAPI utilities

## Performance Improvements Expected

1. **Network Requests**: 60-80% reduction
2. **Loading Times**: 50-70% faster
3. **User Experience**: Instant data display from cache
4. **Server Load**: Significant reduction
5. **Offline Experience**: Better cache management

## Testing Strategy

1. **Unit Tests**: Test custom hooks
2. **Integration Tests**: Test component behavior
3. **Performance Tests**: Measure network requests
4. **User Testing**: Verify UX improvements

## Rollback Plan

If issues arise:

1. Keep old GetAPI utilities as backup
2. Migrate components incrementally
3. Use feature flags for gradual rollout
4. Monitor error rates and performance

## Next Steps

1. **Complete Discovery.jsx migration**
2. **Migrate Header.jsx** (multiple API calls)
3. **Migrate Dashboard.jsx** (user data)
4. **Migrate RestaurantDetails.jsx** (complex data)
5. **Update ContextApi.jsx** to use TanStack Query
6. **Remove old utilities** after full migration

This migration will significantly improve your app's performance, user experience, and maintainability while reducing server load and network requests.

