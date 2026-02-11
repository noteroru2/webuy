// src/lib/wp.ts
const TIMEOUT = Number(process.env.WP_FETCH_TIMEOUT_MS || 15000); // เพิ่มจาก 8s → 15s
const RETRY = Number(process.env.WP_FETCH_RETRY || 2); // เพิ่ม retry จาก 1 → 2

// 🔧 Rate Limiting: ป้องกัน WordPress ล่มจาก concurrent requests
const REQUEST_DELAY_MS = Number(process.env.WP_REQUEST_DELAY_MS || 300); // 300ms delay ระหว่าง requests
let lastRequestTime = 0;
let requestCount = 0;

const DEFAULT_SITE_URL = "https://webuy.in.th";

export function siteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
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

async function doFetch(body: any) {
  // 🔧 Rate Limiting: รอให้ผ่านไป REQUEST_DELAY_MS ก่อนส่ง request ใหม่
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  
  if (elapsed < REQUEST_DELAY_MS && lastRequestTime > 0) {
    const waitTime = REQUEST_DELAY_MS - elapsed;
    if (process.env.NODE_ENV !== 'production') {
      console.log(`⏳ [Rate Limit] Waiting ${waitTime}ms before next request...`);
    }
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
  requestCount++;
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔍 [Request #${requestCount}] Fetching from WordPress...`);
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const res = await fetch(process.env.WPGRAPHQL_ENDPOINT!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`WordPress GraphQL returned ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } finally {
    clearTimeout(id);
  }
}

/** When true, return {} instead of throwing on fetch failure. In dev, enabled by default; set WP_FALLBACK_ON_ERROR=0 to disable. */
const FALLBACK_ON_ERROR = (() => {
  const explicit = process.env.WP_FALLBACK_ON_ERROR;
  if (explicit === "0" || explicit === "false") return false;
  if (explicit === "1" || explicit === "true") return true;
  return process.env.NODE_ENV === "development";
})();

/** Optional cache options (e.g. next revalidate); currently unused but accepted for call-site compatibility. */
export async function fetchGql<T>(query: string, variables?: any, _options?: { revalidate?: number }): Promise<T> {
  let lastErr: any;

  for (let i = 0; i <= RETRY; i++) {
    try {
      const data = await doFetch({ query, variables });
      return data.data as T;
    } catch (e) {
      lastErr = e;
    }
  }

  if (FALLBACK_ON_ERROR) {
    console.warn("[wp] Fetch failed, using fallback (WP_FALLBACK_ON_ERROR):", lastErr?.message || lastErr);
    return {} as T;
  }

  throw lastErr;
}

export async function fetchGqlSafe<T>(
  query: string,
  variables?: any
): Promise<T | null> {
  try {
    return await fetchGql<T>(query, variables);
  } catch {
    return null;
  }
}

/** Extract category slugs from a node that has devicecategories.nodes (service, price, etc.) */
export function nodeCats(node: any): string[] {
  const nodes = node?.devicecategories?.nodes ?? [];
  return nodes
    .map((n: any) => String(n?.slug ?? "").trim())
    .filter(Boolean);
}
