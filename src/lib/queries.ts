// Locked to your GraphiQL resolver names
/** ฟิลด์ Pods/Acf ขึ้นกับ schema — ถ้าไม่ได้ลงทะเบียนใน WPGraphQL ให้ใช้แค่ฟิลด์มาตรฐานของ Page */
export const Q_SITE_SETTINGS = /* GraphQL */ `
  query SiteSettings {
    page(id: "site-settings", idType: URI) {
      id
      title
      slug
      content
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

/** แบ่งหน้าสำหรับ sitemap — ใช้ first 100 ต่อ request หลีกเลี่ยง limit 100 ของ WP */
export const Q_SERVICE_SLUGS_PAGINATED = /* GraphQL */ `
  query ServiceSlugsPaginated($first: Int!, $after: String) {
    services(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
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

/** แบ่งหน้าสำหรับ sitemap */
export const Q_LOCATION_SLUGS_PAGINATED = /* GraphQL */ `
  query LocationSlugsPaginated($first: Int!, $after: String) {
    locationpages(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes { slug status site }
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

/** แบ่งหน้าสำหรับ sitemap */
export const Q_PRICE_SLUGS_PAGINATED = /* GraphQL */ `
  query PriceSlugsPaginated($first: Int!, $after: String) {
    pricemodels(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes { slug status site }
    }
  }
`;

/** ใช้เมื่อ CPT FAQ ถูก expose เป็น RootQuery.faqs — บางไซต์ยังไม่เปิดใน schema */
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
        condition
        site
        content
        devicecategories { nodes { slug name } }
      }
    }
  }
`;

/** Hub หน้าแรก/ลิงก์ภายใน — จำกัดจำนวน + ไม่ดึง description ของหมวด (ลด memory/timeout ฝั่ง WP) */
export const Q_HUB_INDEX = /* GraphQL */ `
  query HubIndex {
    services(first: 100) {
      nodes { id title slug status category site icon devicecategories { nodes { slug } } }
    }
    locationpages(first: 100) {
      nodes { id title slug status province district site devicecategories { nodes { slug } } }
    }
    pricemodels(first: 100) {
      nodes { id title slug status device condition site devicecategories { nodes { slug } } }
    }
    devicecategories(first: 100) {
      nodes { id name slug icon site }
    }
  }
`;

/** แยกเป็นคิวรีละ root — ยิงพร้อมกันได้ ลดโอกาส WP 500 จาก query ใหญ่ชุดเดียว */
export const Q_HUB_SERVICES = /* GraphQL */ `
  query HubServices {
    services(first: 100) {
      nodes { id title slug status category site icon devicecategories { nodes { slug } } }
    }
  }
`;
export const Q_HUB_LOCATIONPAGES = /* GraphQL */ `
  query HubLocations {
    locationpages(first: 100) {
      nodes { id title slug status province district site devicecategories { nodes { slug } } }
    }
  }
`;
export const Q_HUB_PRICEMODELS = /* GraphQL */ `
  query HubPrices {
    pricemodels(first: 100) {
      nodes { id title slug status device condition site devicecategories { nodes { slug } } }
    }
  }
`;
export const Q_HUB_DEVICECATEGORIES = /* GraphQL */ `
  query HubDeviceCategories {
    devicecategories(first: 100) {
      nodes { id name slug icon site }
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

/** แบ่งหน้าสำหรับ sitemap */
export const Q_DEVICECATEGORY_SLUGS_PAGINATED = /* GraphQL */ `
  query DeviceCategorySlugsPaginated($first: Int!, $after: String) {
    devicecategories(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes { slug site }
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
