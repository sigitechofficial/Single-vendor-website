class OfflineManager {
  constructor() {
    this.dbName = "FominoOfflineDB";
    this.dbVersion = 1;
    this.stores = {
      cart: "cart",
      orders: "orders",
      userData: "userData",
      restaurantData: "restaurantData",
      offlineActions: "offlineActions",
    };
    this.isOnline = navigator.onLine;
    this.init();
  }

  async init() {
    await this.initDatabase();
    this.setupEventListeners();
    this.registerServiceWorker();
  }

  async initDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error("Failed to open IndexedDB:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log("IndexedDB initialized successfully");
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains(this.stores.cart)) {
          const cartStore = db.createObjectStore(this.stores.cart, {
            keyPath: "id",
          });
          cartStore.createIndex("restaurantId", "restaurantId", {
            unique: false,
          });
        }

        if (!db.objectStoreNames.contains(this.stores.orders)) {
          const ordersStore = db.createObjectStore(this.stores.orders, {
            keyPath: "id",
            autoIncrement: true,
          });
          ordersStore.createIndex("userId", "userId", { unique: false });
          ordersStore.createIndex("status", "status", { unique: false });
        }

        if (!db.objectStoreNames.contains(this.stores.userData)) {
          db.createObjectStore(this.stores.userData, { keyPath: "key" });
        }

        if (!db.objectStoreNames.contains(this.stores.restaurantData)) {
          const restaurantStore = db.createObjectStore(
            this.stores.restaurantData,
            { keyPath: "id" }
          );
          restaurantStore.createIndex("lastUpdated", "lastUpdated", {
            unique: false,
          });
        }

        if (!db.objectStoreNames.contains(this.stores.offlineActions)) {
          const actionsStore = db.createObjectStore(
            this.stores.offlineActions,
            { keyPath: "id", autoIncrement: true }
          );
          actionsStore.createIndex("type", "type", { unique: false });
          actionsStore.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
    });
  }

  setupEventListeners() {
    // Online/offline detection
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.onOnline();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.onOffline();
    });

    // Before unload - save current state
    window.addEventListener("beforeunload", () => {
      this.saveCurrentState();
    });
  }

  async registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("Service Worker registered:", registration);

        // Handle service worker updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New service worker available
              this.showUpdateNotification();
            }
          });
        });
      } catch (error) {
        console.error("Service Worker registration failed:", error);
      }
    }
  }

  // Cart Management
  async saveCart(cartData) {
    if (!this.db) return;

    const transaction = this.db.transaction([this.stores.cart], "readwrite");
    const store = transaction.objectStore(this.stores.cart);

    // Save cart with timestamp
    const cartToSave = {
      ...cartData,
      lastUpdated: new Date().toISOString(),
      restaurantId: cartData.restaurantId || localStorage.getItem("resId"),
    };

    await store.put(cartToSave);
    console.log("Cart saved to IndexedDB");
  }

  async getCart(restaurantId = null) {
    if (!this.db) return null;

    const transaction = this.db.transaction([this.stores.cart], "readonly");
    const store = transaction.objectStore(this.stores.cart);

    if (restaurantId) {
      const index = store.index("restaurantId");
      const request = index.get(restaurantId);
      return new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
      });
    } else {
      const request = store.getAll();
      return new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve([]);
      });
    }
  }

  async clearCart(restaurantId = null) {
    if (!this.db) return;

    const transaction = this.db.transaction([this.stores.cart], "readwrite");
    const store = transaction.objectStore(this.stores.cart);

    if (restaurantId) {
      const index = store.index("restaurantId");
      const request = index.delete(restaurantId);
    } else {
      const request = store.clear();
    }
  }

  // Order Management
  async saveOrder(orderData) {
    if (!this.db) return;

    const transaction = this.db.transaction([this.stores.orders], "readwrite");
    const store = transaction.objectStore(this.stores.orders);

    const orderToSave = {
      ...orderData,
      timestamp: new Date().toISOString(),
      status: "pending",
      synced: false,
    };

    await store.add(orderToSave);
    console.log("Order saved to IndexedDB");
  }

  async getOrders(userId = null) {
    if (!this.db) return [];

    const transaction = this.db.transaction([this.stores.orders], "readonly");
    const store = transaction.objectStore(this.stores.orders);

    if (userId) {
      const index = store.index("userId");
      const request = index.getAll(userId);
      return new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve([]);
      });
    } else {
      const request = store.getAll();
      return new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve([]);
      });
    }
  }

  async updateOrderStatus(orderId, status) {
    if (!this.db) return;

    const transaction = this.db.transaction([this.stores.orders], "readwrite");
    const store = transaction.objectStore(this.stores.orders);

    const order = await store.get(orderId);
    if (order) {
      order.status = status;
      order.synced = true;
      await store.put(order);
    }
  }

  // User Data Management
  async saveUserData(key, data) {
    if (!this.db) return;

    const transaction = this.db.transaction(
      [this.stores.userData],
      "readwrite"
    );
    const store = transaction.objectStore(this.stores.userData);

    await store.put({ key, data, timestamp: new Date().toISOString() });
  }

  async getUserData(key) {
    if (!this.db) return null;

    const transaction = this.db.transaction([this.stores.userData], "readonly");
    const store = transaction.objectStore(this.stores.userData);

    const request = store.get(key);
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result?.data || null);
      request.onerror = () => resolve(null);
    });
  }

  // Restaurant Data Management
  async saveRestaurantData(restaurantData) {
    if (!this.db) return;

    const transaction = this.db.transaction(
      [this.stores.restaurantData],
      "readwrite"
    );
    const store = transaction.objectStore(this.stores.restaurantData);

    const dataToSave = {
      ...restaurantData,
      lastUpdated: new Date().toISOString(),
    };

    await store.put(dataToSave);
  }

  async getRestaurantData(restaurantId) {
    if (!this.db) return null;

    const transaction = this.db.transaction(
      [this.stores.restaurantData],
      "readonly"
    );
    const store = transaction.objectStore(this.stores.restaurantData);

    const request = store.get(restaurantId);
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    });
  }

  // Offline Actions Management
  async saveOfflineAction(action) {
    if (!this.db) return;

    const transaction = this.db.transaction(
      [this.stores.offlineActions],
      "readwrite"
    );
    const store = transaction.objectStore(this.stores.offlineActions);

    const actionToSave = {
      ...action,
      timestamp: new Date().toISOString(),
      synced: false,
    };

    await store.add(actionToSave);
  }

  async getOfflineActions() {
    if (!this.db) return [];

    const transaction = this.db.transaction(
      [this.stores.offlineActions],
      "readonly"
    );
    const store = transaction.objectStore(this.stores.offlineActions);

    const request = store.getAll();
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve([]);
    });
  }

  async removeOfflineAction(actionId) {
    if (!this.db) return;

    const transaction = this.db.transaction(
      [this.stores.offlineActions],
      "readwrite"
    );
    const store = transaction.objectStore(this.stores.offlineActions);

    await store.delete(actionId);
  }

  // State Management
  async saveCurrentState() {
    try {
      // Save cart
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      if (cart.length > 0) {
        await this.saveCart({
          items: cart,
          restaurantId: localStorage.getItem("resId"),
          userId: localStorage.getItem("userId"),
        });
      }

      // Save user data
      const userData = {
        userId: localStorage.getItem("userId"),
        userProfile: localStorage.getItem("userProfile"),
        addresses: localStorage.getItem("addresses"),
        preferences: localStorage.getItem("preferences"),
      };

      await this.saveUserData("userData", userData);
    } catch (error) {
      console.error("Failed to save current state:", error);
    }
  }

  async restoreState() {
    try {
      // Restore cart
      const savedCart = await this.getCart(localStorage.getItem("resId"));
      if (savedCart && savedCart.items) {
        localStorage.setItem("cart", JSON.stringify(savedCart.items));
      }

      // Restore user data
      const userData = await this.getUserData("userData");
      if (userData) {
        Object.keys(userData).forEach((key) => {
          if (userData[key]) {
            localStorage.setItem(key, userData[key]);
          }
        });
      }
    } catch (error) {
      console.error("Failed to restore state:", error);
    }
  }

  // Online/Offline Handlers
  async onOnline() {
    console.log("Connection restored");

    // Sync offline data
    await this.syncOfflineData();

    // Update UI
    this.updateOnlineStatus(true);

    // Show notification
    this.showOnlineNotification();
  }

  async onOffline() {
    console.log("Connection lost");

    // Save current state
    await this.saveCurrentState();

    // Update UI
    this.updateOnlineStatus(false);

    // Show notification
    this.showOfflineNotification();
  }

  async syncOfflineData() {
    try {
      const offlineActions = await this.getOfflineActions();

      for (const action of offlineActions) {
        try {
          // Execute the action
          const response = await fetch(action.url, {
            method: action.method,
            headers: action.headers,
            body: action.body,
          });

          if (response.ok) {
            // Remove successful action
            await this.removeOfflineAction(action.id);
          }
        } catch (error) {
          console.error("Failed to sync action:", error);
        }
      }

      // Sync pending orders
      const pendingOrders = await this.getOrders();
      for (const order of pendingOrders) {
        if (!order.synced) {
          try {
            // Attempt to sync order
            const response = await fetch("/api/orders", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(order),
            });

            if (response.ok) {
              await this.updateOrderStatus(order.id, "synced");
            }
          } catch (error) {
            console.error("Failed to sync order:", error);
          }
        }
      }
    } catch (error) {
      console.error("Failed to sync offline data:", error);
    }
  }

  // UI Updates
  updateOnlineStatus(isOnline) {
    // Dispatch custom event for components to listen to
    window.dispatchEvent(
      new CustomEvent("connectionStatusChanged", {
        detail: { isOnline },
      })
    );
  }

  showOnlineNotification() {
    // You can integrate this with your existing toast system
    if (window.showToast) {
      window.showToast(
        "Connection restored! Your data has been synced.",
        "success"
      );
    }
  }

  showOfflineNotification() {
    if (window.showToast) {
      window.showToast(
        "You are offline. Your data will be saved locally.",
        "info"
      );
    }
  }

  showUpdateNotification() {
    if (window.showToast) {
      window.showToast(
        "New version available. Please refresh the page.",
        "info"
      );
    }
  }

  // Utility Methods
  async preloadOfflineData() {
    try {
      // Preload essential data for offline use
      const userId = localStorage.getItem("userId");
      const restaurantId = localStorage.getItem("resId");
      
      // Save current cart state
      await this.saveCurrentState();
      
      // You can add more preloading logic here
      console.log("Offline data preloaded successfully");
    } catch (error) {
      console.error("Failed to preload offline data:", error);
    }
  }

  isOnline() {
    return this.isOnline;
  }

  async clearAllData() {
    if (!this.db) return;

    const stores = Object.values(this.stores);
    const transaction = this.db.transaction(stores, "readwrite");

    for (const storeName of stores) {
      const store = transaction.objectStore(storeName);
      await store.clear();
    }
  }

  async getDatabaseSize() {
    if (!this.db) return 0;

    let totalSize = 0;
    const stores = Object.values(this.stores);

    for (const storeName of stores) {
      const transaction = this.db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      const data = await new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve([]);
      });

      totalSize += JSON.stringify(data).length;
    }

    return totalSize;
  }
}

// Create singleton instance
const offlineManager = new OfflineManager();

export default offlineManager;
