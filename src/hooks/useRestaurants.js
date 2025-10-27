import { useQuery } from "@tanstack/react-query";
import { restaurantAPI } from "../utilities/api";

// Hook for fetching restaurants by location
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
    staleTime: 2 * 60 * 1000, // 2 minutes for restaurant list
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

// Hook for fetching restaurant details
export const useRestaurantDetails = (restaurantId, userId) => { 
  return useQuery({
    queryKey: ["restaurant", restaurantId, userId],
    queryFn: () => restaurantAPI.getRestaurantById(restaurantId, userId),
    enabled: !!restaurantId,
    staleTime: 1 * 60 * 1000, // 1 minute for restaurant details
    gcTime: 3 * 60 * 1000, // 3 minutes cache
  });
};

// Hook for fetching restaurant menu
export const useRestaurantMenu = (restaurantId) => {
  return useQuery({
    queryKey: ["restaurant-menu", restaurantId],
    queryFn: () => restaurantAPI.getMenu(restaurantId),
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000, // 5 minutes for menu data
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  });
};

// Hook for fetching restaurant stamps and banners
export const useRestaurantStampsAndBanners = (restaurantId, userId) => {
  return useQuery({
    queryKey: ["restaurant-stamps-banners", restaurantId, userId],
    queryFn: () => restaurantAPI.getStampsAndBanners(restaurantId, userId),
    enabled: !!restaurantId,
    staleTime: 10 * 60 * 1000, // 10 minutes for stamp card data
    gcTime: 15 * 60 * 1000, // 15 minutes cache
  });
};

// Hook for fetching delivery types
export const useDeliveryTypes = () => {
  return useQuery({
    queryKey: ["delivery-types"],
    queryFn: () => restaurantAPI.getDeliveryTypes(),
    staleTime: 30 * 60 * 1000, // 30 minutes for static data
    gcTime: 60 * 60 * 1000, // 1 hour cache
  });
};

// Hook for fetching wishlist
export const useWishlist = () => {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: () => restaurantAPI.getWishlist(),
    staleTime: 1 * 60 * 1000, // 1 minute for wishlist
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

// Hook for fetching favorite restaurants
export const useFavoriteRestaurants = (userId) => {
  return useQuery({
    queryKey: ["favorite-restaurants", userId],
    queryFn: () => restaurantAPI.getFavoriteRestaurants(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes for favorites
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });
};
