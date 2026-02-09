// src/lib/breadcrumb.ts – breadcrumb items + BreadcrumbList JSON-LD by page type

export type Crumb = {
  name: string;
  url: string;
};

/** Standard labels (blueprint): Home, Categories index, Locations index, province/district. */
export const BREADCRUMB_LABELS = {
  home: "WEBUY HUB",
  categories: "หมวดสินค้า",
  locations: "พื้นที่บริการ",
} as const;

/**
 * Build breadcrumb items for a given page type. Use with Breadcrumbs UI and jsonLdBreadcrumb().
 * All URLs are absolute using baseUrl (e.g. siteUrl()).
 */
export function getBreadcrumbItems(
  pageType:
    | "home"
    | "categories"
    | "category"
    | "services"
    | "service"
    | "prices"
    | "price"
    | "locations"
    | "location_province"
    | "location_district",
  params: {
    baseUrl: string;
    categorySlug?: string;
    categoryName?: string;
    serviceSlug?: string;
    serviceTitle?: string;
    priceSlug?: string;
    priceTitle?: string;
    provinceSlug?: string;
    provinceName?: string;
    districtSlug?: string;
    districtName?: string;
  }
): Crumb[] {
  const base = (params.baseUrl || "").replace(/\/$/, "");
  const home: Crumb = { name: BREADCRUMB_LABELS.home, url: base + "/" };

  switch (pageType) {
    case "home":
      return [home];

    case "categories":
      return [home, { name: BREADCRUMB_LABELS.categories, url: base + "/categories" }];

    case "category":
      return [
        home,
        { name: BREADCRUMB_LABELS.categories, url: base + "/categories" },
        ...(params.categorySlug && params.categoryName
          ? [{ name: params.categoryName, url: base + "/categories/" + params.categorySlug } as Crumb]
          : []),
      ].filter((c) => c.name && c.url);

    case "services":
      return [home, { name: BREADCRUMB_LABELS.categories, url: base + "/categories" }];

    case "service":
      return [
        home,
        { name: BREADCRUMB_LABELS.categories, url: base + "/categories" },
        ...(params.categorySlug && params.categoryName
          ? [{ name: params.categoryName, url: base + "/categories/" + params.categorySlug } as Crumb]
          : []),
        ...(params.serviceSlug
          ? [{ name: params.serviceTitle || params.serviceSlug, url: base + "/services/" + params.serviceSlug } as Crumb]
          : []),
      ].filter((c) => c.name && c.url);

    case "prices":
      return [
        home,
        { name: BREADCRUMB_LABELS.categories, url: base + "/categories" },
      ];

    case "price":
      return [
        home,
        { name: BREADCRUMB_LABELS.categories, url: base + "/categories" },
        ...(params.categorySlug && params.categoryName
          ? [{ name: params.categoryName, url: base + "/categories/" + params.categorySlug } as Crumb]
          : []),
        ...(params.priceSlug
          ? [{ name: params.priceTitle || "รุ่น/ช่วงราคา", url: base + "/prices/" + params.priceSlug } as Crumb]
          : []),
      ].filter((c) => c.name && c.url);

    case "locations":
      return [home, { name: BREADCRUMB_LABELS.locations, url: base + "/locations" }];

    case "location_province":
      return [
        home,
        { name: BREADCRUMB_LABELS.locations, url: base + "/locations" },
        ...(params.provinceSlug && params.provinceName
          ? [
              {
                name: `รับซื้อโน๊ตบุ๊ค ${params.provinceName}`,
                url: base + "/locations/" + params.provinceSlug,
              } as Crumb,
            ]
          : []),
      ].filter((c) => c.name && c.url);

    case "location_district":
      return [
        home,
        { name: BREADCRUMB_LABELS.locations, url: base + "/locations" },
        ...(params.provinceSlug && params.provinceName
          ? [
              {
                name: `รับซื้อโน๊ตบุ๊ค ${params.provinceName}`,
                url: base + "/locations/" + params.provinceSlug,
              } as Crumb,
            ]
          : []),
        ...(params.districtSlug && params.districtName
          ? [
              {
                name: `รับซื้อโน๊ตบุ๊ค ${params.districtName}`,
                url: base + "/locations/" + params.provinceSlug + "/" + params.districtSlug,
              } as Crumb,
            ]
          : []),
      ].filter((c) => c.name && c.url);

    default:
      return [home];
  }
}

export function buildBreadcrumb(items: Crumb[]) {
  return items;
}

/**
 * BreadcrumbList JSON-LD (schema.org). Pass result to JsonLd component or stringify.
 * Returns plain object so JsonLd can stringify; use in jsonld.jsonLdBreadcrumb or here.
 */
export function breadcrumbJsonLd(pageUrl: string, items: Crumb[]) {
  const clean = (items || []).filter((c) => c?.name && c?.url);
  if (!clean.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": pageUrl + "#breadcrumb",
    itemListElement: clean.map((c, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: c.name,
      item: c.url,
    })),
  };
}
