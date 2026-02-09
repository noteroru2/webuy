// Organization + WebSite schema for brand and site structure
import { siteUrl } from "@/lib/wp";
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
    logo: `${siteUrl()}/og.jpg`,
    description: "บริการรับซื้ออุปกรณ์ไอทีถึงบ้าน ประเมินไว นัดรับถึงที่ จ่ายทันที",
    telephone: telephone,
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
        telephone: telephone,
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
    description: "รวมบริการรับซื้อสินค้าไอที โน๊ตบุ๊ค MacBook PC อุปกรณ์ไอที ประเมินไว นัดรับถึงที่ จ่ายทันที",
    inLanguage: "th",
    publisher: {
      "@id": base + "#organization",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: base + "/categories?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  });
}
