import { siteUrl, nodeCats } from "@/lib/site";
import { getLocationBySlug, getHubIndex, getSiteSettings } from "@/lib/content";
import { relatedByCategory } from "@/lib/related";
import { stripHtml } from "@/lib/shared";
import { inferDescriptionFromHtml } from "@/lib/seo";
import {
  jsonLdBreadcrumb,
  jsonLdLocalBusiness,
  jsonLdFaqPage,
  jsonLdArticle,
  jsonLdHowTo,
  jsonLdServiceLocation,
} from "@/lib/jsonld";
import { addInternalLinks, buildLocationInternalLinks } from "@/lib/internal-links";
import { locationFaqSeed } from "@/lib/seoLocation";
import { rewriteWpImagesInHtml } from "@/lib/rewrite-wp-html";

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
  lbJson: unknown;
  articleJson: unknown;
  howToJson: unknown;
  serviceJson: unknown;
  faqJson: unknown;
  primaryCatSlug: string;
  primaryCatName: string;
  cats: { slug?: string; name?: string }[];
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

  const [indexRaw, sitePage] = await Promise.all([getHubIndex(), getSiteSettings()]);
  const index = (indexRaw ?? emptyIndex) as typeof emptyIndex & Record<string, unknown>;

  const locSlug = String(location.slug);
  const pageUrl = `${siteUrl()}/locations/${locSlug}`;

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

  const faqJson = faqItems.length > 0 ? jsonLdFaqPage(pageUrl, faqItems) : null;

  const breadcrumbJson = jsonLdBreadcrumb(pageUrl, [
    { name: "WEBUY HUB", url: `${siteUrl()}/` },
    { name: "พื้นที่บริการ", url: `${siteUrl()}/locations` },
    {
      name: String(location.title || location.province || "พื้นที่บริการ"),
      url: pageUrl,
    },
  ]);

  const lbJson = jsonLdLocalBusiness(
    sitePage ?? {},
    pageUrl,
    { province: String(location.province || ""), district: String(location.district || "") || undefined },
    { enabled: true, ratingValue: 4.9, reviewCount: 128 }
  );

  const fallback = `พื้นที่บริการรับซื้อโน๊ตบุ๊คและอุปกรณ์ไอที ${[location.province, location.district].filter(Boolean).join(" ")} • ประเมินไว นัดรับถึงที่ จ่ายทันที LINE @webuy`;
  const description = inferDescriptionFromHtml(location.content, fallback);

  const articleJson = jsonLdArticle(pageUrl, {
    headline: String(location.title || `รับซื้อมือถือ โน๊ตบุ๊ค ${location.province || ""}`),
    description,
  });
  const howToJson = jsonLdHowTo(pageUrl);
  const serviceJson = jsonLdServiceLocation(pageUrl, {
    name: `รับซื้อมือถือ โน๊ตบุ๊ค ${location.province || ""}`,
    areaServed: areaName || String(location.province || location.title || ""),
  });

  const rawContent = stripEditorDataAttrs(toHtml(location.content || ""));
  const withImages = rewriteWpImagesInHtml(rawContent);
  const internalLinkReplacements = buildLocationInternalLinks(index as Parameters<typeof buildLocationInternalLinks>[0], locSlug);
  const contentHtml = addInternalLinks(withImages, internalLinkReplacements, siteUrl());

  const pageTitle = `${String(location.title || "พื้นที่บริการ")} | WEBUY HUB`;

  return {
    title: pageTitle,
    description,
    location,
    contentHtml,
    relatedServices,
    relatedPrices,
    otherLocations,
    faqItems,
    breadcrumbJson,
    lbJson,
    articleJson,
    howToJson,
    serviceJson,
    faqJson,
    primaryCatSlug,
    primaryCatName,
    cats,
  };
}
