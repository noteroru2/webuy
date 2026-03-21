import { siteUrl } from "@/lib/wp";
import { getCachedOgPrice } from "@/lib/wp-og-cache";
import { stripHtml } from "@/lib/shared";
import { renderOgImage, clampText } from "@/lib/og";
import { ogPriceLine } from "@/lib/price-display";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
/** Cache ผลลัพธ์รูป OG ต่อ slug 24 ชม. — request ซ้ำได้จาก cache ไม่รัน handler = ไม่ยิง WP */
export const revalidate = 86400;

/** ดึงแค่ 1 price ตาม slug (เบา) — ไม่ใช้ getCachedPricemodelsList ที่ดึง 500 nodes */
export default async function Image({
  params,
}: {
  params: { slug: string };
}) {
  const slug = String(params?.slug ?? "").trim();
  const url = `${siteUrl()}/prices/${slug}`;

  let title = "รุ่น/ช่วงราคารับซื้อ";
  let range = "ช่วงราคารับซื้อโดยประมาณ";
  let desc =
    "ขึ้นอยู่กับสภาพ/อุปกรณ์/ประกัน • ส่งรูปเพื่อประเมินจริงใน LINE: @webuy";
  let brand = "";

  try {
    const price = await getCachedOgPrice(slug);
    if (price?.title) title = String(price.title);
    brand = String(price?.brand ?? "").trim();
    range = ogPriceLine(price);
    const text = stripHtml(String(price?.content ?? ""));
    if (text) desc = clampText(text, 160);
  } catch {
    // ใช้ค่า default ด้านบน
  }

  const chips: string[] = [];
  if (brand) chips.push(brand);
  chips.push(range);

  return renderOgImage(clampText(title, 70), clampText(desc, 180), {
    label: "PRICE / MODEL",
    chips,
    footerLeft: url,
    footerRight: "ขึ้นอยู่กับสภาพจริง",
  });
}
