import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    fs: {
      allow: [path.resolve(__dirname, "../..")],
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("react-router-dom")) return "router";
          if (id.includes("@tanstack/react-query")) return "query";
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("lucide-react")) return "icons";
          if (id.includes("date-fns")) return "dates";
          if (id.includes("react-toastify")) return "toasts";
          if (id.includes("canvas-confetti")) return "confetti";
          if (
            id.includes("react-easy-crop") ||
            id.includes("browser-image-compression")
          ) {
            return "media";
          }

          return "vendor";
        },
      },
    },
  },
});
