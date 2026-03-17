import { siteUrl } from "@/lib/wp";
import { getCachedOgCategory } from "@/lib/wp-og-cache";
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
  const url = `${siteUrl()}/categories/${slug}`;

  let name = slug || "Category";
  let desc =
    "รวมเนื้อหาในหมวดเดียวกัน: บริการ • พื้นที่ • รุ่น/ราคา • FAQ (เชื่อมโยงแบบ Silo)";
  const chips = ["Services", "Locations", "Prices", "FAQs"];

  const term = await getCachedOgCategory(slug);

  if (term?.name) name = String(term.name);
  const text = stripHtml(String(term?.description ?? ""));
  if (text) desc = clampText(text, 160);

  return renderOgImage(clampText(name, 60), clampText(desc, 180), {
    label: "หมวดสินค้า",
    chips,
    footerLeft: url,
    footerRight: "SEO Silo",
  });
}
