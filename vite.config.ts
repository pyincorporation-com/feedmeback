import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 7000,
    allowedHosts: [
      "api.feedmeback.cloud",
      "feedmeback.cloud",
      "www.feedmeback.cloud",
    ],
    host: true,
    strictPort: true,
  },
});
