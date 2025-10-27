import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { PostAPI, loginAPI } from "../utilities/PostAPI";
import { BASE_URL, googleApiKey } from "../utilities/URL";
import {
  success_toaster,
  error_toaster,
  info_toaster,
} from "../utilities/Toaster";

// Re-export hooks from other files
export { useCountriesAndCities } from "./useLocation";
export { useFavoriteRestaurants, useRestaurantDetails } from "./useRestaurants";
export { useUserProfile, useUserAddresses, usePastOrders } from "./useUser";

// Hook for fetching all carts
export const useAllCarts = (userId) => {
  return useQuery({
    queryKey: ["all-carts", userId],
    queryFn: async () => {
      const response = await PostAPI("users/getAllCarts", { userId });
      return response;
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds for cart data
    gcTime: 2 * 60 * 1000, // 2 minutes cache
    refetchOnWindowFocus: true, // Refetch when user comes back to tab
  });
};

// Hook for restaurant recommended products
export const useRestaurantRecommendedProducts = (restaurantId) => {
  return useQuery({
    queryKey: ["restaurant-recommended-products", restaurantId],
    queryFn: async () => {
      const response = await PostAPI("users/restaurantRecommendedProducts", {
        restaurantId,
      });
      return response;
    },
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  });
};

// Hook for search products
export const useSearchProducts = (searchTerm, isOpen) => {
  return useQuery({
    queryKey: ["search-products", searchTerm, isOpen],
    queryFn: async () => {
      const response = await PostAPI("users/searchProduct", {
        productName: searchTerm,
        isOpen: isOpen,
      });
      return response;
    },
    enabled: !!searchTerm && searchTerm.trim().length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

// Hook for stock check
export const useStockCheck = (productList) => {
  return useQuery({
    queryKey: ["stock-check", productList],
    queryFn: async () => {
      const response = await PostAPI("users/stockCheck", {
        productList: productList,
      });
      return response;
    },
    enabled: !!productList && productList.length > 0,
    staleTime: 30 * 1000, // 30 seconds for stock data
    gcTime: 2 * 60 * 1000, // 2 minutes cache
  });
};

// Mutations for actions that modify data
export const useAddAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addressData) => {
      const response = await PostAPI("users/addaddress", addressData);
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        success_toaster(data?.data?.message);
        // Invalidate and refetch user addresses
        queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
      } else {
        error_toaster(data?.data?.message);
      }
    },
    onError: () => {
      error_toaster("Failed to add address");
    },
  });
};

export const useDeliveryFee = () => {
  return useMutation({
    mutationFn: async (deliveryData) => {
      const response = await PostAPI("users/deliveryfee", deliveryData);
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        success_toaster(data?.data?.message);
      } else {
        error_toaster(data?.data?.message);
      }
    },
    onError: () => {
      error_toaster("Failed to calculate delivery fee");
    },
  });
};

export const useResendOTP = () => {
  return useMutation({
    mutationFn: async (otpData) => {
      const response = await PostAPI("users/resendotp", otpData);
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        success_toaster(data?.data?.message);
      } else {
        error_toaster(data?.data?.message);
      }
    },
    onError: () => {
      error_toaster("Failed to resend OTP");
    },
  });
};

export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: async (otpData) => {
      const response = await PostAPI("frontsite/verifyOTP", otpData);
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        success_toaster(data?.data?.message);
      } else {
        error_toaster(data?.data?.message);
      }
    },
    onError: () => {
      error_toaster("Failed to verify OTP");
    },
  });
};

export const useResendMergeOTP = () => {
  return useMutation({
    mutationFn: async (emailData) => {
      const response = await PostAPI("frontsite/resendotp", emailData);
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        info_toaster("OTP sent successfully");
      } else {
        error_toaster(data?.data?.message);
      }
    },
    onError: () => {
      error_toaster("Failed to resend OTP");
    },
  });
};

export const useForgetPasswordRequest = () => {
  return useMutation({
    mutationFn: async (emailData) => {
      const response = await PostAPI("users/forgetpasswordrequest", emailData);
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        success_toaster(data?.data?.message);
      } else {
        error_toaster(data?.data?.message);
      }
    },
    onError: () => {
      error_toaster("Failed to send password reset request");
    },
  });
};

export const useForgetPasswordResponse = () => {
  return useMutation({
    mutationFn: async (passwordData) => {
      const response = await PostAPI(
        "users/forgetpasswordresponse",
        passwordData
      );
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        success_toaster("Password reset successfully");
      } else {
        error_toaster(data?.data?.message);
      }
    },
    onError: () => {
      error_toaster("Failed to reset password");
    },
  });
};

export const useDeleteGroup = () => {
  return useMutation({
    mutationFn: async (groupData) => {
      const response = await PostAPI("users/deleteGroup", groupData);
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        info_toaster(data?.data?.message);
        // Clear group-related data from localStorage
        localStorage.removeItem("groupData");
        localStorage.removeItem("groupOrder");
        localStorage.removeItem("gLink");
      } else {
        info_toaster(data?.data?.message);
      }
    },
    onError: () => {
      error_toaster("Failed to delete group");
    },
  });
};

export const useRemoveMember = () => {
  return useMutation({
    mutationFn: async (memberData) => {
      const response = await PostAPI("users/removeMember", memberData);
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        success_toaster(data?.data?.message);
        // Clear group-related data from localStorage
        localStorage.removeItem("groupData");
        localStorage.removeItem("groupOrder");
        localStorage.removeItem("gLink");
      } else {
        info_toaster(data?.data?.message);
      }
    },
    onError: () => {
      error_toaster("Failed to remove member");
    },
  });
};

export const useLeaveGroup = () => {
  return useMutation({
    mutationFn: async (groupData) => {
      const response = await PostAPI("users/leaveGroup", groupData);
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        success_toaster("Group left successfully");
        // Clear all group-related data from localStorage
        localStorage.removeItem("groupData");
        localStorage.removeItem("groupOrder");
        localStorage.removeItem("gLink");
        localStorage.removeItem("cartItems");
        localStorage.removeItem("hasJoinedGroup");
        localStorage.removeItem("guestJoined");
      } else {
        info_toaster(data?.data?.message);
      }
    },
    onError: () => {
      error_toaster("Failed to leave group");
    },
  });
};

export const useAddCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cartData) => {
      const response = await PostAPI("users/addCart", cartData);
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        success_toaster("Cart added successfully");
        // Invalidate and refetch all carts
        queryClient.invalidateQueries({ queryKey: ["all-carts"] });
      } else {
        error_toaster(data?.data?.message);
      }
    },
    onError: () => {
      error_toaster("Failed to add cart");
    },
  });
};

export const useDeleteCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cartData) => {
      const response = await PostAPI("users/deleteCart", cartData);
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        success_toaster("Cart deleted successfully");
        // Invalidate and refetch all carts
        queryClient.invalidateQueries({ queryKey: ["all-carts"] });
      } else {
        info_toaster(data?.data?.message);
      }
    },
    onError: () => {
      error_toaster("Failed to delete cart");
    },
  });
};

export const useLockGroupOrder = () => {
  return useMutation({
    mutationFn: async (lockData) => {
      const response = await PostAPI("users/lockGroupOrder", lockData);
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        success_toaster(data?.data?.message);
      } else {
        info_toaster(data?.data?.message);
      }
    },
    onError: () => {
      error_toaster("Failed to lock/unlock group order");
    },
  });
};

// Hook for Google Geocoding API
export const useGeocode = (lat, lng) => {
  return useQuery({
    queryKey: ["geocode", lat, lng],
    queryFn: async () => {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}`;
      const response = await fetch(geocodeUrl);
      const data = await response.json();
      return data;
    },
    enabled: !!(lat && lng),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache
  });
};

// Hook for getting order details
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
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

// Authentication mutations
export const useLogin = () => {
  return useMutation({
    mutationFn: async (loginData) => {
      const response = await loginAPI("frontsite/login", loginData);
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        success_toaster(data?.data?.message);
      } else if (data?.data?.status !== "2") {
        error_toaster(data?.data?.message);
      }
    },
    onError: () => {
      error_toaster("Login failed");
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (registerData) => {
      const response = await loginAPI("users/register", registerData);
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        success_toaster(data?.data?.message);
      } else {
        error_toaster(data?.data?.message);
      }
    },
    onError: () => {
      error_toaster("Registration failed");
    },
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: async (verifyData) => {
      const response = await loginAPI("users/verifyEmail", verifyData);
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        success_toaster(data?.data?.message);
      } else {
        error_toaster(data?.data?.message);
      }
    },
    onError: () => {
      error_toaster("Email verification failed");
    },
  });
};

export const useEmailChecker = () => {
  return useMutation({
    mutationFn: async (emailData) => {
      const response = await loginAPI("frontsite/emailChecker", emailData);
      return response;
    },
    onError: () => {
      error_toaster("Email check failed");
    },
  });
};

export const useSocialRegister = () => {
  return useMutation({
    mutationFn: async (registerData) => {
      const response = await loginAPI("frontsite/register", registerData);
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        success_toaster(data?.data?.message);
      } else {
        error_toaster(data?.data?.message);
      }
    },
    onError: () => {
      error_toaster("Social registration failed");
    },
  });
};

// Enhanced search hook with TanStack Query
export const useSearchProductsQuery = () => {
  const queryClient = useQueryClient();
  
  return {
    searchProducts: async (searchTerm, isOpen) => {
      const res = await queryClient.fetchQuery({
        queryKey: ["search-products", searchTerm, isOpen],
        queryFn: async () => {
          const response = await PostAPI("users/searchProduct", {
            productName: searchTerm,
            isOpen: isOpen,
            zoneId: parseFloat(localStorage.getItem("zoneId")),
            lat: parseFloat(localStorage.getItem("lat")),
            lng: parseFloat(localStorage.getItem("lng")),
          });
          return response;
        },
      });
      return res;
    },
  };
};

// Enhanced stock check hook with TanStack Query
export const useStockCheckQuery = () => {
  const queryClient = useQueryClient();
  
  return {
    checkStock: async (productList) => {
      const res = await queryClient.fetchQuery({
        queryKey: ["stock-check", productList],
        queryFn: async () => {
          const response = await PostAPI("users/stockCheck", {
            productList: productList,
          });
          return response;
        },
      });
      return res;
    },
  };
};
