/**
 * Sitemap หน้า static — /sitemap-pages.xml
 */
import { getPagesEntries, sitemapEntriesToXml } from "@/lib/sitemap-build";

export const revalidate = 86400;
export const runtime = "edge";

const HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=3600, s-maxage=3600",
  
} as const;

export async function GET() {
  const entries = getPagesEntries();
  const xml = sitemapEntriesToXml(entries);
  return new Response(xml, { status: 200, headers: HEADERS });
}
