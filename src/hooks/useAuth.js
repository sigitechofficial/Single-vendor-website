import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userAPI } from "../utilities/api";
import { PostAPI, loginAPI } from "../utilities/PostAPI";
import { success_toaster, error_toaster, info_toaster } from "../utilities/Toaster";

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials) => {
      const response = await loginAPI("frontsite/login", credentials);
      return response;
    },
    onSuccess: (data, variables) => {
      if (data?.data?.status === "1") {
        success_toaster(data?.data?.message);
        localStorage.setItem("accessToken", data?.data?.data?.accessToken);
        localStorage.setItem("userId", data?.data?.data?.userId);
        localStorage.setItem("userEmail", data?.data?.data?.email);
        localStorage.setItem("userNumber", data?.data?.data?.phoneNum);
        localStorage.setItem(
          "userName",
          `${data?.data?.data?.firstName} ${data?.data?.data?.lastName}`
        );

        // Invalidate user-related queries
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
        queryClient.invalidateQueries({ queryKey: ["all-carts"] });
      } else {
        error_toaster(data?.data?.message);
      }
    },
    onError: (error) => {
      error_toaster("Login failed");
      console.error("Login error:", error);
    },
  });
};

// Registration mutation
export const useRegister = () => {
  return useMutation({
    mutationFn: async (registrationData) => {
      const response = await loginAPI("users/register", registrationData);
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        success_toaster(data?.data?.message);
        localStorage.setItem("userId", data?.data?.data?.userId);
        localStorage.setItem("email", data?.data?.data?.email);
      } else {
        error_toaster(data?.data?.message);
      }
    },
    onError: (error) => {
      error_toaster("Registration failed");
      console.error("Registration error:", error);
    },
  });
};

// Frontend registration (for social logins)
export const useFrontendRegister = () => {
  return useMutation({
    mutationFn: async (registrationData) => {
      const response = await loginAPI("frontsite/register", registrationData);
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        success_toaster(data?.data?.message);
        localStorage.setItem("accessToken", data?.data?.data?.accessToken);
        localStorage.setItem("userId", data?.data?.data?.userId);
        localStorage.setItem("userEmail", data?.data?.data?.email);
        localStorage.setItem("userNumber", data?.data?.data?.phoneNum);
        localStorage.setItem(
          "userName",
          `${data?.data?.data?.firstName} ${data?.data?.data?.lastName}`
        );
      } else {
        error_toaster(data?.data?.message);
      }
    },
    onError: (error) => {
      error_toaster("Registration failed");
      console.error("Frontend registration error:", error);
    },
  });
};

// Email verification
export const useVerifyEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (verificationData) => {
      const response = await loginAPI("users/verifyEmail", verificationData);
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        success_toaster(data?.data?.message);
        localStorage.setItem("accessToken", data?.data?.data?.accessToken);
        localStorage.setItem(
          "userName",
          `${data?.data?.data?.firstName} ${data?.data?.data?.lastName}`
        );
        localStorage.removeItem("email");

        // Invalidate user-related queries
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      } else {
        error_toaster(data?.data?.message);
      }
    },
    onError: (error) => {
      error_toaster("Email verification failed");
      console.error("Email verification error:", error);
    },
  });
};

// Email checker
export const useEmailChecker = () => {
  return useMutation({
    mutationFn: async (emailData) => {
      const response = await loginAPI("frontsite/emailChecker", emailData);
      return response;
    },
    onError: (error) => {
      console.error("Email checker error:", error);
    },
  });
};

// OTP verification for email change
export const useVerifyEmailChangeOTP = () => {
  return useMutation({
    mutationFn: async (otpData) => {
      const response = await PostAPI("frontsite/verifyOTPForEmailChange", otpData);
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        success_toaster("Email updated successfully");
      } else {
        error_toaster(data?.data?.message || "Invalid OTP. Please try again.");
      }
    },
    onError: (error) => {
      error_toaster("Failed to verify OTP for email change");
      console.error("Email change OTP verification error:", error);
    },
  });
};

// Delete account OTP
export const useSendDeleteAccountOTP = () => {
  return useMutation({
    mutationFn: async (userData) => {
      const response = await PostAPI("users/sendDeleteAccountOTP", userData);
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        info_toaster("OTP sent successfully");
      } else {
        error_toaster(data?.data?.message);
      }
    },
    onError: (error) => {
      error_toaster("Failed to send delete account OTP");
      console.error("Send delete account OTP error:", error);
    },
  });
};

// Delete account
export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: async (deleteData) => {
      const response = await PostAPI("users/deleteAccount", deleteData);
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        success_toaster("Account deleted successfully");
        localStorage.clear();
      } else {
        error_toaster(data?.data?.message || "Failed to delete account");
      }
    },
    onError: (error) => {
      error_toaster("Failed to delete account");
      console.error("Delete account error:", error);
    },
  });
};

// Table booking details
export const useTableBookingDetails = () => {
  return useMutation({
    mutationFn: async (bookingData) => {
      const response = await PostAPI("users/tableBookingDetails", bookingData);
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        // Success handled by component
      } else {
        error_toaster(data?.data?.message);
      }
    },
    onError: (error) => {
      error_toaster("Failed to get booking details");
      console.error("Table booking details error:", error);
    },
  });
};

// Group order details
export const useGroupOrderDetails = () => {
  return useMutation({
    mutationFn: async (groupData) => {
      const response = await PostAPI("users/groupOrderDetails", groupData);
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.status === "1") {
        // Success handled by component
      } else {
        error_toaster(data?.data?.message);
      }
    },
    onError: (error) => {
      error_toaster("Failed to get group order details");
      console.error("Group order details error:", error);
    },
  });
};