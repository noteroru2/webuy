import { siteUrl, nodeCats } from "@/lib/site";
import { getLocationBySlug, getHubIndex } from "@/lib/content";
import { relatedByCategory } from "@/lib/related";
import { stripHtml } from "@/lib/shared";
import { inferDescriptionFromHtml } from "@/lib/seo";
import { jsonLdBreadcrumb, jsonLdServiceLocation } from "@/lib/jsonld";
import { addInternalLinks, buildLocationInternalLinks } from "@/lib/internal-links";
import { locationFaqSeed } from "@/lib/seoLocation";
import { rewriteWpImagesInHtml } from "@/lib/rewrite-wp-html";
import { getLocationOptimization, type LocationOptimization } from "@/lib/location-optimization";
import { getLocationEditorial } from "@/lib/location-editorial";

function isPublish(status: unknown) {
  return String(status || "").toLowerCase() === "publish";
}

function toHtml(x: unknown) {
  return String(x ?? "").trim();
}

function stripEditorDataAttrs(html: string): string {
  return html.replace(/\s*data-(?:start|end)="[^"]*"/gi, "");
}

export type LocationFaqItem = { title: string; answer: string };

export type LocationPageModel = {
  title: string;
  description: string;
  location: Record<string, unknown>;
  contentHtml: string;
  relatedServices: unknown[];
  relatedPrices: unknown[];
  otherLocations: unknown[];
  faqItems: LocationFaqItem[];
  breadcrumbJson: unknown;
  serviceJson: unknown;
  primaryCatSlug: string;
  primaryCatName: string;
  cats: { slug?: string; name?: string }[];
  optimization: LocationOptimization | null;
};

export async function buildLocationPageModel(slug: string): Promise<LocationPageModel | null> {
  const s = String(slug || "").trim();
  if (!s) return null;

  const location = (await getLocationBySlug(s)) as Record<string, unknown> | null;
  if (!location || !location.slug) return null;

  const emptyIndex = {
    services: { nodes: [] as unknown[] },
    locationpages: { nodes: [] as unknown[] },
    pricemodels: { nodes: [] as unknown[] },
    devicecategories: { nodes: [] as unknown[] },
    faqs: { nodes: [] as unknown[] },
  };

  const indexRaw = await getHubIndex();
  const index = (indexRaw ?? emptyIndex) as typeof emptyIndex & Record<string, unknown>;

  const locSlug = String(location.slug);
  const pageUrl = `${siteUrl()}/locations/${locSlug}`;
  const optimization = getLocationOptimization(locSlug);
  // Narrow, evidence-reviewed overrides: keep the existing WP post/URL indexed,
  // but do not emit unsupported local pickup or instant-payout promises.
  const editorial = getLocationEditorial(locSlug);
  const publishedLocation = editorial ? { ...location, title: editorial.title } : location;

  const cats = (location.devicecategories as { nodes?: { slug?: string; name?: string }[] } | undefined)?.nodes ?? [];
  const primaryCatSlug = String(cats[0]?.slug || "").trim();
  const primaryCatName = String(cats[0]?.name || primaryCatSlug || "หมวดสินค้า").trim();

  const relatedServices = relatedByCategory(index.services?.nodes ?? [], location, 8);
  const relatedPrices = relatedByCategory(index.pricemodels?.nodes ?? [], location, 8);
  const locNodes = (index.locationpages?.nodes ?? []) as Array<{ slug?: string; status?: string }>;
  const otherLocations = locNodes
    .filter((l) => Boolean(l?.slug && l.slug !== locSlug && isPublish(l?.status)))
    .filter((l: unknown) => {
      try {
        return nodeCats(l as Parameters<typeof nodeCats>[0]).some((c) =>
          nodeCats(location as Parameters<typeof nodeCats>[0]).includes(c)
        );
      } catch {
        return false;
      }
    })
    .slice(0, 8);

  const faqsAll = (index.faqs?.nodes ?? []) as {
    slug?: string;
    question?: string;
    title?: string;
    answer?: string;
    devicecategories?: { nodes?: { slug?: string }[] };
  }[];
  const locationCats = nodeCats(location as Parameters<typeof nodeCats>[0]);
  const relatedFaqs = faqsAll
    .filter(
      (f) =>
        f?.slug &&
        locationCats.some((c) => (f.devicecategories?.nodes ?? []).some((n) => n?.slug === c))
    )
    .slice(0, 20);

  const areaName = [location.province, location.district].filter(Boolean).join(" ");
  const seedFaqs = areaName ? locationFaqSeed(areaName, !!location.district) : [];
  const faqItems: LocationFaqItem[] = [
    ...relatedFaqs.map((f) => ({
      title: String(f?.question || f?.title || "").trim(),
      answer: stripHtml(String(f?.answer || "")),
    })),
    ...seedFaqs.map((f) => ({ title: f.q, answer: f.a })),
  ].filter((x) => x.title && x.answer);

  const breadcrumbJson = jsonLdBreadcrumb(pageUrl, [
    { name: "WEBUY HUB", url: `${siteUrl()}/` },
    { name: "พื้นที่บริการ", url: `${siteUrl()}/locations` },
    {
      name: String(publishedLocation.title || publishedLocation.province || "พื้นที่บริการ"),
      url: pageUrl,
    },
  ]);

  const fallback = `ส่งรูป รุ่น สเปกและสภาพอุปกรณ์ไอทีจาก${[location.province, location.district].filter(Boolean).join(" ")} เพื่อประเมินเบื้องต้นทาง LINE @webuy ก่อนตกลงตรวจรับและส่งมอบ`;
  const description = editorial?.metaDescription || optimization?.metaDescription || inferDescriptionFromHtml(location.content, fallback);

  const serviceJson = jsonLdServiceLocation(pageUrl, {
    name: `รับซื้อมือถือ โน๊ตบุ๊ค ${location.province || ""}`,
    areaServed: areaName || String(location.province || location.title || ""),
    description: "ลูกค้าส่งรุ่น สเปก และรูปสินค้าเพื่อประเมินเบื้องต้น วิธีตรวจรับ การส่งมอบ และชำระเงินตกลงเป็นรายกรณี ร้านหลักอยู่จังหวัดอุบลราชธานี",
  });

  const rawContent = stripEditorDataAttrs(toHtml(location.content || ""));
  const withImages = rewriteWpImagesInHtml(rawContent);
  const internalLinkReplacements = buildLocationInternalLinks(index as Parameters<typeof buildLocationInternalLinks>[0], locSlug);
  const contentHtml = addInternalLinks(editorial?.contentHtml ?? withImages, internalLinkReplacements, siteUrl());

  const pageTitle = `${String(publishedLocation.title || "พื้นที่บริการ")} | WEBUY HUB`;

  return {
    title: pageTitle,
    description,
    location: publishedLocation,
    contentHtml,
    relatedServices,
    relatedPrices,
    otherLocations,
    faqItems,
    breadcrumbJson,
    serviceJson,
    primaryCatSlug,
    primaryCatName,
    cats,
    optimization,
  };
}
