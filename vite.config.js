import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// GitHub Pages serves a project repo under /<repo>/. Override with BASE_PATH
// (the deploy workflow sets it automatically). Local dev uses "/".
const base = process.env.BASE_PATH || "/";

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg", "favicon.svg"],
      manifest: {
        name: "Dev Pulse",
        short_name: "Dev Pulse",
        description: "AI-curated Shopify developer updates.",
        theme_color: "#0e9aa7",
        background_color: "#131312",
        display: "standalone",
        orientation: "portrait",
        icons: [
          { src: "icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
          { src: "icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
        ],
      },
      workbox: {
        // Cache the app shell + the feed so it works offline.
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.endsWith("feed.json"),
            handler: "StaleWhileRevalidate",
            options: { cacheName: "feed-data" },
          },
        ],
      },
    }),
  ],
});
