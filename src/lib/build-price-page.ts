import { siteUrl } from "@/lib/wp-fetch";
import { getPriceBySlug, getHubIndex } from "@/lib/wp-build";
import { relatedByCategory } from "@/lib/related";
import { jsonLdProductOffer, jsonLdBreadcrumb, jsonLdReviewAggregate } from "@/lib/jsonld";
import { inferDescriptionFromHtml } from "@/lib/seo";
import { priceMetaPhrase, priceRangeLabel } from "@/lib/price-display";
import { rewriteWpImagesInHtml } from "@/lib/rewrite-wp-html";

function toHtml(x: unknown) {
  return String(x ?? "").trim();
}

function pickPrimaryCategory(node: { devicecategories?: { nodes?: { description?: string; slug?: string; name?: string }[] } }) {
  const cats = node?.devicecategories?.nodes ?? [];
  if (!cats.length) return null;
  const withDesc = cats.find((c) => String(c?.description || "").trim());
  return withDesc || cats[0];
}

export type PricePageModel = {
  title: string;
  description: string;
  price: Record<string, unknown>;
  contentHtml: string;
  relatedServices: unknown[];
  relatedLocations: unknown[];
  breadcrumbJson: unknown;
  productJson: unknown;
  reviewJson: unknown;
  cats: { slug?: string; name?: string }[];
  primaryCatSlug: string;
  primaryCatName: string;
  primaryCatHref: string;
  topInternalLinks: { href: string; label: string }[];
  rangeText: string | null;
};

export async function buildPricePageModel(slug: string): Promise<PricePageModel | null> {
  const s = String(slug || "").trim();
  if (!s) return null;

  const price = (await getPriceBySlug(s)) as Record<string, unknown> | null;
  if (!price) return null;

  const emptyIndex = {
    services: { nodes: [] as unknown[] },
    locationpages: { nodes: [] as unknown[] },
    pricemodels: { nodes: [] as unknown[] },
  };
  const index = ((await getHubIndex()) ?? emptyIndex) as {
    services?: { nodes?: unknown[] };
    locationpages?: { nodes?: unknown[] };
  };

  const relatedServices = relatedByCategory(index?.services?.nodes ?? [], price, 8);
  const relatedLocations = relatedByCategory(index?.locationpages?.nodes ?? [], price, 8);

  const pageUrl = `${siteUrl()}/prices/${price.slug}`;

  const reviewJson = jsonLdReviewAggregate(pageUrl, {
    name: String(price.title || ""),
    ratingValue: 4.7,
    reviewCount: 52,
  });

  const productJson = jsonLdProductOffer(pageUrl, price);

  const cats = (price.devicecategories as { nodes?: { slug?: string; name?: string }[] } | undefined)?.nodes ?? [];
  const primaryCat = pickPrimaryCategory(price as Parameters<typeof pickPrimaryCategory>[0]);
  const primaryCatSlug = String(primaryCat?.slug || "").trim();
  const primaryCatName = String(primaryCat?.name || primaryCatSlug || "หมวดสินค้า").trim();
  const primaryCatHref = primaryCatSlug ? `/categories/${primaryCatSlug}` : "/categories";

  const breadcrumbJson = jsonLdBreadcrumb(pageUrl, [
    { name: "WEBUY HUB", url: `${siteUrl()}/` },
    { name: "หมวดสินค้า", url: `${siteUrl()}/categories` },
    ...(primaryCatSlug ? [{ name: primaryCatName, url: `${siteUrl()}/categories/${primaryCatSlug}` }] : []),
    { name: String(price.title || "รุ่น/ช่วงราคารับซื้อ"), url: pageUrl },
  ]);

  let contentHtml = rewriteWpImagesInHtml(toHtml(price.content));

  const rangeText = priceRangeLabel(price);
  const range = priceMetaPhrase(price) || "ช่วงราคารับซื้อโดยประมาณ";
  const fallback = `${price.title || "รุ่นสินค้า"} • ${range} (ขึ้นอยู่กับสภาพ/อุปกรณ์/ประกัน) ติดต่อ LINE @webuy เพื่อประเมินจริง`;
  const description = inferDescriptionFromHtml(price.content, fallback);

  const topInternalLinks = [
    primaryCatSlug
      ? { href: `/categories/${primaryCatSlug}`, label: `รวมเนื้อหาในหมวด ${primaryCatName}` }
      : { href: "/categories", label: "ดูหมวดสินค้าทั้งหมด" },
    ...relatedServices.slice(0, 4).map((sv: { slug?: string; title?: string }) => ({
      href: `/services/${sv.slug}`,
      label: `บริการ: ${sv.title}`,
    })),
    ...relatedLocations.slice(0, 4).map((l: { slug?: string; title?: string }) => ({
      href: `/locations/${l.slug}`,
      label: `พื้นที่: ${l.title}`,
    })),
  ];

  return {
    title: `${String(price.title || "รุ่น/ช่วงราคารับซื้อ")} | WEBUY HUB`,
    description,
    price,
    contentHtml,
    relatedServices,
    relatedLocations,
    breadcrumbJson,
    productJson,
    reviewJson,
    cats,
    primaryCatSlug,
    primaryCatName,
    primaryCatHref,
    topInternalLinks,
    rangeText,
  };
}
