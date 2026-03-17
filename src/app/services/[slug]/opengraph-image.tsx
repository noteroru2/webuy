import { siteUrl } from "@/lib/wp";
import { getCachedOgService } from "@/lib/wp-og-cache";
import { stripHtml } from "@/lib/shared";
import { renderOgImage, clampText } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
/** Cache ผลลัพธ์รูป OG ต่อ slug 24 ชม. — request ซ้ำได้จาก cache ไม่รัน handler = ไม่ยิง WP */
export const revalidate = 86400;

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
    const service = await getCachedOgService(slug);
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
