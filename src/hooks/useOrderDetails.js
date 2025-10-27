import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../utilities/URL";

// Hook for fetching order details
export const useOrderDetails = (orderId) => {
  return useQuery({
    queryKey: ["order-details", orderId],
    queryFn: async () => {
      const config = {
        headers: {
          accessToken: localStorage.getItem("accessToken"),
        },
      };
      const response = await axios.get(
        `${BASE_URL}users/orderdetailsfood/${orderId}`,
        config
      );
      return response.data;
    },
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes for order details
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: false, // Don't refetch on window focus for order details
  });
};

