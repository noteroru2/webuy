import { siteUrl } from "@/lib/wp-fetch";
import { getCategoryBySlug, getHubIndex } from "@/lib/wp-build";
import { filterByCategory } from "@/lib/related";
import { stripHtml } from "@/lib/shared";
import { inferDescriptionFromHtml } from "@/lib/seo";
import { jsonLdBreadcrumb, jsonLdFaqPage } from "@/lib/jsonld";
import { categoryFaqSeed } from "@/lib/seoCategory";
import { rewriteWpImagesInHtml } from "@/lib/rewrite-wp-html";

function toHtml(x: unknown) {
  return String(x ?? "").trim();
}

export type CategoryPageModel = {
  title: string;
  description: string;
  catSlug: string;
  termName: string;
  termDescHtml: string;
  termDescPlain: string;
  hubFetchFailed: boolean;
  services: unknown[];
  locations: unknown[];
  prices: unknown[];
  faqs: { q?: string; a?: string; slug?: string; question?: string; title?: string; answer?: string }[];
  breadcrumbJson: unknown;
  faqJson: unknown;
  topInternalLinks: { href: string; label: string }[];
};

export async function buildCategoryPageModel(slug: string): Promise<CategoryPageModel | null> {
  const slugParam = String(slug || "").trim();
  if (!slugParam) return null;

  const hubRaw = await getHubIndex();
  const hubFetchFailed = hubRaw === null;
  const data = hubRaw ?? {};
  const term = (await getCategoryBySlug(slugParam)) as {
    slug?: string;
    name?: string;
    description?: unknown;
  } | null;
  if (!term?.slug) return null;

  const catSlug = String(term.slug).trim();
  const termName = String(term.name || catSlug).trim();

  const services = filterByCategory((data as { services?: { nodes?: unknown[] } }).services?.nodes ?? [], catSlug);
  const locations = filterByCategory((data as { locationpages?: { nodes?: unknown[] } }).locationpages?.nodes ?? [], catSlug);
  const prices = filterByCategory((data as { pricemodels?: { nodes?: unknown[] } }).pricemodels?.nodes ?? [], catSlug);

  const seedFaqs = categoryFaqSeed(catSlug, termName);
  const faqs = seedFaqs.filter((x) => x.q && x.a).slice(0, 10);

  const termDescPlain = stripHtml(String(term.description || "")).trim();
  let termDescHtml = rewriteWpImagesInHtml(toHtml(term.description));

  const pageUrl = `${siteUrl()}/categories/${catSlug}`;
  const breadcrumbJson = jsonLdBreadcrumb(pageUrl, [
    { name: "WEBUY HUB", url: `${siteUrl()}/` },
    { name: "หมวดสินค้า", url: `${siteUrl()}/categories` },
    { name: termName, url: pageUrl },
  ]);
  const faqJson = jsonLdFaqPage(
    pageUrl,
    faqs.map((f) => ({ title: f.q, answer: f.a }))
  );

  const fallback = `รวมเนื้อหาในหมวด ${termName}: บริการ • พื้นที่ • รุ่น/ราคา • FAQ พร้อมลิงก์เชื่อมโยงภายในแบบ Silo`;
  const description = inferDescriptionFromHtml(term.description, fallback);

  const topInternalLinks = [
    ...services.slice(0, 5).map((s: { slug?: string; title?: string }) => ({
      href: `/services/${s.slug}`,
      label: `บริการ: ${s.title}`,
    })),
    ...locations.slice(0, 5).map((l: { slug?: string; title?: string }) => ({
      href: `/locations/${l.slug}`,
      label: `${l.title}`,
    })),
    ...prices.slice(0, 5).map((p: { slug?: string; title?: string }) => ({
      href: `/prices/${p.slug}`,
      label: `${p.title}`,
    })),
  ].slice(0, 15);

  return {
    title: `หมวดสินค้า: ${termName} | WEBUY HUB`,
    description,
    catSlug,
    termName,
    termDescHtml,
    termDescPlain,
    hubFetchFailed,
    services,
    locations,
    prices,
    faqs,
    breadcrumbJson,
    faqJson,
    topInternalLinks,
  };
}
