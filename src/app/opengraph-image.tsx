import { siteUrl } from "@/lib/wp";
import { renderOgImage } from "@/lib/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const title = "WEBUY HUB";
  const subtitle = "รับซื้ออุปกรณ์ไอที • ประเมินไว • นัดรับถึงที่ • จ่ายทันที";
  const url = `${siteUrl()}/`;

  return renderOgImage(title, subtitle, {
    chips: ["รับซื้อโน๊ตบุ๊ค", "รับซื้อคอมพิวเตอร์", "รับซื้อมือถือ", "รับซื้อแมค"],
    footerLeft: url,
    footerRight: "Social Preview",
  });
}
