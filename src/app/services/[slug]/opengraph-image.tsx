import { fetchGql, siteUrl } from "@/lib/wp";
import { Q_SERVICE_BY_SLUG } from "@/lib/queries";
import { stripHtml } from "@/lib/shared";
import { renderOgImage, clampText } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** ดึงแค่ 1 service ตาม slug (เบา) — ไม่ใช้ getCachedServicesList ที่ดึง 500 nodes */
export default async function Image({
  params,
}: {
  params: { slug: string };
}) {
  const slug = String(params?.slug ?? "").trim();
  const url = `${siteUrl()}/services/${slug}`;

  let title = "WEBUY HUB";
  let desc = "รับซื้ออุปกรณ์ไอที • ประเมินไว • นัดรับถึงที่ • จ่ายทันที";
  let chips: string[] = ["บริการรับซื้อ", "ประเมินไว", "นัดรับถึงที่"];

  try {
    const data = await fetchGql<{ services?: { nodes?: any[] } }>(Q_SERVICE_BY_SLUG, { slug }, { revalidate: 3600 });
    const service = data?.services?.nodes?.[0];
    if (service?.title) title = String(service.title);
    const text = stripHtml(String(service?.content ?? ""));
    if (text) desc = clampText(text, 160);

    const cats = (service?.devicecategories?.nodes ?? [])
      .map((c: any) => String(c?.name ?? c?.slug ?? "").trim())
      .filter(Boolean)
      .slice(0, 4);
    if (cats.length) chips = cats;
  } catch {
    // ใช้ค่า default ด้านบน
  }

  return renderOgImage(clampText(title, 70), clampText(desc, 180), {
    label: "SERVICE",
    chips,
    footerLeft: url,
    footerRight: "ประเมินไว • นัดรับถึงที่ • จ่ายทันที",
  });
}
