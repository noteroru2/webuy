import { siteUrl } from "@/lib/wp";
import { getCachedOgLocation } from "@/lib/wp-og-cache";
import { renderOgImage, clampText } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
/** Cache ผลลัพธ์รูป OG ต่อ slug 24 ชม. — request ซ้ำได้จาก cache ไม่รัน handler = ไม่ยิง WP */
export const revalidate = 86400;

export default async function Image({ params }: { params: { province: string } }) {
  const slug = String(params?.province ?? "").trim();
  const url = `${siteUrl()}/locations/${slug}`;
  let title = "พื้นที่บริการ";
  let subtitle = "รับซื้อโน๊ตบุ๊คและอุปกรณ์ไอทีทั่วประเทศ • ประเมินไว • นัดรับถึงที่";

  try {
    const loc = await getCachedOgLocation(slug);
    if (loc) {
      title = loc.title || title;
      const area = [loc.province, loc.district].filter(Boolean).join(" ");
      subtitle = area ? `พื้นที่บริการ ${area} • ประเมินไว • นัดรับถึงที่` : subtitle;
    }
  } catch {
    // ใช้ค่า default ด้านบน
  }

  return renderOgImage(clampText(title, 70), clampText(subtitle, 180), {
    label: "พื้นที่บริการ",
    chips: ["รับซื้อโน๊ตบุ๊ค", "จังหวัด", "นัดรับถึงที่"],
    footerLeft: url,
    footerRight: "ประเมินไว • นัดรับถึงที่ • จ่ายทันที",
  });
}
