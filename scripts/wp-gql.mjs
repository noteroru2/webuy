/**
 * Shared GraphQL client + queries for WP sync scripts.
 */
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function loadEnv(root) {
  dotenv.config({ path: path.join(root, ".env") });
  dotenv.config({ path: path.join(root, ".env.local") });
  dotenv.config({ path: path.join(root, ".env.production") });
}

export function gqlEndpoint() {
  return (
    process.env.WPGRAPHQL_ENDPOINT ||
    process.env.WP_GRAPHQL_URL ||
    "https://cms.webuy.in.th/graphql"
  );
}

const DELAY_MS = Number(process.env.WP_REQUEST_DELAY_MS ?? 400);
let lastRequestTime = 0;

export async function gql(query, variables) {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < DELAY_MS && lastRequestTime > 0) {
    await new Promise((r) => setTimeout(r, DELAY_MS - elapsed));
  }
  lastRequestTime = Date.now();

  const headers = { "Content-Type": "application/json" };
  if (process.env.WEBUY_GQL_SECRET && process.env.WEBUY_GQL_SEND_SECRET !== "0") {
    headers["X-WEBUY-SECRET"] = process.env.WEBUY_GQL_SECRET;
  }

  const res = await fetch(gqlEndpoint(), {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(
      `WPGraphQL returned non-JSON (${res.status}): ${text.slice(0, 120).replace(/\s+/g, " ")} — check WPGRAPHQL_ENDPOINT`
    );
  }
  if (!res.ok || json.errors?.length) {
    throw new Error(json.errors?.map((e) => e.message).join("; ") || res.statusText);
  }
  return json.data;
}

export async function paginate(rootKey, query, mapNode = (n) => n) {
  const out = [];
  let after;
  for (;;) {
    const data = await gql(query, { first: 100, after });
    const root = data?.[rootKey];
    const nodes = root?.nodes ?? [];
    for (const n of nodes) out.push(mapNode(n));
    const pi = root?.pageInfo;
    if (!pi?.hasNextPage) break;
    after = pi.endCursor;
  }
  return out;
}

export const Q_SERVICES_BUILD = `
  query ServicesBuild($first: Int!, $after: String) {
    services(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id title slug status category site icon content
        devicecategories { nodes { slug name description } }
      }
    }
  }
`;

export const Q_LOCATIONPAGES_BUILD = `
  query LocationpagesBuild($first: Int!, $after: String) {
    locationpages(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id title slug status province district site content
        devicecategories { nodes { slug name } }
      }
    }
  }
`;

export const Q_PRICEMODELS_BUILD = `
  query PricemodelsBuild($first: Int!, $after: String) {
    pricemodels(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id title slug status device condition site content
        devicecategories { nodes { slug name } }
      }
    }
  }
`;

export const Q_DEVICECATEGORIES_BUILD = `
  query DevicecategoriesBuild($first: Int!, $after: String) {
    devicecategories(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes { id name slug description icon site }
    }
  }
`;

export const Q_SITE_SETTINGS = `
  query SiteSettings {
    page(id: "site-settings", idType: URI) {
      id title slug content
    }
  }
`;

export const Q_FAQ_LIST = `
  query FaqList {
    faqs(first: 1000) {
      nodes {
        id title slug question answer
        devicecategories { nodes { slug name description } }
      }
    }
  }
`;
