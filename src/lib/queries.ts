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

/** Fetch list and find by slug (where/name and idType:SLUG often fail with Pods CPT) */
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
        content
        devicecategories { nodes { slug title } }
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
        featuredImage
        content
        devicecategories { nodes { slug title } }
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
        devicecategories { nodes { slug title } }
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
