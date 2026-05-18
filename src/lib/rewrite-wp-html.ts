import imageMap from "../generated/wp-image-map.json";

type MapType = Record<string, string>;

const map = imageMap as MapType;

/** Rewrite remote image URLs in HTML to local /images/wp/*.webp paths when mapped. */
export function rewriteWpImagesInHtml(html: string): string {
  if (!html || !Object.keys(map).length) return html;
  let out = html;
  for (const [from, to] of Object.entries(map)) {
    const esc = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(esc, "g"), to);
  }
  return out;
}
