import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userAPI, restaurantAPI, orderAPI } from "../utilities/api";
import { success_toaster, error_toaster } from "../utilities/Toaster";

// User profile mutations
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userAPI.updateProfile,
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        success_toaster(data?.data?.message || "Profile updated successfully");
        // Invalidate and refetch profile data
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      } else {
        error_toaster(data?.data?.message || "Failed to update profile");
      }
    },
    onError: (error) => {
      error_toaster("Failed to update profile");
      console.error("Update profile error:", error);
    },
  });
};

// Address mutations
export const useAddAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userAPI.addAddress,
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        success_toaster(data?.data?.message || "Address added successfully");
        queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
      } else {
        error_toaster(data?.data?.message || "Failed to add address");
      }
    },
    onError: (error) => {
      error_toaster("Failed to add address");
      console.error("Add address error:", error);
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userAPI.updateAddress,
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        success_toaster(data?.data?.message || "Address updated successfully");
        queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
      } else {
        error_toaster(data?.data?.message || "Failed to update address");
      }
    },
    onError: (error) => {
      error_toaster("Failed to update address");
      console.error("Update address error:", error);
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userAPI.deleteAddress,
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        success_toaster(data?.data?.message || "Address deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
      } else {
        error_toaster(data?.data?.message || "Failed to delete address");
      }
    },
    onError: (error) => {
      error_toaster("Failed to delete address");
      console.error("Delete address error:", error);
    },
  });
};

// Restaurant mutations
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restaurantAPI.toggleFavorite,
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        success_toaster(data?.data?.message || "Favorite updated successfully");
        // Invalidate both wishlist and favorite restaurants
        queryClient.invalidateQueries({ queryKey: ["wishlist"] });
        queryClient.invalidateQueries({ queryKey: ["favorite-restaurants"] });
      } else {
        error_toaster(data?.data?.message || "Failed to update favorite");
      }
    },
    onError: (error) => {
      error_toaster("Failed to update favorite");
      console.error("Toggle favorite error:", error);
    },
  });
};

// Table booking mutations
export const useBookTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userAPI.bookTable,
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        success_toaster(data?.data?.message || "Table booked successfully");
        queryClient.invalidateQueries({ queryKey: ["table-bookings"] });
      } else {
        error_toaster(data?.data?.message || "Failed to book table");
      }
    },
    onError: (error) => {
      error_toaster("Failed to book table");
      console.error("Book table error:", error);
    },
  });
};

// Group order mutations
export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userAPI.deleteGroup,
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        success_toaster(data?.data?.message || "Group deleted successfully");
        // Clear group data from localStorage
        localStorage.removeItem("groupData");
        localStorage.removeItem("groupOrder");
        localStorage.removeItem("gLink");
        localStorage.removeItem("cartItems");
        localStorage.removeItem("hasJoinedGroup");
        localStorage.removeItem("guestJoined");
      } else {
        error_toaster(data?.data?.message || "Failed to delete group");
      }
    },
    onError: (error) => {
      error_toaster("Failed to delete group");
      console.error("Delete group error:", error);
    },
  });
};

export const useLeaveGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userAPI.leaveGroup,
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        success_toaster(data?.data?.message || "Left group successfully");
        // Clear group data from localStorage
        localStorage.removeItem("groupData");
        localStorage.removeItem("groupOrder");
        localStorage.removeItem("gLink");
        localStorage.removeItem("cartItems");
        localStorage.removeItem("orderId");
        localStorage.removeItem("hasJoinedGroup");
        localStorage.removeItem("guestJoined");
      } else {
        error_toaster(data?.data?.message || "Failed to leave group");
      }
    },
    onError: (error) => {
      error_toaster("Failed to leave group");
      console.error("Leave group error:", error);
    },
  });
};

// Order mutations
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderAPI.createOrder,
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        success_toaster(data?.data?.message || "Order created successfully");
        // Invalidate order-related queries
        queryClient.invalidateQueries({ queryKey: ["order-history"] });
        queryClient.invalidateQueries({ queryKey: ["past-orders"] });
        queryClient.invalidateQueries({ queryKey: ["ongoing-orders"] });
      } else {
        error_toaster(data?.data?.message || "Failed to create order");
      }
    },
    onError: (error) => {
      error_toaster("Failed to create order");
      console.error("Create order error:", error);
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderAPI.cancelOrder,
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        success_toaster(data?.data?.message || "Order cancelled successfully");
        // Invalidate order-related queries
        queryClient.invalidateQueries({ queryKey: ["order-history"] });
        queryClient.invalidateQueries({ queryKey: ["past-orders"] });
        queryClient.invalidateQueries({ queryKey: ["ongoing-orders"] });
      } else {
        error_toaster(data?.data?.message || "Failed to cancel order");
      }
    },
    onError: (error) => {
      error_toaster("Failed to cancel order");
      console.error("Cancel order error:", error);
    },
  });
};





