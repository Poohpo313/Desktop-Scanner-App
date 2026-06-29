import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";

const isElectron = process.env.ELECTRON === "true";

export default defineConfig(async () => {
  const plugins: PluginOption[] = [react()];

  if (isElectron) {
    const electron = (await import("vite-plugin-electron/simple")).default;
    plugins.push(
      electron({
        main: {
          entry: "electron/main.ts",
        },
        preload: {
          input: "electron/preload.ts",
        },
        onstart({ startup }) {
          void startup().catch((error: Error) => {
            console.warn("[electron] dev restart skipped:", error.message);
          });
        },
      })
    );
  }

  return {
    base: isElectron ? "./" : "/",
    plugins,
    server: {
      port: 5174,
      strictPort: true,
      proxy: {
        "/api": {
          target: process.env.VITE_GATEWAY_PROXY ?? "http://localhost:3000",
          changeOrigin: true,
        },
      },
    },
  };
});
