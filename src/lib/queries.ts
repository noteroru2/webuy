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
    services(first: 1000, where: { metaQuery: { metaArray: [{ key: "site", value: "webuy" }] } }) {
      nodes { slug status site }
    }
  }
`;

export const Q_LOCATION_SLUGS = /* GraphQL */ `
  query LocationSlugs {
    locationpages(first: 1000, where: { metaQuery: { metaArray: [{ key: "site", value: "webuy" }] } }) {
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
    pricemodels(first: 1000, where: { metaQuery: { metaArray: [{ key: "site", value: "webuy" }] } }) {
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

export const Q_SERVICE_BY_SLUG = /* GraphQL */ `
  query ServiceBySlug($slug: ID!) {
    service(id: $slug, idType: SLUG) {
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
`;

export const Q_LOCATION_BY_SLUG = /* GraphQL */ `
  query LocationBySlug($slug: ID!) {
    locationpage(id: $slug, idType: SLUG) {
      id
      title
      slug
      status
      province
      district
      site
      featuredImage
      content
    }
  }
`;

export const Q_PRICE_BY_SLUG = /* GraphQL */ `
  query PriceBySlug($slug: ID!) {
    pricemodel(id: $slug, idType: SLUG) {
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
`;

export const Q_HUB_INDEX = /* GraphQL */ `
  query HubIndex {
    services(first: 1000, where: { metaQuery: { metaArray: [{ key: "site", value: "webuy" }] } }) {
      nodes { id title slug status category site icon }
    }
    locationpages(first: 1000, where: { metaQuery: { metaArray: [{ key: "site", value: "webuy" }] } }) {
      nodes { id title slug status province district site }
    }
    pricemodels(first: 1000, where: { metaQuery: { metaArray: [{ key: "site", value: "webuy" }] } }) {
      nodes { id title slug status device price condition site }
    }
  }
`;

export const Q_DEVICECATEGORY_SLUGS = /* GraphQL */ `
  query DeviceCategorySlugs {
    devicecategories(first: 1000, where: { metaQuery: { metaArray: [{ key: "site", value: "webuy" }] } }) {
      nodes { slug site }
    }
  }
`;

export const Q_DEVICECATEGORY_BY_SLUG = /* GraphQL */ `
  query DeviceCategoryBySlug($slug: ID!) {
    devicecategory(id: $slug, idType: SLUG) {
      id
      title
      slug
      description
      icon
      site
    }
  }
`;
