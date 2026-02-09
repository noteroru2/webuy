// src/lib/locations.ts – province/district logic from AUTO_LOCATIONS
import type { AutoLocation } from "@/data/locations";
import { AUTO_LOCATIONS } from "@/data/locations";

/** Unique province records (one per province, no district). */
export function listProvinces(): AutoLocation[] {
  const seen = new Set<string>();
  return AUTO_LOCATIONS.filter((l) => {
    if (!l.provinceSlug || l.districtSlug) return false;
    if (seen.has(l.provinceSlug)) return false;
    seen.add(l.provinceSlug);
    return true;
  });
}

/** All district records (has provinceSlug + districtSlug). */
export function listDistricts(): AutoLocation[] {
  return AUTO_LOCATIONS.filter((l) => l.provinceSlug && l.districtSlug);
}

/**
 * Static params for locations/[...slug]: one entry per province, one per district.
 * No duplicate province paths.
 */
export function listLocationParams(): { slug: string[] }[] {
  const out: { slug: string[] }[] = [];

  for (const p of listProvinces()) {
    out.push({ slug: [p.provinceSlug] });
  }

  for (const d of listDistricts()) {
    out.push({ slug: [d.provinceSlug!, d.districtSlug!] });
  }

  return out;
}

export function findProvince(slug: string): AutoLocation | null {
  return (
    AUTO_LOCATIONS.find((l) => l.provinceSlug === slug && !l.districtSlug) ??
    null
  );
}

export function findDistrict(
  provinceSlug: string,
  districtSlug: string
): AutoLocation | null {
  return (
    AUTO_LOCATIONS.find(
      (l) =>
        l.provinceSlug === provinceSlug && l.districtSlug === districtSlug
    ) ?? null
  );
}

/** All districts in a province. */
export function collectDistricts(provinceSlug: string): AutoLocation[] {
  return AUTO_LOCATIONS.filter(
    (l) => l.provinceSlug === provinceSlug && l.districtSlug
  );
}

export type ResolvedLocation =
  | { type: "province"; data: AutoLocation }
  | { type: "district"; data: AutoLocation };

/** Resolve [...slug] to province or district; null if invalid. */
export function resolveLocationFromSlug(slug: string[]): ResolvedLocation | null {
  if (!Array.isArray(slug) || slug.length === 0) return null;

  if (slug.length === 1) {
    const p = findProvince(slug[0]);
    if (p) return { type: "province", data: p };
  }

  if (slug.length === 2) {
    const d = findDistrict(slug[0], slug[1]);
    if (d) return { type: "district", data: d };
  }

  return null;
}
