import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || "https://webuy.in.th",
  output: "static",
  /** ให้ตรงกับ URL ใน sitemap (มี / ท้าย) — กัน 404 ตอน preview เมื่อเข้าแบบไม่มี slash */
  trailingSlash: "always",
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
  ],
  vite: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  },
});
