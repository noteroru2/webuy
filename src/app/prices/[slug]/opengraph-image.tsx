import { fetchGqlSafe, siteUrl } from "@/lib/wp";
import { Q_PRICE_BY_SLUG } from "@/lib/queries";
import { stripHtml } from "@/lib/shared";
import { renderOgImage, clampText } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function formatRange(min: unknown, max: unknown): string {
  const a = Number(min);
  const b = Number(max);
  if (Number.isFinite(a) && Number.isFinite(b)) return `${a}-${b} บาท`;
  return "ช่วงราคารับซื้อโดยประมาณ";
}

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

  const data = await fetchGqlSafe<{
    pricemodels?: {
      nodes?: Array<{
        title?: string;
        brand?: string;
        buyPriceMin?: number;
        buyPriceMax?: number;
        content?: string;
      }>;
    };
  }>(Q_PRICE_BY_SLUG, { slug });
  const price = data?.pricemodels?.nodes?.[0];

  if (price?.title) title = String(price.title);
  brand = String(price?.brand ?? "").trim();
  range = formatRange(price?.buyPriceMin, price?.buyPriceMax);
  const text = stripHtml(String(price?.content ?? ""));
  if (text) desc = clampText(text, 160);

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
