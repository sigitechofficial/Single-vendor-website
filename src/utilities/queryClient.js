import { QueryClient } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
// import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

// // Create a persister for localStorage
// const persister = createSyncStoragePersister({
//   storage: window.localStorage,
//   key: "fomino-cache", // unique key for your app
// });

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    }, 
  },
});

// Enable persistence (offline caching)
persistQueryClient({
  queryClient,
  //   persister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
  buster: "v1", // cache version
});
