/**
 * อ่านข้อมูล WordPress จากไฟล์ที่ sync ไว้ใน repo (ไม่เรียก GraphQL)
 */
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "src", "generated", "wp-data");
const OFFLINE_FLAG = path.join(process.cwd(), ".wp-offline");

type NodeList = { nodes?: Record<string, unknown>[] };

function envFlag(name: string): boolean {
  const fromProcess = process.env[name];
  if (fromProcess === "1" || fromProcess === "true") return true;
  try {
    const fromMeta = (import.meta as { env?: Record<string, string> }).env?.[name];
    return fromMeta === "1" || fromMeta === "true";
  } catch {
    return false;
  }
}

export function isOfflineFlagSet(): boolean {
  if (envFlag("WP_OFFLINE") || envFlag("WP_USE_LOCAL")) return true;
  try {
    return fs.existsSync(OFFLINE_FLAG);
  } catch {
    return false;
  }
}

function dataFile(name: string): string {
  return path.join(DATA_DIR, name);
}

function hasLocalData(): boolean {
  try {
    return fs.existsSync(dataFile("services.json"));
  } catch {
    return false;
  }
}

/** ใช้ไฟล์ local เมื่อ WP_OFFLINE/WP_USE_LOCAL=1 หรือมี wp-data ใน repo */
export function useLocalWp(): boolean {
  if (isOfflineFlagSet()) return true;
  return hasLocalData();
}

export function requireLocalWp(): void {
  if (!hasLocalData()) {
    throw new Error(
      "[wp-local] WP_OFFLINE is set but src/generated/wp-data/ is missing. Run: npm run sync:wp"
    );
  }
}

const cache = new Map<string, unknown>();

function loadJson<T>(file: string): T | null {
  if (cache.has(file)) return cache.get(file) as T;
  const p = dataFile(file);
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, "utf8");
  const parsed = JSON.parse(raw) as T;
  cache.set(file, parsed);
  return parsed;
}

export function getLocalServices(): Record<string, unknown>[] {
  return (loadJson<NodeList>("services.json")?.nodes ?? []) as Record<string, unknown>[];
}

export function getLocalLocationpages(): Record<string, unknown>[] {
  return (loadJson<NodeList>("locationpages.json")?.nodes ?? []) as Record<string, unknown>[];
}

export function getLocalPricemodels(): Record<string, unknown>[] {
  return (loadJson<NodeList>("pricemodels.json")?.nodes ?? []) as Record<string, unknown>[];
}

export function getLocalDevicecategories(): Record<string, unknown>[] {
  return (loadJson<NodeList>("devicecategories.json")?.nodes ?? []) as Record<string, unknown>[];
}

export function getLocalFaqs(): Record<string, unknown>[] {
  return (loadJson<NodeList>("faqs.json")?.nodes ?? []) as Record<string, unknown>[];
}

export function getLocalSiteSettings(): Record<string, unknown> {
  const row = loadJson<{ page?: Record<string, unknown> }>("site-settings.json");
  return (row?.page ?? {}) as Record<string, unknown>;
}

export function getLocalHubMerged(): {
  services: { nodes: Record<string, unknown>[] };
  locationpages: { nodes: Record<string, unknown>[] };
  pricemodels: { nodes: Record<string, unknown>[] };
  devicecategories: { nodes: Record<string, unknown>[] };
  faqs: { nodes: Record<string, unknown>[] };
} {
  return {
    services: { nodes: getLocalServices() },
    locationpages: { nodes: getLocalLocationpages() },
    pricemodels: { nodes: getLocalPricemodels() },
    devicecategories: { nodes: getLocalDevicecategories() },
    faqs: { nodes: getLocalFaqs() },
  };
}

export function findBySlug(
  nodes: Record<string, unknown>[],
  slug: string
): Record<string, unknown> | null {
  const s = String(slug ?? "").trim().toLowerCase();
  if (!s) return null;
  const hit = nodes.find((n) => String(n?.slug ?? "").toLowerCase() === s);
  return hit ?? null;
}

export function filterWebuyLocations(nodes: Record<string, unknown>[]): Record<string, unknown>[] {
  return nodes.filter((n) => {
    const site = String(n?.site || "").toLowerCase();
    return !site || site === "webuy";
  });
}

export function publishedSlugs(
  nodes: Record<string, unknown>[],
  opts?: { webuyLocationsOnly?: boolean; skipStatus?: boolean }
): string[] {
  const list = opts?.webuyLocationsOnly ? filterWebuyLocations(nodes) : nodes;
  const out: string[] = [];
  for (const n of list) {
    if (!opts?.skipStatus && String(n?.status || "").toLowerCase() !== "publish") continue;
    const slug = String(n?.slug ?? "").trim();
    if (slug) out.push(slug);
  }
  return [...new Set(out)];
}
