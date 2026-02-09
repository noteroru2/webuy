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
      nodes { slug status }
    }
  }
`;

export const Q_LOCATION_SLUGS = /* GraphQL */ `
  query LocationSlugs {
    locationPages(first: 1000) {
      nodes {
        slug
        status
        title
        province
        district
        devicecategories {
          nodes {
            name
            slug
          }
        }
      }
    }
  }
`;

export const Q_PRICE_SLUGS = /* GraphQL */ `
  query PriceSlugs {
    priceModels(first: 1000) {
      nodes { slug status }
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
      devicecategories { nodes { slug name description } }

      content
    }
  }
`;

export const Q_LOCATION_BY_SLUG = /* GraphQL */ `
  query LocationBySlug($slug: ID!) {
    locationPage(id: $slug, idType: SLUG) {
      id
      title
      slug
      status
      province
      district
      region
      devicecategories { nodes { slug name description } }

      content
    }
  }
`;

export const Q_PRICE_BY_SLUG = /* GraphQL */ `
  query PriceBySlug($slug: ID!) {
    priceModel(id: $slug, idType: SLUG) {
      id
      title
      slug
      status
      brand
      model
      buyPriceMin
      buyPriceMax
      devicecategories { nodes { slug name description } }

      content
    }
  }
`;

export const Q_HUB_INDEX = /* GraphQL */ `
  query HubIndex {
    page(id: "site-settings", idType: URI) {
      id
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
    services(first: 1000) {
      nodes { id title slug status devicecategories { nodes { slug name description } } }
    }
    locationPages(first: 1000) {
      nodes { id title slug status province district region devicecategories { nodes { slug name description }  } }
    }
    priceModels(first: 1000) {
      nodes { id title slug status brand model buyPriceMin buyPriceMax devicecategories { nodes { slug name description } } }
    }
    faqs(first: 1000) {
      nodes { id title slug question answer devicecategories { nodes { slug name description } } }
    }
  }
`;

export const Q_DEVICECATEGORY_SLUGS = /* GraphQL */ `
  query DeviceCategorySlugs {
    devicecategories(first: 1000) {
      nodes { slug }
    }
  }
`;

export const Q_DEVICECATEGORY_BY_SLUG = /* GraphQL */ `
  query DeviceCategoryBySlug($slug: ID!) {
    devicecategory(id: $slug, idType: SLUG) {
      id
      slug
      name
      description
    }
  }
`;
