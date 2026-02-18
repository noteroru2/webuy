/**
 * Serve sitemap.xml with explicit XML declaration และ Content-Type
 * เพื่อให้ Google Search Console ดึงข้อมูลได้ (แก้ "ดึงข้อมูลไม่ได้")
 */
import { getSitemapEntries, sitemapEntriesToXml } from "@/lib/sitemap-build";

export const revalidate = 86400;

export async function GET() {
  const entries = await getSitemapEntries();
  const xml = sitemapEntriesToXml(entries);
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
