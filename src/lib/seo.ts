// src/lib/seo.ts
import type { Metadata } from "next";
import { siteUrl } from "@/lib/wp";
import { stripHtml } from "@/lib/shared";

function normalizePathname(pathname: string) {
  const p = String(pathname || "/").trim() || "/";
  const withSlash = p.startsWith("/") ? p : `/${p}`;
  // กันหลุด query/hash เผลอส่งมา
  return withSlash.split("?")[0].split("#")[0] || "/";
}

export function absoluteUrl(pathname: string) {
  const base = siteUrl().replace(/\/$/, "");
  const p = normalizePathname(pathname);
  return `${base}${p}`;
}

export function truncate(s: string, n = 160) {
  const t = String(s || "").trim().replace(/\s+/g, " ");
  if (t.length <= n) return t;
  return t.slice(0, Math.max(1, n - 1)).trimEnd() + "…";
}

export function inferDescriptionFromHtml(html: any, fallback: string) {
  const text = truncate(stripHtml(String(html || "")));
  return text || fallback;
}

/**
 * ✅ base metadata (ใช้ใน app/layout.tsx)
 * - metadataBase ทำให้ alternates.canonical ที่เป็น path กลายเป็น full URL ได้
 * - ใส่ OG/Twitter defaults ให้ครบ
 */
export function baseMetadata(): Metadata {
  const base = new URL(siteUrl());

  return {
    metadataBase: base,
    title: {
      default: "WEBUY HUB",
      template: "%s | WEBUY HUB",
    },
    description:
      "รับซื้อโน๊ตบุ๊ค MacBook PC อุปกรณ์ไอที ทุกยี่ห้อ ทุกสภาพ ให้ราคาสูง นัดรับถึงบ้าน จ่ายเงินสด ทั่วไทย | WEBUY HUB",
    alternates: { canonical: "/" },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    openGraph: {
      type: "website",
      url: siteUrl(),
      siteName: "WEBUY HUB",
      locale: "th_TH",
      // ใส่ default image (ถ้ามีไฟล์จริงใน /public)
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "WEBUY HUB" }],
    },
    twitter: {
      card: "summary_large_image",
      images: ["/og.jpg"],
    },
  };
}

/**
 * ✅ page metadata สำหรับทุกหน้า
 * - canonical เป็น path เสมอ (ให้ metadataBase สร้าง full URL)
 * - og:type ปรับได้ (home/category = website, detail = article)
 */
export function pageMetadata(args: {
  title: string;
  description: string;
  pathname: string; // เช่น /services/xxx
  type?: "website" | "article";
  image?: string; // เช่น "/og/xxx.jpg" หรือ "https://..."
}): Metadata {
  const pathname = normalizePathname(args.pathname);
  const url = absoluteUrl(pathname);

  const image = args.image || "/og.jpg";
  const ogType = args.type || "article";

  return {
    title: args.title,
    description: args.description,
    alternates: { canonical: pathname },
    openGraph: {
      title: args.title,
      description: args.description,
      url,
      siteName: "WEBUY HUB",
      type: ogType,
      locale: "th_TH",
      images: [{ url: image, width: 1200, height: 630, alt: args.title }],
    },
    twitter: {
      title: args.title,
      description: args.description,
      card: "summary_large_image",
      images: [image],
    },
  };
}
