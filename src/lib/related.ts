import { intersectSlugs, uniqBy } from "@/lib/shared";
import { nodeCats } from "@/lib/wp";

export function deriveCategoriesFromItems(items: any[]) {
  const cats: { slug: string; name?: string }[] = [];
  for (const it of items) {
    const nodes = it?.devicecategories?.nodes ?? [];
    for (const n of nodes) {
      const slug = String(n?.slug || "").trim();
      if (!slug) continue;
      cats.push({ slug, name: n?.name ? String(n.name) : undefined });
    }
  }
  return uniqBy(cats, (x) => x.slug);
}

export function filterByCategory(items: any[], catSlug: string) {
  const slugLower = String(catSlug || "").toLowerCase();
  return items
    .filter((x) => String(x?.status || "").toLowerCase() === "publish")
    .filter((x) => nodeCats(x).some((s: string) => String(s).toLowerCase() === slugLower));
}

export function relatedByCategory(items: any[], base: any, limit = 12) {
  const baseCats = nodeCats(base);
  const filtered = items
    .filter((x) => String(x?.status || "").toLowerCase() === "publish")
    .filter((x) => x?.slug && x.slug !== base?.slug)
    .filter((x) => intersectSlugs(nodeCats(x), baseCats));
  return filtered.slice(0, limit);
}
