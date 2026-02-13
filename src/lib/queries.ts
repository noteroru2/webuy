// Locked to your GraphiQL resolver names
export const Q_SITE_SETTINGS = /* GraphQL */ `
  query SiteSettings {
    page(id: "site-settings", idType: URI) {
      id
      title
      slug
      businessName
      telephone
      lineId
      addressStreet
      addressLocality
      addressRegion
      addressPostalCode
      geoLat
      geoLng
      openingHours
      sameAs
    }
  }
`;

export const Q_SERVICE_SLUGS = /* GraphQL */ `
  query ServiceSlugs {
    services(first: 1000) {
      nodes { slug status site }
    }
  }
`;

export const Q_LOCATION_SLUGS = /* GraphQL */ `
  query LocationSlugs {
    locationpages(first: 1000) {
      nodes {
        slug
        status
        title
        province
        district
        site
      }
    }
  }
`;

export const Q_PRICE_SLUGS = /* GraphQL */ `
  query PriceSlugs {
    pricemodels(first: 1000) {
      nodes { slug status site }
    }
  }
`;

export const Q_FAQ_LIST = /* GraphQL */ `
  query FaqList {
    faqs(first: 1000) {
      nodes {
        id
        title
        slug
        question
        answer
        devicecategories { nodes { slug name description } }

      }
    }
  }
`;

/**
 * List queries: ใช้เฉพาะฟิลด์ที่ตรงกับ Q_*_SLUGS / Q_HUB_INDEX ที่ build ผ่านแล้ว.
 * ไม่ขอ content เพราะ Pods อาจไม่ได้ expose ใน GraphQL → query error → ทุกหน้า 404.
 */
export const Q_SERVICES_LIST = /* GraphQL */ `
  query ServicesList {
    services(first: 500) {
      nodes {
        id
        title
        slug
        status
        category: _category
        site
        icon
      }
    }
  }
`;

export const Q_LOCATIONPAGES_LIST = /* GraphQL */ `
  query LocationpagesList {
    locationpages(first: 500) {
      nodes {
        id
        title
        slug
        status
        province
        district
        site
      }
    }
  }
`;

export const Q_PRICEMODELS_LIST = /* GraphQL */ `
  query PricemodelsList {
    pricemodels(first: 500) {
      nodes {
        id
        title
        slug
        status
        device
        price
        condition
        site
      }
    }
  }
`;

export const Q_HUB_INDEX = /* GraphQL */ `
  query HubIndex {
    services(first: 1000) {
      nodes { id title slug status category: _category site icon }
    }
    locationpages(first: 1000) {
      nodes { id title slug status province district site }
    }
    pricemodels(first: 1000) {
      nodes { id title slug status device price condition site }
    }
    devicecategories(first: 1000) {
      nodes { id title slug status description icon site }
    }
  }
`;

export const Q_DEVICECATEGORY_SLUGS = /* GraphQL */ `
  query DeviceCategorySlugs {
    devicecategories(first: 1000) {
      nodes { slug title site status }
    }
  }
`;

export const Q_DEVICECATEGORY_BY_SLUG = /* GraphQL */ `
  query DeviceCategoryBySlug($slug: ID!) {
    devicecategory(id: $slug, idType: SLUG) {
      id
      title
      slug
      status
      description
      icon
      site
      content
    }
  }
`;
