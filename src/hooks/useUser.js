import { useQuery } from "@tanstack/react-query";
import { userAPI } from "../utilities/api";

// Hook for fetching user profile
export const useUserProfile = (userId) => {
  return useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => userAPI.getProfile(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes for profile data
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  });
};

// Hook for fetching user addresses
export const useUserAddresses = () => {
  return useQuery({
    queryKey: ["user-addresses"],
    queryFn: () => userAPI.getAddresses(),
    staleTime: 10 * 60 * 1000, // 10 minutes for addresses
    gcTime: 15 * 60 * 1000, // 15 minutes cache
  });
};

// Hook for fetching order history
export const useOrderHistory = () => {
  return useQuery({
    queryKey: ["order-history"],
    queryFn: () => userAPI.getOrderHistory(),
    staleTime: 1 * 60 * 1000, // 1 minute for order history
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

// Hook for fetching past orders
export const usePastOrders = () => {
  return useQuery({
    queryKey: ["past-orders"],
    queryFn: () => userAPI.getPastOrders(),
    staleTime: 1 * 60 * 1000, // 1 minute for past orders
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

// Hook for fetching ongoing orders
export const useOngoingOrders = (userId) => {
  return useQuery({
    queryKey: ["ongoing-orders", userId],
    queryFn: () => userAPI.getOngoingOrders(userId),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds for ongoing orders
    gcTime: 2 * 60 * 1000, // 2 minutes cache
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
    refetchIntervalInBackground: true,
  });
};

// Hook for fetching table bookings
export const useTableBookings = () => {
  return useQuery({
    queryKey: ["table-bookings"],
    queryFn: () => userAPI.getTableBookings(),
    staleTime: 2 * 60 * 1000, // 2 minutes for table bookings
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

// Hook for fetching stamp card history
export const useStampCardHistory = (userId) => {
  return useQuery({
    queryKey: ["stamp-card-history", userId],
    queryFn: () => userAPI.getStampCardHistory(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes for stamp card history
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  });
};

