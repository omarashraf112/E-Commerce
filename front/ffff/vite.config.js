import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    // If your backend doesn't have CORS configured for this dev origin yet,
    // uncomment the proxy below and set VITE_API_BASE_URL="/api" in .env instead.
    // proxy: {
    //   "/api": {
    //     target: "https://localhost:7051",
    //     changeOrigin: true,
    //     secure: false,
    //   },
    // },
  },
});
