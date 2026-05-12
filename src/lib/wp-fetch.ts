/**
 * WordPress GraphQL client for Astro static build (no Next.js cache).
 */
const DEFAULT_SITE_URL = "https://webuy.in.th";

const TIMEOUT = Number(import.meta.env.WP_FETCH_TIMEOUT_MS ?? 45000);
const RETRY = Number(import.meta.env.WP_FETCH_RETRY ?? 2);
const REQUEST_DELAY_MS = Number(import.meta.env.WP_REQUEST_DELAY_MS ?? 400);
let lastRequestTime = 0;

export function siteUrl(): string {
  const raw =
    import.meta.env?.PUBLIC_SITE_URL ||
    process.env.PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    DEFAULT_SITE_URL;
  const trimmed = String(raw).trim().replace(/\/+$/, "") || DEFAULT_SITE_URL;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return DEFAULT_SITE_URL;
    }
    return parsed.origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

function gqlEndpoint(): string {
  return (
    import.meta.env?.WPGRAPHQL_ENDPOINT ||
    process.env.WPGRAPHQL_ENDPOINT ||
    process.env.WP_GRAPHQL_URL ||
    "https://cms.webuy.in.th/graphql"
  );
}

async function doFetch(body: unknown, opts?: { skipDelay?: boolean }) {
  if (!opts?.skipDelay) {
    const now = Date.now();
    const elapsed = now - lastRequestTime;
    if (elapsed < REQUEST_DELAY_MS && lastRequestTime > 0) {
      await new Promise((r) => setTimeout(r, REQUEST_DELAY_MS - elapsed));
    }
  }
  lastRequestTime = Date.now();

  const url = gqlEndpoint();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const secret = import.meta.env?.WEBUY_GQL_SECRET || process.env.WEBUY_GQL_SECRET;
  const sendOff = import.meta.env?.WEBUY_GQL_SEND_SECRET || process.env.WEBUY_GQL_SEND_SECRET;
  const sendSecret = secret && sendOff !== "0" && sendOff !== "false";
  if (sendSecret) {
    headers["X-WEBUY-SECRET"] = String(secret);
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`WPGraphQL ${res.status}: ${text.slice(0, 200)}`);
    }
    const json = await res.json();
    if (json.errors?.length) {
      const parts = json.errors.map((e: { message?: string }) => e?.message || String(e)).filter(Boolean);
      throw new Error(`GraphQL: ${Array.from(new Set(parts)).join("; ")}`);
    }
    return json.data ?? json;
  } finally {
    clearTimeout(id);
  }
}

export async function fetchGql<T>(query: string, variables?: unknown, opts?: { skipDelay?: boolean }): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i <= RETRY; i++) {
    try {
      const raw = await doFetch({ query, variables }, { skipDelay: opts?.skipDelay });
      if (raw && typeof raw === "object" && "errors" in raw && Array.isArray((raw as { errors?: unknown[] }).errors)) {
        const errs = (raw as { errors: { message?: string }[] }).errors;
        const msg = errs.map((e) => e?.message || String(e)).join("; ");
        throw new Error(`GraphQL errors: ${msg}`);
      }
      return raw as T;
    } catch (e) {
      lastErr = e;
      const msg = (e as Error)?.message ?? "";
      if (/returned (500|502|503)/.test(msg)) break;
      if (/^GraphQL:/.test(msg) || /^GraphQL errors:/.test(msg)) break;
    }
  }
  console.warn("[wp-fetch] failed:", (lastErr as Error)?.message || lastErr);
  return {} as T;
}

export function nodeCats(node: {
  devicecategories?: { nodes?: { slug?: string }[] };
  category?: string;
}): string[] {
  const nodes = node?.devicecategories?.nodes ?? [];
  const fromNodes = nodes.map((n) => String(n?.slug ?? "").trim()).filter(Boolean);
  if (fromNodes.length) return fromNodes;
  const cat = node?.category ? String(node.category).trim() : "";
  return cat ? [cat] : [];
}
