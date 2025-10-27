import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../utilities/URL";

// Hook for fetching user ongoing orders
export const useUserOnGoingOrders = (userId) => {
  return useQuery({
    queryKey: ["user-on-going-orders", userId],
    queryFn: async () => {
      const config = {
        headers: {
          accessToken: localStorage.getItem("accessToken"),
        },
      };
      const response = await axios.get(
        `${BASE_URL}users/userOnGoingOrders/${userId}`,
        config
      );
      return response.data;
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds for ongoing orders (frequent updates)
    gcTime: 2 * 60 * 1000, // 2 minutes cache
    refetchOnWindowFocus: true, // Refetch when user comes back to tab
    refetchInterval: 60 * 1000, // Refetch every minute for real-time updates
  });
};

