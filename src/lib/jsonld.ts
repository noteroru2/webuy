import { safeJsonLd, stripHtml } from "@/lib/shared";

function toNumber(v: any): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export type LocalBusinessRating = {
  ratingValue?: number;
  reviewCount?: number;
  enabled?: boolean;
};

export function jsonLdLocalBusiness(
  site: any,
  pageUrl: string,
  area?: { province?: string; district?: string },
  rating?: LocalBusinessRating
) {
  if (!site?.businessName || !site?.telephone) return null;

  const lat = toNumber(site.geoLat);
  const lng = toNumber(site.geoLng);
  const served = [area?.district, area?.province]
    .filter(Boolean)
    .map((x) => ({ "@type": "AdministrativeArea", name: x }));

  const obj: any = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": pageUrl + "#localbusiness",
    name: site.businessName,
    url: pageUrl,
    telephone: site.telephone,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.addressStreet || undefined,
      addressLocality: site.addressLocality || undefined,
      addressRegion: site.addressRegion || undefined,
      postalCode: site.addressPostalCode || undefined,
      addressCountry: "TH",
    },
  };

  if (lat !== null && lng !== null) obj.geo = { "@type": "GeoCoordinates", latitude: lat, longitude: lng };
  if (Array.isArray(site.sameAs) && site.sameAs.length) obj.sameAs = site.sameAs;
  if (served.length) obj.areaServed = served;

  if (rating?.enabled !== false && (rating?.ratingValue != null || rating?.reviewCount != null)) {
    obj.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating.ratingValue ?? 4.9,
      reviewCount: rating.reviewCount ?? 128,
    };
  }

  return safeJsonLd(obj);
}

export function jsonLdFaqPage(pageUrl: string, faqs: { title: string; answer: string }[]) {
  if (!faqs?.length) return null;
  return safeJsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": pageUrl + "#faq",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.title,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  });
}

export function jsonLdProductOffer(pageUrl: string, product: any) {
  if (!product?.title || product.buyPriceMin == null || product.buyPriceMax == null) return null;

  return safeJsonLd({
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": pageUrl + "#product",
    name: product.title,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    description: product.content ? stripHtml(product.content) : undefined,
    offers: {
      "@type": "AggregateOffer",
      url: pageUrl,
      priceCurrency: "THB",
      lowPrice: product.buyPriceMin,
      highPrice: product.buyPriceMax,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/UsedCondition",
    },
  });
}

/** HowTo schema สำหรับขั้นตอนรับซื้อ */
export function jsonLdHowTo(pageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": pageUrl + "#howto",
    name: "ขั้นตอนรับซื้อโน๊ตบุ๊ค/อุปกรณ์ไอที",
    description: "วิธีขายโน๊ตบุ๊คและอุปกรณ์ไอทีกับ WEBUY HUB ประเมินไว นัดรับถึงที่ จ่ายทันที",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "ส่งข้อมูล",
        text: "ส่งรูป + รุ่น/สเปค + สภาพ ทาง LINE @webuy",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "ประเมินราคา",
        text: "ทีมงานตอบกลับพร้อมช่วงราคาตามสภาพจริง",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "นัดรับ/จ่ายเงิน",
        text: "นัดรับถึงบ้าน/หน้าร้าน และจ่ายทันทีหลังตรวจสภาพ",
      },
    ],
  };
}

/** BreadcrumbList JSON-LD (schema.org). Pass object to JsonLd or use with breadcrumb.breadcrumbJsonLd(). */
export function jsonLdBreadcrumb(
  pageUrl: string,
  crumbs: { name: string; url: string }[]
) {
  const clean = (crumbs || []).filter((c) => c?.name && c?.url);
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
export function jsonLdReviewAggregate(
  pageUrl: string,
  data: {
    name: string;
    ratingValue: number;
    reviewCount: number;
  }
) {
  if (!data?.name) return null;

  return safeJsonLd({
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": pageUrl + "#review",
    name: data.name,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: data.ratingValue,
      reviewCount: data.reviewCount,
    },
  });
}
