import React, { useState, useEffect } from "react";
import {
  FaWifi,
  FaExclamationTriangle,
  FaSync,
  FaCheckCircle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const OfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
      handleSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
    };

    const handleConnectionStatusChange = (event) => {
      setIsOnline(event.detail.isOnline);
      if (!event.detail.isOnline) {
        setShowOfflineBanner(true);
      } else {
        setShowOfflineBanner(false);
        handleSync();
      }
    };

    // Listen for online/offline events
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener(
      "connectionStatusChanged",
      handleConnectionStatusChange
    );

    // Check initial status
    if (!navigator.onLine) {
      setShowOfflineBanner(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener(
        "connectionStatusChanged",
        handleConnectionStatusChange
      );
    };
  }, []);

  const handleSync = async () => {
    if (!isOnline) return;

    setSyncing(true);
    try {
      // Import and use offline manager for sync
      const { default: offlineManager } = await import(
        "../utilities/OfflineManager.js"
      );
      await offlineManager.syncOfflineData();
      setLastSync(new Date());
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setSyncing(false);
    }
  };

  const handleRetry = () => {
    if (isOnline) {
      handleSync();
    } else {
      // Try to reconnect
      window.location.reload();
    }
  };

  if (!showOfflineBanner && isOnline) {
    return null;
  }

  return (
    <AnimatePresence>
      {showOfflineBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-0 left-0 right-0 z-50 p-4 ${
            isOnline ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isOnline ? (
                <FaWifi className="text-xl" />
              ) : (
                <FaExclamationTriangle className="text-xl" />
              )}
              <div>
                <h3 className="font-semibold text-lg">
                  {isOnline ? "Back Online!" : "You're Offline"}
                </h3>
                <p className="text-sm opacity-90 ">
                  {isOnline
                    ? "Your connection has been restored. Syncing your data..."
                    : "Don't worry! Your cart and data are saved locally. You can continue browsing."}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {isOnline && (
                <div className="flex items-center space-x-2">
                  {syncing ? (
                    <FaSync className="animate-spin text-xl" />
                  ) : lastSync ? (
                    <FaCheckCircle className="text-xl" />
                  ) : null}
                  <span className="text-sm">
                    {syncing ? "Syncing..." : lastSync ? "Synced" : ""}
                  </span>
                </div>
              )}

              <button
                onClick={handleRetry}
                disabled={syncing}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isOnline
                    ? "bg-white text-green-500 hover:bg-gray-100"
                    : "bg-white text-red-500 hover:bg-gray-100"
                } ${syncing ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isOnline
                  ? syncing
                    ? "Syncing..."
                    : "Retry"
                  : "Retry Connection"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineStatus;
