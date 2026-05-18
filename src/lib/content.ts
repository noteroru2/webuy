/**
 * โหลดเนื้อหาจากไฟล์ที่ commit ไว้ใน src/generated/wp-data/ (ไม่เรียก WordPress)
 */
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "src", "generated", "wp-data");

type NodeList = { nodes?: Record<string, unknown>[] };

const cache = new Map<string, unknown>();

function dataFile(name: string): string {
  return path.join(DATA_DIR, name);
}

function ensureContent(): void {
  if (!fs.existsSync(dataFile("services.json"))) {
    throw new Error(
      "[content] Missing src/generated/wp-data/ — content must be committed before build."
    );
  }
}

function loadJson<T>(file: string): T {
  if (cache.has(file)) return cache.get(file) as T;
  const p = dataFile(file);
  if (!fs.existsSync(p)) {
    throw new Error(`[content] Missing ${p}`);
  }
  const parsed = JSON.parse(fs.readFileSync(p, "utf8")) as T;
  cache.set(file, parsed);
  return parsed;
}

function services(): Record<string, unknown>[] {
  return (loadJson<NodeList>("services.json").nodes ?? []) as Record<string, unknown>[];
}

function locationpages(): Record<string, unknown>[] {
  return (loadJson<NodeList>("locationpages.json").nodes ?? []) as Record<string, unknown>[];
}

function pricemodels(): Record<string, unknown>[] {
  return (loadJson<NodeList>("pricemodels.json").nodes ?? []) as Record<string, unknown>[];
}

function devicecategories(): Record<string, unknown>[] {
  return (loadJson<NodeList>("devicecategories.json").nodes ?? []) as Record<string, unknown>[];
}

function faqs(): Record<string, unknown>[] {
  try {
    return (loadJson<NodeList>("faqs.json").nodes ?? []) as Record<string, unknown>[];
  } catch {
    return [];
  }
}

function isPublish(status: unknown): boolean {
  return String(status || "").toLowerCase() === "publish";
}

function findBySlug(nodes: Record<string, unknown>[], slug: string): Record<string, unknown> | null {
  const s = String(slug ?? "").trim().toLowerCase();
  if (!s) return null;
  return nodes.find((n) => String(n?.slug ?? "").toLowerCase() === s) ?? null;
}

function filterWebuyLocations(nodes: Record<string, unknown>[]): Record<string, unknown>[] {
  return nodes.filter((n) => {
    const site = String(n?.site || "").toLowerCase();
    return !site || site === "webuy";
  });
}

function publishedSlugs(
  nodes: Record<string, unknown>[],
  opts?: { webuyLocationsOnly?: boolean; skipStatus?: boolean }
): string[] {
  const list = opts?.webuyLocationsOnly ? filterWebuyLocations(nodes) : nodes;
  const out: string[] = [];
  for (const n of list) {
    if (!opts?.skipStatus && !isPublish(n?.status)) continue;
    const slug = String(n?.slug ?? "").trim();
    if (slug) out.push(slug);
  }
  return [...new Set(out)];
}

let hubIndexMemo: Promise<Record<string, unknown> | null> | null = null;
let siteSettingsMemo: Promise<Record<string, unknown>> | null = null;

export async function getHubIndex(): Promise<Record<string, unknown> | null> {
  ensureContent();
  if (!hubIndexMemo) {
    hubIndexMemo = Promise.resolve({
      services: { nodes: services() },
      locationpages: { nodes: locationpages() },
      pricemodels: { nodes: pricemodels() },
      devicecategories: { nodes: devicecategories() },
      faqs: { nodes: faqs() },
    });
  }
  return hubIndexMemo;
}

export async function getServiceBySlug(slug: string): Promise<Record<string, unknown> | null> {
  ensureContent();
  const node = findBySlug(services(), slug);
  return node && isPublish(node.status) ? node : null;
}

export async function getLocationBySlug(slug: string): Promise<Record<string, unknown> | null> {
  ensureContent();
  const node = findBySlug(filterWebuyLocations(locationpages()), slug);
  return node && isPublish(node.status) ? node : null;
}

export async function getCategoryBySlug(slug: string): Promise<Record<string, unknown> | null> {
  ensureContent();
  return findBySlug(devicecategories(), slug);
}

export async function getPriceBySlug(slug: string): Promise<Record<string, unknown> | null> {
  ensureContent();
  const node = findBySlug(pricemodels(), slug);
  return node && isPublish(node.status) ? node : null;
}

export async function getSiteSettings(): Promise<Record<string, unknown>> {
  ensureContent();
  if (!siteSettingsMemo) {
    siteSettingsMemo = Promise.resolve(
      (loadJson<{ page?: Record<string, unknown> }>("site-settings.json").page ?? {}) as Record<
        string,
        unknown
      >
    );
  }
  return siteSettingsMemo;
}

export async function getAllServiceSlugs(): Promise<string[]> {
  ensureContent();
  return publishedSlugs(services());
}

export async function getAllPublishedServiceNodes(): Promise<Record<string, unknown>[]> {
  ensureContent();
  return services().filter((n) => isPublish(n.status) && String(n.slug ?? "").trim());
}

export async function getAllLocationSlugs(): Promise<string[]> {
  ensureContent();
  return publishedSlugs(locationpages(), { webuyLocationsOnly: true });
}

export async function getAllPriceSlugs(): Promise<string[]> {
  ensureContent();
  return publishedSlugs(pricemodels());
}

export async function getAllCategorySlugs(): Promise<string[]> {
  ensureContent();
  return publishedSlugs(devicecategories(), { skipStatus: true });
}

export async function getLocationIndexNodes(): Promise<
  { slug: string; title?: string; province?: string; status?: string; site?: string }[]
> {
  ensureContent();
  const nodes = filterWebuyLocations(locationpages()).filter((n) =>
    isPublish(n.status)
  ) as { slug: string; title?: string; province?: string; status?: string; site?: string }[];
  return [...nodes].sort((a, b) => String(a.title || "").localeCompare(String(b.title || ""), "th"));
}
