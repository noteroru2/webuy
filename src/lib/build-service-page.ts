import { siteUrl, nodeCats } from "@/lib/site";
import { getServiceBySlug, getHubIndex } from "@/lib/content";
import { relatedByCategory } from "@/lib/related";
import { jsonLdFaqPage } from "@/lib/jsonld";
import { stripHtml } from "@/lib/shared";
import { inferDescriptionFromHtml } from "@/lib/seo";
import { jsonLdBreadcrumb } from "@/lib/jsonld";
import { jsonLdReviewAggregate } from "@/lib/jsonld";
import { serviceFaqSeed } from "@/lib/seoLocation";
import { rewriteWpImagesInHtml } from "@/lib/rewrite-wp-html";

function isPublish(status: unknown) {
  return String(status || "").toLowerCase() === "publish";
}

const emptyIndex = {
  services: { nodes: [] as unknown[] },
  locationpages: { nodes: [] as unknown[] },
  pricemodels: { nodes: [] as unknown[] },
  faqs: { nodes: [] as unknown[] },
};

function toHtml(x: unknown) {
  return String(x ?? "").trim();
}

function pickPrimaryCategory(service: { devicecategories?: { nodes?: { description?: string; slug?: string; name?: string }[] } }) {
  const cats = service?.devicecategories?.nodes ?? [];
  if (!cats.length) return null;
  const withDesc = cats.find((c) => String(c?.description || "").trim());
  return withDesc || cats[0];
}

export type ServicePageModel = {
  title: string;
  description: string;
  service: Record<string, unknown>;
  contentHtml: string;
  faqItems: { title: string; answer: string }[];
  relatedLocations: unknown[];
  relatedPrices: unknown[];
  breadcrumbJson: unknown;
  faqJson: unknown | null;
  reviewJson: unknown;
  primaryCatSlug: string;
  primaryCatName: string;
  catDesc: string;
  cats: { slug?: string; name?: string }[];
};

/** ใช้ตอน static build เมื่อโหลด node จาก list/pagination แล้ว — ไม่ยิง GraphQL ซ้ำต่อ slug */
export async function buildServicePageModelFromService(
  service: Record<string, unknown> | null
): Promise<ServicePageModel | null> {
  if (!service) return null;
  if (!isPublish(service.status)) return null;
  const s = String(service.slug || "").trim();
  if (!s) return null;

  const index = ((await getHubIndex()) ?? emptyIndex) as {
    locationpages?: { nodes?: unknown[] };
    pricemodels?: { nodes?: unknown[] };
    faqs?: { nodes?: unknown[] };
  };

  const relatedLocations = relatedByCategory(index?.locationpages?.nodes ?? [], service, 8);
  const relatedPrices = relatedByCategory(index?.pricemodels?.nodes ?? [], service, 8);

  const serviceCats = nodeCats(service as Parameters<typeof nodeCats>[0]);
  const primaryCat = pickPrimaryCategory(service as Parameters<typeof pickPrimaryCategory>[0]);
  const primaryCatName = String(primaryCat?.name || primaryCat?.slug || "หมวดสินค้า").trim();

  const faqsAll = (index?.faqs?.nodes ?? []) as {
    slug?: string;
    question?: string;
    title?: string;
    answer?: string;
    devicecategories?: { nodes?: { slug?: string }[] };
  }[];
  const relatedFaqs = faqsAll
    .filter(
      (f) =>
        f?.slug &&
        serviceCats.some((c) => (f.devicecategories?.nodes ?? []).some((n) => n?.slug === c))
    )
    .slice(0, 20);

  const seedFaqs = serviceFaqSeed(String(service.title || ""), primaryCatName);
  const faqItems = [
    ...relatedFaqs.map((f) => ({
      title: String(f.question || f.title || "").trim(),
      answer: stripHtml(String(f.answer || "")),
    })),
    ...seedFaqs.map((f) => ({ title: f.q, answer: f.a })),
  ].filter((x) => x.title && x.answer);

  const slugOut = String(service.slug || s);
  const pageUrl = `${siteUrl()}/services/${slugOut}`;
  const faqJson = faqItems.length > 0 ? jsonLdFaqPage(pageUrl, faqItems) : null;

  const reviewJson = jsonLdReviewAggregate(pageUrl, {
    name: String(service.title || ""),
    ratingValue: 4.8,
    reviewCount: 124,
  });

  const cats = (service.devicecategories as { nodes?: { slug?: string; name?: string }[] } | undefined)?.nodes ?? [];
  const primaryCatSlug = String(primaryCat?.slug || "").trim();
  const catDesc = stripHtml(String(primaryCat?.description || "")).trim();

  let contentHtml = rewriteWpImagesInHtml(toHtml(service.content));

  const breadcrumbJson = jsonLdBreadcrumb(pageUrl, [
    { name: "WEBUY HUB", url: `${siteUrl()}/` },
    { name: "หมวดสินค้า", url: `${siteUrl()}/categories` },
    ...(primaryCatSlug ? [{ name: primaryCatName, url: `${siteUrl()}/categories/${primaryCatSlug}` }] : []),
    { name: String(service.title || "บริการ"), url: pageUrl },
  ]);

  const fallback = "บริการรับซื้อสินค้าไอที ประเมินไว นัดรับถึงที่ และจ่ายทันทีผ่าน LINE @webuy";
  const description = inferDescriptionFromHtml(service.content, fallback);

  return {
    title: `${String(service.title || "บริการ")} | WEBUY HUB`,
    description,
    service,
    contentHtml,
    faqItems,
    relatedLocations,
    relatedPrices,
    breadcrumbJson,
    faqJson,
    reviewJson,
    primaryCatSlug,
    primaryCatName,
    catDesc,
    cats,
  };
}

export async function buildServicePageModel(slug: string): Promise<ServicePageModel | null> {
  const s = String(slug || "").trim();
  if (!s) return null;
  const service = (await getServiceBySlug(s)) as Record<string, unknown> | null;
  return buildServicePageModelFromService(service);
}
