import { siteUrl } from "@/lib/wp";
import { findDistrict } from "@/lib/locations";
import { renderOgImage, clampText } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: { province: string; district: string };
}) {
  const provinceSlug = String(params?.province ?? "").trim();
  const districtSlug = String(params?.district ?? "").trim();
  const rec = findDistrict(provinceSlug, districtSlug);
  const url = `${siteUrl()}/locations/${provinceSlug}/${districtSlug}`;
  let title = "พื้นที่บริการ";
  let subtitle = "รับซื้อโน๊ตบุ๊คและอุปกรณ์ไอที • ประเมินไว • นัดรับถึงที่ • จ่ายทันที";
  if (rec) {
    title = `รับซื้อโน๊ตบุ๊ค ${rec.district}`;
    subtitle = `${rec.province} • ประเมินไว • นัดรับถึงที่ • จ่ายทันที`;
  }
  return renderOgImage(clampText(title, 70), clampText(subtitle, 180), {
    label: "พื้นที่บริการ",
    chips: ["รับซื้อโน๊ตบุ๊ค", "อำเภอ", "นัดรับถึงที่"],
    footerLeft: url,
    footerRight: "ประเมินไว • นัดรับถึงที่ • จ่ายทันที",
  });
}
