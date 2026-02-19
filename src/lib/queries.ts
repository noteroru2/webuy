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
 * List queries: มี content เพื่อให้หน้า detail แสดงข้อความจาก WordPress.
 * (WPGraphQL/Pods มัก expose content ของ CPT อยู่แล้ว)
 */
export const Q_SERVICES_LIST = /* GraphQL */ `
  query ServicesList {
    services(first: 500) {
      nodes {
        id
        title
        slug
        status
        category
        site
        icon
        content
      }
    }
  }
`;

/** ดึงแค่ 1 service ตาม slug — ใช้เมื่อ slug ไม่อยู่ใน cache (เนื้อหาใหม่จาก WP) */
export const Q_SERVICE_BY_SLUG = /* GraphQL */ `
  query ServiceBySlug($slug: String!) {
    services(where: { name: $slug }, first: 1) {
      nodes {
        id
        title
        slug
        status
        category
        site
        icon
        content
        devicecategories { nodes { slug name description } }
      }
    }
  }
`;

export const Q_LOCATIONPAGES_LIST = /* GraphQL */ `
  query LocationpagesList {
    locationpages(first: 1000) {
      nodes {
        id
        title
        slug
        status
        province
        district
        site
        content
        devicecategories { nodes { slug name } }
      }
    }
  }
`;

/** ดึงแค่ 1 location ตาม slug (เบากว่าโหลด 1000 รายการพร้อม content) — ใช้ในหน้า [province] */
export const Q_LOCATION_BY_SLUG = /* GraphQL */ `
  query LocationBySlug($slug: String!) {
    locationpages(where: { name: $slug }, first: 1) {
      nodes {
        id
        title
        slug
        status
        province
        district
        site
        content
        devicecategories { nodes { slug name } }
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
        content
      }
    }
  }
`;

/** ดึงแค่ 1 pricemodel ตาม slug — ใช้เมื่อ slug ไม่อยู่ใน cache (เนื้อหาใหม่จาก WP) */
export const Q_PRICE_BY_SLUG = /* GraphQL */ `
  query PriceBySlug($slug: String!) {
    pricemodels(where: { name: $slug }, first: 1) {
      nodes {
        id
        title
        slug
        status
        device
        price
        condition
        site
        content
        devicecategories { nodes { slug name } }
      }
    }
  }
`;

/** ลดจาก 1000 → 300 ต่อ type เพื่อไม่ให้ WP ช้า/อืดตอน ISR ยิงครั้งเดียว */
export const Q_HUB_INDEX = /* GraphQL */ `
  query HubIndex {
    services(first: 300) {
      nodes { id title slug status category site icon devicecategories { nodes { slug } } }
    }
    locationpages(first: 300) {
      nodes { id title slug status province district site devicecategories { nodes { slug } } }
    }
    pricemodels(first: 300) {
      nodes { id title slug status device price condition site devicecategories { nodes { slug } } }
    }
    devicecategories(first: 300) {
      nodes { id name slug description icon site }
    }
  }
`;

export const Q_DEVICECATEGORY_SLUGS = /* GraphQL */ `
  query DeviceCategorySlugs {
    devicecategories(first: 1000) {
      nodes { slug name site }
    }
  }
`;

export const Q_DEVICECATEGORY_BY_SLUG = /* GraphQL */ `
  query DeviceCategoryBySlug($slug: ID!) {
    devicecategory(id: $slug, idType: SLUG) {
      id
      name
      slug
      description
      icon
      site
    }
  }
`;
