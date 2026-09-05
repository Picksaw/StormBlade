import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// APP_TARGET=app  -> packaged build (Capacitor APK / Electron EXE): relative paths
// (default)       -> GitHub Pages build served from /StormBlade/
const isApp = process.env.APP_TARGET === "app";

// https://vite.dev/config/
export default defineConfig({
  base: isApp ? "./" : "/StormBlade/",
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: {
    outDir: isApp ? "dist-app" : "dist",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
