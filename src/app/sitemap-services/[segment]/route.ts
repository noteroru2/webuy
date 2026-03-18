/**
 * Sitemap services แบบ dynamic — /sitemap-services/1, /sitemap-services/2, …
 * ใช้ Node runtime เพื่อให้ fetchGql (unstable_cache) ทำงาน — บน Edge จะได้ entries ว่าง → GSC เห็นแค่ 1 URL
 */
import { getServiceSegmentsCount, getServicesEntriesForSegment, sitemapEntriesToXml, getEmptySitemapXml } from "@/lib/sitemap-build";

export const revalidate = 86400;
export const runtime = "nodejs";

const HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=3600, s-maxage=3600",
} as const;

const REQUEST_TIMEOUT_MS = Number(process.env.SITEMAP_REQUEST_TIMEOUT_MS ?? "25000");

export async function GET(
  _req: Request,
  { params }: { params: { segment: string } }
) {
  const raw = String(params?.segment ?? "").trim();
  const segmentNum = Math.trunc(Number(raw)) || 0;
  const maxSegments = await getServiceSegmentsCount();
  if (segmentNum < 1 || segmentNum > maxSegments) {
    return new Response(getEmptySitemapXml(), { status: 200, headers: HEADERS });
  }
  const segmentIndex = segmentNum - 1;

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("sitemap timeout")), REQUEST_TIMEOUT_MS)
  );
  try {
    const entries = await Promise.race([
      getServicesEntriesForSegment(segmentIndex),
      timeoutPromise,
    ]);
    const xml = entries.length ? sitemapEntriesToXml(entries) : getEmptySitemapXml();
    return new Response(xml, { status: 200, headers: HEADERS });
  } catch {
    return new Response(getEmptySitemapXml(), { status: 200, headers: HEADERS });
  }
}
