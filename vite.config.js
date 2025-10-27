import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig(({ mode }) => {
  console.log(`Current mode: ${mode}`);

  return {
    build: {
      sourcemap: true, // Source map generation must be turned on
    },
    plugins: [
      react(),
      sentryVitePlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: "sigitechnologies",
        project: "fomino-customer-web",
      }),
    ],
    css: {
      preprocessorOptions: {
        css: {
          modules: {
            localsConvention: "camelCaseOnly",
          },
        },
      },
    },

    server: {
      host: "0.0.0.0",
    },
    // base: mode === 'production' ? "https://web.fomino.ch/" : "https://dev.fomino.ch",
  };
});
