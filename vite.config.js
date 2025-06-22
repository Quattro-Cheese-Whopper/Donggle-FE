// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://quattro-cheese.duckdns.org",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
  },
});
