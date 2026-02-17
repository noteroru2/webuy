// src/lib/wp.ts
import { unstable_cache } from "next/cache";

// บน Vercel (build + production): timeout สั้น + ไม่ retry + fallback เมื่อ error → build ไม่ค้าง 120s
const isVercel = process.env.VERCEL === "1";
const isVercelProduction = isVercel && process.env.NODE_ENV === "production";
const TIMEOUT = Number(
  process.env.WP_FETCH_TIMEOUT_MS ||
  (isVercelProduction ? 8000 : 45000)
);
const RETRY = Number(
  process.env.WP_FETCH_RETRY ?? (isVercelProduction ? 0 : 3)
);

const REQUEST_DELAY_MS = Number(
  process.env.WP_REQUEST_DELAY_MS ?? (isVercel ? 400 : 2000)
);
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

  const url =
    process.env.WP_GRAPHQL_URL ||
    process.env.WPGRAPHQL_ENDPOINT ||
    "https://cms.webuy.in.th/graphql";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  // ส่ง X-WEBUY-SECRET เฉพาะเมื่อตั้งค่าและไม่ได้ปิดส่ง (ถ้า WP ยังไม่ตรวจ secret หรือใส่ค่าผิดแล้ว 404 ให้ตั้ง WEBUY_GQL_SEND_SECRET=0)
  const sendSecret =
    process.env.WEBUY_GQL_SECRET &&
    process.env.WEBUY_GQL_SEND_SECRET !== "0" &&
    process.env.WEBUY_GQL_SEND_SECRET !== "false";
  if (sendSecret) {
    headers["X-WEBUY-SECRET"] = process.env.WEBUY_GQL_SECRET!;
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
      const msg = json.errors.map((e: any) => e?.message || String(e)).join("; ");
      throw new Error(msg);
    }
    return json.data ?? json;
  } finally {
    clearTimeout(id);
  }
}

/** When true, return {} instead of throwing on fetch failure. บน Vercel เปิดไว้เพื่อให้ build ผ่านเมื่อ WP ช้า/ล่ม */
const FALLBACK_ON_ERROR = (() => {
  const explicit = process.env.WP_FALLBACK_ON_ERROR;
  if (explicit === "0" || explicit === "false") return false;
  if (explicit === "1" || explicit === "true") return true;
  if (isVercelProduction) return true; // build + runtime on Vercel: ไม่ throw เพื่อ build ผ่าน
  return process.env.NODE_ENV === "development";
})();

/** โหลดข้อมูลจริง (ไม่ผ่าน cache) — ใช้ภายใน fetchGql ที่ wrap ด้วย unstable_cache */
async function fetchGqlUncached<T>(
  query: string,
  variables?: any
): Promise<T> {
  let lastErr: any;
  for (let i = 0; i <= RETRY; i++) {
    try {
      const raw = await doFetch({ query, variables });
      if (raw?.errors?.length) {
        const msg = raw.errors.map((e: any) => e.message || String(e)).join("; ");
        throw new Error(`GraphQL errors: ${msg}`);
      }
      return (raw?.data ?? raw) as T;
    } catch (e) {
      lastErr = e;
      // ไม่ retry เมื่อ WP คืน 5xx (ล้มหรือ overload) — ลดเวลา build timeout
      const msg = (e as Error)?.message ?? "";
      if (/returned (500|502|503)/.test(msg)) break;
    }
  }
  if (FALLBACK_ON_ERROR) {
    console.warn("[wp] Fetch failed, using fallback (WP_FALLBACK_ON_ERROR):", lastErr?.message || lastErr);
    return {} as T;
  }
  throw lastErr;
}

/** Optional cache options (e.g. next revalidate). ใช้ unstable_cache เพื่อให้ build แรกโหลด query เดิมครั้งเดียว แล้วทุกหน้าที่ใช้ query เดิมได้ cache — ลดเวลา build มาก */
export async function fetchGql<T>(
  query: string,
  variables?: any,
  options?: { revalidate?: number }
): Promise<T> {
  const revalidate = options?.revalidate ?? 86400; // 24 ชม. default กัน WP ล่ม
  const cacheKey = ["wp-gql", query, JSON.stringify(variables ?? "")];
  const cached = unstable_cache(
    () => fetchGqlUncached<T>(query, variables),
    cacheKey,
    { revalidate, tags: ["wp"] }
  );
  return cached();
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

/** Extract category slugs from a node (devicecategories.nodes หรือ category field) */
export function nodeCats(node: any): string[] {
  const nodes = node?.devicecategories?.nodes ?? [];
  const fromNodes = nodes.map((n: any) => String(n?.slug ?? "").trim()).filter(Boolean);
  if (fromNodes.length) return fromNodes;
  const cat = node?.category ? String(node.category).trim() : "";
  return cat ? [cat] : [];
}
