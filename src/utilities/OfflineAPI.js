import offlineManager from "./OfflineManager.js";
import { BASE_URL } from "./URL.js";

class OfflineAPI {
  constructor() {
    this.baseURL = BASE_URL;
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  // Enhanced GET request with offline support
  async get(endpoint, options = {}) {
    const url = this.buildUrl(endpoint);
    const cacheKey = this.generateCacheKey("GET", url, options);

    try {
      // Try network first
      const response = await this.makeRequest(url, {
        method: "GET",
        ...options,
      });

      // Cache successful responses
      if (response.ok) {
        this.cacheResponse(cacheKey, response);
        return response;
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      console.log("Network request failed, trying cache:", error);

      // Try to get from cache
      const cachedResponse = await this.getCachedResponse(cacheKey);
      if (cachedResponse) {
        return cachedResponse;
      }

      // If no cache and offline, return offline response
      if (!navigator.onLine) {
        return this.createOfflineResponse(endpoint);
      }

      throw error;
    }
  }

  // Enhanced POST request with offline support
  async post(endpoint, data = {}, options = {}) {
    const url = this.buildUrl(endpoint);
    const isOnline = navigator.onLine;

    try {
      if (!isOnline) {
        // Save for later sync if offline
        await this.saveOfflineAction({
          type: "POST",
          url,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
          body: JSON.stringify(data),
        });

        return this.createOfflineResponse(endpoint, "POST");
      }

      const response = await this.makeRequest(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        body: JSON.stringify(data),
        ...options,
      });

      return response;
    } catch (error) {
      if (!isOnline) {
        // Save for later sync if offline
        await this.saveOfflineAction({
          type: "POST",
          url,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
          body: JSON.stringify(data),
        });

        return this.createOfflineResponse(endpoint, "POST");
      }

      throw error;
    }
  }

  // Enhanced PUT request with offline support
  async put(endpoint, data = {}, options = {}) {
    const url = this.buildUrl(endpoint);
    const isOnline = navigator.onLine;

    try {
      if (!isOnline) {
        await this.saveOfflineAction({
          type: "PUT",
          url,
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
          body: JSON.stringify(data),
        });

        return this.createOfflineResponse(endpoint, "PUT");
      }

      const response = await this.makeRequest(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        body: JSON.stringify(data),
        ...options,
      });

      return response;
    } catch (error) {
      if (!isOnline) {
        await this.saveOfflineAction({
          type: "PUT",
          url,
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
          body: JSON.stringify(data),
        });

        return this.createOfflineResponse(endpoint, "PUT");
      }

      throw error;
    }
  }

  // Enhanced DELETE request with offline support
  async delete(endpoint, options = {}) {
    const url = this.buildUrl(endpoint);
    const isOnline = navigator.onLine;

    try {
      if (!isOnline) {
        await this.saveOfflineAction({
          type: "DELETE",
          url,
          method: "DELETE",
          headers: options.headers || {},
          body: null,
        });

        return this.createOfflineResponse(endpoint, "DELETE");
      }

      const response = await this.makeRequest(url, {
        method: "DELETE",
        ...options,
      });

      return response;
    } catch (error) {
      if (!isOnline) {
        await this.saveOfflineAction({
          type: "DELETE",
          url,
          method: "DELETE",
          headers: options.headers || {},
          body: null,
        });

        return this.createOfflineResponse(endpoint, "DELETE");
      }

      throw error;
    }
  }

  // Make actual HTTP request
  async makeRequest(url, options) {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getDefaultHeaders(),
        ...options.headers,
      },
    });

    return response;
  }

  // Build full URL
  buildUrl(endpoint) {
    if (endpoint.startsWith("http")) {
      return endpoint;
    }
    return `${this.baseURL}${endpoint}`;
  }

  // Generate cache key
  generateCacheKey(method, url, options) {
    const params = new URLSearchParams(options.params || {});
    return `${method}:${url}:${params.toString()}`;
  }

  // Cache response
  async cacheResponse(cacheKey, response) {
    try {
      const responseClone = response.clone();
      const data = await responseClone.json();

      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        headers: Object.fromEntries(response.headers.entries()),
      });

      // Also save to IndexedDB for persistence
      await offlineManager.saveUserData(`cache_${cacheKey}`, {
        data,
        timestamp: Date.now(),
        headers: Object.fromEntries(response.headers.entries()),
      });
    } catch (error) {
      console.error("Failed to cache response:", error);
    }
  }

  // Get cached response
  async getCachedResponse(cacheKey) {
    try {
      // Try memory cache first
      const cached = this.cache.get(cacheKey);
      if (cached && this.isCacheValid(cached.timestamp)) {
        return this.createResponseFromCache(cached);
      }

      // Try IndexedDB cache
      const dbCached = await offlineManager.getUserData(`cache_${cacheKey}`);
      if (dbCached && this.isCacheValid(dbCached.timestamp)) {
        // Update memory cache
        this.cache.set(cacheKey, dbCached);
        return this.createResponseFromCache(dbCached);
      }

      return null;
    } catch (error) {
      console.error("Failed to get cached response:", error);
      return null;
    }
  }

  // Check if cache is still valid (24 hours)
  isCacheValid(timestamp) {
    const cacheAge = Date.now() - timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    return cacheAge < maxAge;
  }

  // Create response from cached data
  createResponseFromCache(cached) {
    return new Response(JSON.stringify(cached.data), {
      status: 200,
      statusText: "OK",
      headers: {
        "Content-Type": "application/json",
        "X-Cache": "HIT",
        ...cached.headers,
      },
    });
  }

  // Create offline response
  createOfflineResponse(endpoint, method = "GET") {
    const offlineData = this.getOfflineDataForEndpoint(endpoint);

    return new Response(
      JSON.stringify({
        status: "offline",
        message: "You are offline. Data will sync when connection is restored.",
        data: offlineData,
        offline: true,
      }),
      {
        status: 503,
        statusText: "Service Unavailable",
        headers: {
          "Content-Type": "application/json",
          "X-Offline": "true",
        },
      }
    );
  }

  // Get offline data for specific endpoints
  getOfflineDataForEndpoint(endpoint) {
    // Return appropriate offline data based on endpoint
    if (endpoint.includes("cart")) {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    }

    if (endpoint.includes("user")) {
      return {
        userId: localStorage.getItem("userId"),
        profile: JSON.parse(localStorage.getItem("userProfile") || "{}"),
      };
    }

    if (endpoint.includes("restaurant")) {
      return JSON.parse(localStorage.getItem("activeResData") || "{}");
    }

    return null;
  }

  // Save offline action for later sync
  async saveOfflineAction(action) {
    try {
      await offlineManager.saveOfflineAction(action);
      console.log("Offline action saved:", action);
    } catch (error) {
      console.error("Failed to save offline action:", error);
    }
  }

  // Get default headers
  getDefaultHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };

    // Add auth token if available
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache size
  getCacheSize() {
    return this.cache.size;
  }

  // Preload important data for offline use
  async preloadOfflineData() {
    try {
      const endpoints = [
        "users/getCountriesAndCities",
        "users/alladdresses",
        "users/getProfile",
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await this.get(endpoint);
          if (response.ok) {
            console.log(`Preloaded data for ${endpoint}`);
          }
        } catch (error) {
          console.error(`Failed to preload ${endpoint}:`, error);
        }
      }
    } catch (error) {
      console.error("Failed to preload offline data:", error);
    }
  }

  // Sync all offline actions
  async syncOfflineActions() {
    try {
      const actions = await offlineManager.getOfflineActions();

      for (const action of actions) {
        try {
          const response = await this.makeRequest(action.url, {
            method: action.method,
            headers: action.headers,
            body: action.body,
          });

          if (response.ok) {
            await offlineManager.removeOfflineAction(action.id);
            console.log("Synced offline action:", action);
          }
        } catch (error) {
          console.error("Failed to sync action:", error);
        }
      }
    } catch (error) {
      console.error("Failed to sync offline actions:", error);
    }
  }
}

// Create singleton instance
const offlineAPI = new OfflineAPI();

export default offlineAPI;
