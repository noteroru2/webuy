/**
 * Sitemap services segment 2 — /sitemap-services-2.xml (401–800)
 */
import { getServicesEntriesForSegment, sitemapEntriesToXml, getMinimalSitemapXml } from "@/lib/sitemap-build";

export const revalidate = 86400;
export const runtime = "edge";

const HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=3600, s-maxage=3600",
} as const;

const REQUEST_TIMEOUT_MS = Number(process.env.SITEMAP_REQUEST_TIMEOUT_MS ?? "25000");

export async function GET() {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("sitemap timeout")), REQUEST_TIMEOUT_MS)
  );
  try {
    const entries = await Promise.race([getServicesEntriesForSegment(1), timeoutPromise]);
    const xml = entries.length ? sitemapEntriesToXml(entries) : getMinimalSitemapXml();
    return new Response(xml, { status: 200, headers: HEADERS });
  } catch {
    const xml = getMinimalSitemapXml();
    return new Response(xml, { status: 200, headers: HEADERS });
  }
}
