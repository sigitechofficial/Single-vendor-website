import axios from "axios";
import { BASE_URL } from "./URL";

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.accessToken = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userId");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Restaurant API
export const restaurantAPI = {
  // Get restaurants by location
   getRestaurants: (params) => api.get("/users/home3", { params }),

  // Get restaurant by ID
  getRestaurantById: (restaurantId, userId) =>
    api.get(`/users/restaurantbyid`, {
      params: { restaurantId, userId },
    }),

  // Get restaurant menu
  getMenu: (restaurantId) => api.get(`/users/menu/${restaurantId}`),

  // Get restaurant stamps and banners
  getStampsAndBanners: (restaurantId, userId) =>
    api.get("/users/userStampsAndBannersForWeb", {
      params: { restaurantId, userId },
    }),

  // Get delivery types
  getDeliveryTypes: () => api.get("/frontsite/deliveryTypes"),

  // Get wishlist
  getWishlist: () => api.get("/frontsite/getWishList"),

  // Get favorite restaurants
  getFavoriteRestaurants: (userId) =>
    api.get(`/frontsite/favRestaurant/${userId}`),

  // Add/remove favorite restaurant
  toggleFavorite: (data) => api.post("/frontsite/toggleFavorite", data),
};

// User API
export const userAPI = {
  // Authentication
  login: (credentials) => api.post("/frontsite/login", credentials),

  // Profile
  getProfile: (userId) => api.get(`/users/getProfile/${userId}`),
  updateProfile: (data) => api.put("/users/updateProfile", data),

  // Addresses
  getAddresses: () => api.get("/users/alladdresses"),
  addAddress: (data) => api.post("/users/addAddress", data),
  updateAddress: (data) => api.put("/users/updateAddress", data),
  deleteAddress: (addressId) => api.delete(`/users/deleteAddress/${addressId}`),

  // Orders
  getOrderHistory: () => api.get("/users/orderhistory"),
  getPastOrders: () => api.get("/users/pastOrders"),
  //   getOngoingOrders: (userId) => api.get(`/users/userOnGoingOrders/${userId}`),

  // Table bookings
  getTableBookings: () => api.get("/users/getTableBookings"),
  bookTable: (data) => api.post("/users/bookTableBooking", data),

  // Stamp card
  getStampCardHistory: (userId) => api.get(`/users/stampCardHistory/${userId}`),

  // Group orders
  deleteGroup: (data) => api.post("/users/deleteGroup", data),
  leaveGroup: (data) => api.post("/users/leaveGroup", data),
};

// Location API
export const locationAPI = {
  // Get countries and cities
  getCountriesAndCities: () => api.get("/users/getCountriesAndCities"),

  // Geocoding (Google Maps)
  getAddressFromCoordinates: (lat, lng, apiKey) =>
    fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    ).then((res) => res.json()),
};

// Order API
export const orderAPI = {
  // Create order
  createOrder: (orderData) => api.post("/users/createOrder", orderData),

  // Update order
  updateOrder: (orderId, data) =>
    api.put(`/users/updateOrder/${orderId}`, data),

  // Get order status
  getOrderStatus: (orderId) => api.get(`/users/orderStatus/${orderId}`),

  // Cancel order
  cancelOrder: (orderId) => api.post(`/users/cancelOrder/${orderId}`),
};

// Payment API
export const paymentAPI = {
  // Get payment methods
  getPaymentMethods: () => api.get("/users/paymentMethods"),

  // Process payment
  processPayment: (paymentData) =>
    api.post("/users/processPayment", paymentData),

  // Get payment status
  getPaymentStatus: (paymentId) => api.get(`/users/paymentStatus/${paymentId}`),
};

export default api;
