import { fetchGql } from "@/lib/wp-fetch";
import {
  Q_HUB_SERVICES,
  Q_HUB_LOCATIONPAGES,
  Q_HUB_PRICEMODELS,
  Q_HUB_DEVICECATEGORIES,
  Q_HUB_INDEX,
  Q_SERVICE_BY_SLUG,
  Q_LOCATION_BY_SLUG,
  Q_LOCATION_SLUGS,
  Q_LOCATIONPAGES_LIST,
  Q_PRICE_BY_SLUG,
  Q_PRICEMODELS_LIST,
  Q_DEVICECATEGORY_BY_SLUG,
  Q_SITE_SETTINGS,
  Q_SERVICE_SLUGS_PAGINATED,
  Q_LOCATION_SLUGS_PAGINATED,
  Q_PRICE_SLUGS_PAGINATED,
  Q_DEVICECATEGORY_SLUGS_PAGINATED,
} from "@/lib/queries";

const hubOpts = { skipDelay: true } as const;

function isPublish(status: unknown) {
  return String(status || "").toLowerCase() === "publish";
}

export async function fetchHubMerged(): Promise<{
  services?: { nodes?: unknown[] };
  locationpages?: { nodes?: unknown[] };
  pricemodels?: { nodes?: unknown[] };
  devicecategories?: { nodes?: unknown[] };
}> {
  const [r0, r1, r2, r3] = await Promise.allSettled([
    fetchGql(Q_HUB_SERVICES, undefined, hubOpts),
    fetchGql(Q_HUB_LOCATIONPAGES, undefined, hubOpts),
    fetchGql(Q_HUB_PRICEMODELS, undefined, hubOpts),
    fetchGql(Q_HUB_DEVICECATEGORIES, undefined, hubOpts),
  ]);

  const out = {
    services: { nodes: [] as unknown[] },
    locationpages: { nodes: [] as unknown[] },
    pricemodels: { nodes: [] as unknown[] },
    devicecategories: { nodes: [] as unknown[] },
  };

  if (r0.status === "fulfilled" && (r0.value as { services?: { nodes?: unknown[] } })?.services) {
    out.services = (r0.value as { services: { nodes: unknown[] } }).services;
  }
  if (r1.status === "fulfilled" && (r1.value as { locationpages?: { nodes?: unknown[] } })?.locationpages) {
    out.locationpages = (r1.value as { locationpages: { nodes: unknown[] } }).locationpages;
  }
  if (r2.status === "fulfilled" && (r2.value as { pricemodels?: { nodes?: unknown[] } })?.pricemodels) {
    out.pricemodels = (r2.value as { pricemodels: { nodes: unknown[] } }).pricemodels;
  }
  if (r3.status === "fulfilled" && (r3.value as { devicecategories?: { nodes?: unknown[] } })?.devicecategories) {
    out.devicecategories = (r3.value as { devicecategories: { nodes: unknown[] } }).devicecategories;
  }

  const allRejected = [r0, r1, r2, r3].every((r) => r.status === "rejected");
  if (!allRejected) return out;

  return fetchGql(Q_HUB_INDEX, undefined, hubOpts);
}

export async function getHubIndex(): Promise<Record<string, unknown> | null> {
  try {
    const row = (await fetchHubMerged()) as Record<string, unknown>;
    const merged = {
      ...row,
      faqs: { nodes: [] as unknown[] },
    };
    const empty =
      !(merged.services as { nodes?: unknown[] } | undefined)?.nodes?.length &&
      !(merged.locationpages as { nodes?: unknown[] } | undefined)?.nodes?.length &&
      !(merged.pricemodels as { nodes?: unknown[] } | undefined)?.nodes?.length &&
      !(merged.devicecategories as { nodes?: unknown[] } | undefined)?.nodes?.length;
    if (empty) return null;
    return merged;
  } catch {
    return null;
  }
}

export async function getServiceBySlug(slug: string) {
  const s = String(slug ?? "").trim();
  if (!s) return null;
  const res = await fetchGql<{ services?: { nodes?: { status?: string; slug?: string }[] } }>(
    Q_SERVICE_BY_SLUG,
    { slug: s },
    hubOpts
  );
  const node = res?.services?.nodes?.[0];
  return node && isPublish(node?.status) ? node : null;
}

export async function getLocationBySlug(slug: string) {
  const s = String(slug ?? "").trim();
  if (!s) return null;

  async function oneBySlug(slugToTry: string) {
    const one = await fetchGql<{ locationpages?: { nodes?: { status?: string }[] } }>(
      Q_LOCATION_BY_SLUG,
      { slug: slugToTry },
      hubOpts
    );
    const node = (one?.locationpages?.nodes ?? [])[0];
    return node && isPublish(node?.status) ? node : null;
  }

  const direct = await oneBySlug(s);
  if (direct) return direct;

  const slugData = await fetchGql<{
    locationpages?: {
      nodes?: {
        slug?: string;
        status?: string;
        title?: string;
        province?: string;
        district?: string;
        site?: string;
      }[];
    };
  }>(Q_LOCATION_SLUGS, undefined, hubOpts);
  const slugNode = (slugData?.locationpages?.nodes ?? []).find(
    (n) => String(n?.slug || "").toLowerCase() === s.toLowerCase() && isPublish(n?.status)
  );
  if (slugNode) {
    const resolved = String(slugNode.slug ?? s).trim();
    const full = await oneBySlug(resolved);
    if (full) return full;
    return {
      slug: resolved,
      title:
        slugNode.title ??
        s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" "),
      content: "",
      status: "publish",
      province: slugNode.province ?? "",
      district: slugNode.district ?? null,
      site: slugNode.site ?? "webuy",
      devicecategories: { nodes: [] },
    };
  }

  const data = await fetchGql<{ locationpages?: { nodes?: { slug?: string; status?: string }[] } }>(
    Q_LOCATIONPAGES_LIST,
    undefined,
    hubOpts
  );
  const loc = (data?.locationpages?.nodes ?? []).find((n) => String(n?.slug || "").toLowerCase() === s.toLowerCase());
  if (loc && isPublish(loc?.status)) return loc;
  return null;
}

export async function getCategoryBySlug(slug: string) {
  const s = String(slug ?? "").trim();
  if (!s) return null;
  const index = await getHubIndex();
  const term = (index?.devicecategories as { nodes?: { slug?: string }[] } | undefined)?.nodes?.find(
    (n) => String(n?.slug || "").toLowerCase() === s.toLowerCase()
  );
  if (term?.slug) return term;
  const bySlug = await fetchGql<{ devicecategory?: unknown }>(Q_DEVICECATEGORY_BY_SLUG, { slug: s }, hubOpts);
  return bySlug?.devicecategory ?? null;
}

export async function getPriceBySlug(slug: string) {
  const s = String(slug ?? "").trim();
  if (!s) return null;
  const data = await fetchGql<{ pricemodels?: { nodes?: { slug?: string; status?: string }[] } }>(
    Q_PRICEMODELS_LIST,
    undefined,
    hubOpts
  );
  const p = (data?.pricemodels?.nodes ?? []).find((n) => String(n?.slug || "").toLowerCase() === s.toLowerCase());
  if (p && isPublish(p?.status)) return p;
  const bySlug = await fetchGql<{ pricemodels?: { nodes?: { status?: string }[] } }>(
    Q_PRICE_BY_SLUG,
    { slug: s },
    hubOpts
  );
  const node = bySlug?.pricemodels?.nodes?.[0];
  return node && isPublish(node?.status) ? node : null;
}

export async function getSiteSettings() {
  try {
    const data = await fetchGql<{ page?: unknown }>(Q_SITE_SETTINGS, undefined, hubOpts);
    return data?.page ?? {};
  } catch {
    return {};
  }
}

async function paginateSlugs(
  query: string,
  rootKey: "services" | "locationpages" | "pricemodels" | "devicecategories"
): Promise<string[]> {
  const out: string[] = [];
  let after: string | undefined;
  for (;;) {
    const data = await fetchGql<
      Record<
        string,
        {
          nodes?: { slug?: string; status?: string; site?: string }[];
          pageInfo?: { hasNextPage?: boolean; endCursor?: string };
        }
      >
    >(query, { first: 100, after }, hubOpts);
    const root = data?.[rootKey];
    const nodes = root?.nodes ?? [];
    for (const n of nodes) {
      if (!n?.slug) continue;
      // devicecategories (Pods taxonomy) มักไม่มีฟิลด์ status ใน list query — อย่าตัดทิ้งเพราะ undefined
      if (rootKey !== "devicecategories" && !isPublish(n?.status)) continue;
      const site = String(n?.site || "").toLowerCase();
      if (rootKey === "locationpages" && site && site !== "webuy") continue;
      out.push(String(n.slug));
    }
    const pi = root?.pageInfo;
    if (!pi?.hasNextPage) break;
    after = pi.endCursor;
  }
  return [...new Set(out)];
}

export function getAllServiceSlugs() {
  return paginateSlugs(Q_SERVICE_SLUGS_PAGINATED, "services");
}

export function getAllLocationSlugs() {
  return paginateSlugs(Q_LOCATION_SLUGS_PAGINATED, "locationpages");
}

export function getAllPriceSlugs() {
  return paginateSlugs(Q_PRICE_SLUGS_PAGINATED, "pricemodels");
}

export function getAllCategorySlugs() {
  return paginateSlugs(Q_DEVICECATEGORY_SLUGS_PAGINATED, "devicecategories");
}
