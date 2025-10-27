const CACHE_NAME = "fomino-offline-v2";
const OFFLINE_URL = "/offline.html";

// Utility: ensure we only handle http/https
function isHttpOrHttps(input) {
  try {
    const urlString = typeof input === "string" ? input : input && input.url;
    if (!urlString) return false;
    const { protocol } = new URL(urlString);
    return protocol === "http:" || protocol === "https:";
  } catch (_) {
    return false;
  }
}

// Files to cache for offline functionality
const CACHE_FILES = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/images/favicon.webp",
];

// Install event - cache essential files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache");
        return cache.addAll(CACHE_FILES);
      })
      .catch((error) => {
        console.error("Cache installation failed:", error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - handle offline requests
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Filter out non-HTTP/HTTPS requests to avoid unsupported scheme errors
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return;
  }

  // Handle API requests
  if (url.pathname.includes("/api/") || url.pathname.includes("/users/")) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (
    request.destination === "image" ||
    request.destination === "style" ||
    request.destination === "script"
  ) {
    event.respondWith(handleStaticAsset(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }
});

// Handle API requests with offline support
async function handleApiRequest(request) {
  try {
    // Try to fetch from network first
    const networkResponse = await fetch(request);

    // Clone the response for caching
    const responseClone = networkResponse.clone();

    // Cache successful responses (GET only)
    if (
      networkResponse.ok &&
      isHttpOrHttps(request) &&
      request.method === "GET"
    ) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, responseClone);
    }

    return networkResponse;
  } catch (error) {
    console.log("Network failed, trying cache:", error);

    // Try to get from cache
    const cachedResponse =
      isHttpOrHttps(request) && request.method === "GET"
        ? await caches.match(request)
        : undefined;
    if (cachedResponse) {
      return cachedResponse;
    }

    // If no cache, return offline response for GET requests
    if (request.method === "GET") {
      return new Response(
        JSON.stringify({
          status: "offline",
          message:
            "You are offline. Data will sync when connection is restored.",
          data: null,
        }),
        {
          status: 503,
          statusText: "Service Unavailable",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // For non-GET requests, throw error
    throw error;
  }
}

// Handle static assets
async function handleStaticAsset(request) {
  // Additional safety check for request scheme
  const url = new URL(request.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return fetch(request);
  }

  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok && isHttpOrHttps(request)) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return a default image or empty response for failed assets
    if (request.destination === "image") {
      return new Response("", {
        status: 404,
        statusText: "Not Found",
      });
    }
    throw error;
  }
}

// Handle navigation requests
async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    // Return offline page for navigation requests
    const offlineResponse = await caches.match(OFFLINE_URL);
    if (offlineResponse) {
      return offlineResponse;
    }

    // Fallback offline page
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offline - Fomino</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px; 
              background: #f5f5f5; 
            }
            .offline-container { 
              max-width: 400px; 
              margin: 0 auto; 
              background: white; 
              padding: 40px; 
              border-radius: 10px; 
              box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            }
            .offline-icon { 
              font-size: 60px; 
              margin-bottom: 20px; 
            }
            h1 { color: #333; margin-bottom: 20px; }
            p { color: #666; line-height: 1.6; }
            .retry-btn { 
              background: #379465; 
              color: white; 
              border: none; 
              padding: 12px 24px; 
              border-radius: 6px; 
              cursor: pointer; 
              margin-top: 20px; 
            }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <div class="offline-icon">📱</div>
            <h1>You're Offline</h1>
            <p>Don't worry! Your cart and saved data are still available. You can continue browsing and your order will be placed when you're back online.</p>
            <button class="retry-btn" onclick="window.location.reload()">Try Again</button>
          </div>
        </body>
      </html>
    `,
      {
        status: 200,
        statusText: "OK",
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  }
}

// Background sync for offline data
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(syncOfflineData());
  }
});

// Sync offline data when connection is restored
async function syncOfflineData() {
  try {
    // Get offline data from IndexedDB
    const offlineData = await getOfflineData();

    if (offlineData && offlineData.length > 0) {
      console.log("Syncing offline data:", offlineData);

      // Process each offline action
      for (const data of offlineData) {
        try {
          await fetch(data.url, {
            method: data.method,
            headers: data.headers,
            body: data.body,
          });

          // Remove synced data
          await removeOfflineData(data.id);
        } catch (error) {
          console.error("Failed to sync data:", error);
        }
      }
    }
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}

// Helper functions for IndexedDB operations
async function getOfflineData() {
  return new Promise((resolve) => {
    const request = indexedDB.open("FominoOfflineDB", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("offlineData")) {
        db.createObjectStore("offlineData", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(["offlineData"], "readonly");
      const store = transaction.objectStore("offlineData");
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result);
      };
    };

    request.onerror = () => {
      resolve([]);
    };
  });
}

async function removeOfflineData(id) {
  return new Promise((resolve) => {
    const request = indexedDB.open("FominoOfflineDB", 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(["offlineData"], "readwrite");
      const store = transaction.objectStore("offlineData");
      const deleteRequest = store.delete(id);

      deleteRequest.onsuccess = () => {
        resolve();
      };
    };
  });
}

// Message handling for communication with main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CACHE_API_RESPONSE") {
    event.waitUntil(
      (async () => {
        try {
          const req = event.data.request;
          const res = event.data.response;
          if (!req || !res) return;
          // Only cache http/https requests
          if (!isHttpOrHttps(req)) return;
          // Only cache GET requests per Cache API limitations
          if (req.method && req.method !== "GET") return;
          const cache = await caches.open(CACHE_NAME);
          await cache.put(req, res);
        } catch (e) {
          // Swallow caching errors for unsupported schemes
          console.warn("Skipped caching message-provided response:", e);
        }
      })()
    );
  }
});
