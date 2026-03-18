/**
 * Sitemap Index — /sitemap.xml รวมลิงก์ไปยัง sitemap ย่อย
 * services ใช้ /sitemap-services/1 … /sitemap-services/N (segment ละ 400 URLs)
 */
import { siteUrl } from "@/lib/wp";
import { buildSitemapIndexXml, getServiceSegmentsCount } from "@/lib/sitemap-build";

export const revalidate = 86400;
export const runtime = "nodejs";

const HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=3600, s-maxage=3600",
} as const;

export async function GET() {
  try {
    const base = siteUrl().replace(/\/$/, "");
    const segments = await getServiceSegmentsCount();
    const sitemaps: { loc: string }[] = [
      { loc: `${base}/sitemap-pages.xml` },
      { loc: `${base}/sitemap-locations.xml` },
      ...Array.from({ length: segments }, (_, i) => ({
        loc: `${base}/sitemap-services/${i + 1}`,
      })),
      { loc: `${base}/sitemap-categories.xml` },
      { loc: `${base}/sitemap-prices.xml` },
    ];
    const xml = buildSitemapIndexXml(sitemaps);
    return new Response(xml, { status: 200, headers: HEADERS });
  } catch {
    const base = siteUrl().replace(/\/$/, "") || "https://webuy.in.th";
    const xml = buildSitemapIndexXml([{ loc: `${base}/sitemap-pages.xml` }]);
    return new Response(xml, { status: 200, headers: HEADERS });
  }
}
