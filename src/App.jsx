import React, { useEffect, useRef, useState, Suspense } from "react";
import "./App.css";
import { ChakraProvider } from "@chakra-ui/react";
import { ToastContainer, Zoom } from "react-toastify";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import NoInternet from "./pages/errors/NoInternet";
import { useJsApiLoader } from "@react-google-maps/api";
import { ErrorBoundary } from "@sentry/react";
import Loader from "./components/Loader";
import CustomRoutes from "./routes";
import { googleApiKey } from "./utilities/URL";
import socket from "./utilities/Socket";
import { DataProvider } from "./utilities/ContextApi";
import GroupIcon from "./components/GroupIcon";
import "./i18n";
import ScrollToTop from "./scrollToTop";
import OrderIcon from "./components/OrderIcon";
import OfflineStatus from "./components/OfflineStatus";
import offlineManager from "./utilities/OfflineManager.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./utilities/queryClient";

const googleMapsLibraries = ["places"];
const googleMapsApiKey = googleApiKey;

export default function App() {
  const containerRef = useRef(null);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: googleMapsApiKey,
    libraries: googleMapsLibraries,
  });
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);
  const [iconPositions, setIconPositions] = useState({ groupIconTop: 80 });
  const { pathname } = location;
  const shouldShowIcons = pathname !== "/timeline";

  useEffect(() => {
    function handleOnlineStatusChange() {
      setIsOnline(window.navigator.onLine);
    }
    window.addEventListener("online", handleOnlineStatusChange);
    window.addEventListener("offline", handleOnlineStatusChange);

    const initOfflineManager = async () => {
      try {
        await offlineManager.init();
        await offlineManager.restoreState();
        await offlineManager.preloadOfflineData();
      } catch (error) {
        console.error("Failed to initialize offline manager:", error);
      }
    };
    initOfflineManager();

    return () => {
      window.removeEventListener("online", handleOnlineStatusChange);
      window.removeEventListener("offline", handleOnlineStatusChange);
    };
  }, []);

  if (!isLoaded) return <Loader />;

  return (
    <QueryClientProvider client={queryClient}>
      <div className="">
        <OfflineStatus />
        <div className="relative" ref={containerRef}>
          <ToastContainer transition={Zoom} />
          <ChakraProvider>
            <ErrorBoundary fallback={<p>Something went wrong.</p>}>
              <DataProvider>
                <Suspense fallback={<Loader />}>
                  <Router>
                    <ScrollToTop />
                    <Routes>
                      {CustomRoutes?.map((cusRoute, index) => (
                        <Route
                          exact
                          key={index}
                          path={cusRoute.path}
                          element={cusRoute.element}
                        />
                      ))}
                    </Routes>

                    {shouldShowIcons && (
                      <>
                        <GroupIcon
                          containerRef={containerRef}
                          style={{
                            position: "absolute",
                            zIndex: 100,
                            top: `${iconPositions.groupIconTop}px`,
                            right: "10px",
                          }}
                        />
                        <OrderIcon
                          containerRef={containerRef}
                          style={{
                            position: "absolute",
                            zIndex: 100,
                            top: `${iconPositions.groupIconTop}px`,
                            right: "10px",
                          }}
                        />
                      </>
                    )}
                  </Router>
                </Suspense>
              </DataProvider>
            </ErrorBoundary>
          </ChakraProvider>
        </div>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
