import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/wp";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl().replace(/\/$/, "");
  const host = base.replace(/^https?:\/\//i, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // ถ้าคุณมี path ที่ไม่อยากให้ index ค่อยเปิดใช้
      // disallow: ["/api", "/admin"],
    },
    sitemap: `${base}/sitemap.xml`,
    host,
  };
}
