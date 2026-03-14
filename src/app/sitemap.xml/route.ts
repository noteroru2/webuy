/**
 * Sitemap Index — /sitemap.xml รวมลิงก์ไปยัง sitemap ย่อย (แยกตามหมวด)
 * services แยกเป็น sitemap-services-1.xml … N (ไฟล์ละ 400 URLs)
 */
import { siteUrl } from "@/lib/wp";
import { buildSitemapIndexXml, SITEMAP_SERVICE_SEGMENTS } from "@/lib/sitemap-build";

export const revalidate = 86400;
export const runtime = "edge";

const HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=3600, s-maxage=3600",
} as const;

export async function GET() {
  try {
    const base = siteUrl().replace(/\/$/, "");
    const sitemaps: { loc: string }[] = [
      { loc: `${base}/sitemap-pages.xml` },
      { loc: `${base}/sitemap-locations.xml` },
      ...Array.from({ length: Math.min(5, SITEMAP_SERVICE_SEGMENTS) }, (_, i) => ({
        loc: `${base}/sitemap-services-${i + 1}.xml`,
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
