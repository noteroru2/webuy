/**
 * Sync: download images referenced in WordPress content + icons, save as WebP under public/images/wp/
 * Writes src/generated/wp-image-map.json (original URL -> /images/wp/xxx.webp)
 *
 * Run: node scripts/sync-wp-images.mjs
 * Env: WPGRAPHQL_ENDPOINT (or WP_GRAPHQL_URL), optional WEBUY_GQL_SECRET
 */
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(root, ".env") });
dotenv.config({ path: path.join(root, ".env.local") });
dotenv.config({ path: path.join(root, ".env.production") });

const endpoint =
  process.env.WPGRAPHQL_ENDPOINT || process.env.WP_GRAPHQL_URL || "https://cms.webuy.in.th/graphql";

const IMG_RE = /https?:\/\/[^\s"'<>)]+\.(?:jpg|jpeg|png|gif|webp)(?:\?[^\s"'<>)]*)?/gi;

function collectUrlsFromString(s) {
  if (!s || typeof s !== "string") return [];
  const m = s.match(IMG_RE);
  return m || [];
}

async function gql(query, variables) {
  const headers = { "Content-Type": "application/json" };
  if (process.env.WEBUY_GQL_SECRET && process.env.WEBUY_GQL_SEND_SECRET !== "0") {
    headers["X-WEBUY-SECRET"] = process.env.WEBUY_GQL_SECRET;
  }
  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors?.length) {
    throw new Error(json.errors?.map((e) => e.message).join("; ") || res.statusText);
  }
  return json.data;
}

const Q_SERVICES = `
  query S { services(first: 500) { nodes { content icon } } }
`;
const Q_LOCS = `
  query L { locationpages(first: 1000) { nodes { content } } }
`;
const Q_PRICES = `
  query P { pricemodels(first: 500) { nodes { content } } }
`;
const Q_CATS = `
  query C { devicecategories(first: 500) { nodes { description icon } } }
`;

async function downloadToWebp(url, destDir) {
  const r = await fetch(url, { redirect: "follow" });
  if (!r.ok) throw new Error(`GET ${url} ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  const hash = crypto.createHash("sha256").update(url).digest("hex").slice(0, 20);
  const base = `${hash}.webp`;
  const outPath = path.join(destDir, base);
  await sharp(buf).webp({ quality: 85 }).toFile(outPath);
  return `/images/wp/${base}`;
}

async function convertLocalPublicImages() {
  const imgDir = path.join(root, "public", "images");
  let entries = [];
  try {
    entries = await fs.readdir(imgDir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (!e.isFile()) continue;
    const lower = e.name.toLowerCase();
    if (!/\.(jpg|jpeg|png|gif)$/i.test(lower)) continue;
    const full = path.join(imgDir, e.name);
    const webpName = e.name.replace(/\.(jpg|jpeg|png|gif)$/i, ".webp");
    const webpPath = path.join(imgDir, webpName);
    await sharp(full).webp({ quality: 88 }).toFile(webpPath);
    console.log("[local webp]", webpName);
    try {
      await fs.unlink(full);
    } catch {
      /* ignore */
    }
  }
}

async function ensurePlaceholderWebp() {
  const imgDir = path.join(root, "public", "images");
  await fs.mkdir(imgDir, { recursive: true });
  const specs = [
    { name: "hero-products.webp", w: 1200, h: 750, bg: { r: 16, g: 185, b: 129 } },
    { name: "staff-laptop.webp", w: 1200, h: 800, bg: { r: 30, g: 41, b: 59 } },
  ];
  for (const { name, w, h, bg } of specs) {
    const p = path.join(imgDir, name);
    try {
      await fs.access(p);
    } catch {
      await sharp({ create: { width: w, height: h, channels: 3, background: bg } })
        .webp({ quality: 88 })
        .toFile(p);
      console.log("[placeholder webp]", name);
    }
  }
}

async function main() {
  await convertLocalPublicImages();
  await ensurePlaceholderWebp();

  const destDir = path.join(root, "public", "images", "wp");
  await fs.mkdir(destDir, { recursive: true });

  const urls = new Set();
  try {
    const [s, l, p, c] = await Promise.all([
      gql(Q_SERVICES),
      gql(Q_LOCS),
      gql(Q_PRICES),
      gql(Q_CATS),
    ]);
    for (const n of s?.services?.nodes || []) {
      collectUrlsFromString(n?.content).forEach((u) => urls.add(u));
      collectUrlsFromString(n?.icon).forEach((u) => urls.add(u));
    }
    for (const n of l?.locationpages?.nodes || []) {
      collectUrlsFromString(n?.content).forEach((u) => urls.add(u));
    }
    for (const n of p?.pricemodels?.nodes || []) {
      collectUrlsFromString(n?.content).forEach((u) => urls.add(u));
    }
    for (const n of c?.devicecategories?.nodes || []) {
      collectUrlsFromString(n?.description).forEach((u) => urls.add(u));
      collectUrlsFromString(n?.icon).forEach((u) => urls.add(u));
    }
  } catch (e) {
    console.warn("[sync-wp-images] WP fetch skip:", e?.message || e);
  }

  const map = {};
  for (const url of urls) {
    if (!url.startsWith("http")) continue;
    try {
      const local = await downloadToWebp(url, destDir);
      map[url] = local;
      console.log("[webp]", local, "<-", url.slice(0, 60) + "...");
    } catch (e) {
      console.warn("[skip]", url, e?.message || e);
    }
  }

  const genDir = path.join(root, "src", "generated");
  await fs.mkdir(genDir, { recursive: true });
  await fs.writeFile(path.join(genDir, "wp-image-map.json"), JSON.stringify(map, null, 0), "utf8");
  console.log("[sync-wp-images] wrote", Object.keys(map).length, "remote mappings");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
