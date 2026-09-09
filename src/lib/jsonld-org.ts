// Organization + WebSite schema for brand and site structure
import { siteUrl } from "@/lib/site";
import { safeJsonLd } from "@/lib/shared";
import { BUSINESS_INFO } from "@/lib/constants";

export function jsonLdOrganization(site: any) {
  const businessName = site?.businessName || BUSINESS_INFO.legalName;
  const telephone = site?.telephone || BUSINESS_INFO.phone;

  return safeJsonLd({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": siteUrl() + "#organization",
    name: businessName,
    alternateName: BUSINESS_INFO.name,
    url: siteUrl(),
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl().replace(/\/$/, "")}/favicon.svg`,
    },
    description: "บริการรับซื้ออุปกรณ์ไอที มีหน้าร้านจริง ประเมินเบื้องต้นทาง LINE และนัดตรวจสภาพตามพื้นที่บริการ",
    telephone,
    address: {
      "@type": "PostalAddress",
      streetAddress: site?.addressStreet || BUSINESS_INFO.address.street,
      addressLocality: site?.addressLocality || BUSINESS_INFO.address.district,
      addressRegion: site?.addressRegion || BUSINESS_INFO.address.province,
      postalCode: site?.addressPostalCode || BUSINESS_INFO.address.postalCode,
      addressCountry: "TH",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone,
        contactType: "customer service",
        areaServed: "TH",
        availableLanguage: "th",
      },
    ],
    sameAs: site?.sameAs || [BUSINESS_INFO.lineUrl],
  });
}

export function jsonLdWebSite() {
  const base = siteUrl();
  return safeJsonLd({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": base + "#website",
    url: base,
    name: "WEBUY HUB",
    description: "รวมข้อมูลบริการรับซื้อโน๊ตบุ๊ค MacBook PC และอุปกรณ์ไอที พร้อมพื้นที่บริการและข้อมูลราคา",
    inLanguage: "th",
    publisher: { "@id": base + "#organization" },
  });
}
