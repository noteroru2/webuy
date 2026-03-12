/**
 * Sitemap categories (devicecategories) — /sitemap-categories.xml
 * ใส่ timeout ทั้ง request เพื่อไม่ให้เกิน ~8s (หลีกเลี่ยง HTTP 504)
 */
import { getCategoriesEntries, sitemapEntriesToXml, getMinimalSitemapXml } from "@/lib/sitemap-build";

export const revalidate = 86400;
export const runtime = "edge";

const HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=3600, s-maxage=3600",
} as const;

const REQUEST_TIMEOUT_MS = 8000;

export async function GET() {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("sitemap timeout")), REQUEST_TIMEOUT_MS)
  );
  try {
    const entries = await Promise.race([getCategoriesEntries(), timeoutPromise]);
    const xml = entries.length ? sitemapEntriesToXml(entries) : getMinimalSitemapXml();
    return new Response(xml, { status: 200, headers: HEADERS });
  } catch {
    const xml = getMinimalSitemapXml();
    return new Response(xml, { status: 200, headers: HEADERS });
  }
}
