import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const gatewayTarget = process.env.VITE_GATEWAY_PROXY ?? "http://localhost:3000";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: gatewayTarget,
        changeOrigin: true,
      },
      "/events": {
        target: gatewayTarget,
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
