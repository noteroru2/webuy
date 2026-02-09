export type Maybe<T> = T | null | undefined;

export function uniqBy<T>(arr: T[], key: (x: T) => string) {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of arr) {
    const k = key(item);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

export function stripHtml(input: string) {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function intersectSlugs(a: string[], b: string[]) {
  const setB = new Set(b);
  return a.some((x) => setB.has(x));
}

export function safeJsonLd<T extends object>(obj: T | null) {
  if (!obj) return null;
  return JSON.stringify(obj, null, 0);
}
