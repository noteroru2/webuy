import { siteUrl } from "@/lib/wp";
import { renderOgImage, clampText } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** หน้า district ใช้เฉพาะ WP — ปัจจุบัน 404 จึงใช้ข้อความจาก slug */
export default async function Image({
  params,
}: {
  params: { province: string; district: string };
}) {
  const provinceSlug = String(params?.province ?? "").trim();
  const districtSlug = String(params?.district ?? "").trim();
  const url = `${siteUrl()}/locations/${provinceSlug}/${districtSlug}`;
  const title = districtSlug
    ? `รับซื้อโน๊ตบุ๊ค ${districtSlug.replace(/-/g, " ")}`
    : "พื้นที่บริการ";
  const subtitle = "รับซื้อโน๊ตบุ๊คและอุปกรณ์ไอที • ประเมินไว • นัดรับถึงที่ • จ่ายทันที";
  return renderOgImage(clampText(title, 70), clampText(subtitle, 180), {
    label: "พื้นที่บริการ",
    chips: ["รับซื้อโน๊ตบุ๊ค", "อำเภอ", "นัดรับถึงที่"],
    footerLeft: url,
    footerRight: "ประเมินไว • นัดรับถึงที่ • จ่ายทันที",
  });
}
