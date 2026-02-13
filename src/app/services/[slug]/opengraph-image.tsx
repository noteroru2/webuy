import { siteUrl } from "@/lib/wp";
import { getCachedServicesList } from "@/lib/wp-cache";
import { stripHtml } from "@/lib/shared";
import { renderOgImage, clampText } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
    const data = await getCachedServicesList();
    const service = (data?.services?.nodes ?? []).find((n: any) => String(n?.slug || "").toLowerCase() === slug.toLowerCase());
    if (service?.title) title = String(service.title);
    const text = stripHtml(String(service?.content ?? ""));
    if (text) desc = clampText(text, 160);

    const cats = (service?.devicecategories?.nodes ?? [])
      .map((c: any) => String(c?.title ?? c?.slug ?? "").trim())
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
