/**
 * Sitemap services — /sitemap-services.xml
 */
import { getServicesEntries, sitemapEntriesToXml, getMinimalSitemapXml } from "@/lib/sitemap-build";

export const revalidate = 86400;
export const runtime = "edge";

const HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=3600, s-maxage=3600",
  
} as const;

export async function GET() {
  try {
    const entries = await getServicesEntries();
    const xml = entries.length ? sitemapEntriesToXml(entries) : getMinimalSitemapXml();
    return new Response(xml, { status: 200, headers: HEADERS });
  } catch {
    return new Response(getMinimalSitemapXml(), { status: 200, headers: HEADERS });
  }
}
