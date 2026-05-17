/**
 * ดึงเนื้อหา + รูปจาก WordPress มาเก็บใน repo (ครั้งเดียว / เมื่ออัปเดต CMS)
 *
 * Run: npm run sync:wp
 * Env: WPGRAPHQL_ENDPOINT, WEBUY_GQL_SECRET (optional)
 *
 * Output:
 *   src/generated/wp-data/*.json
 *   src/generated/wp-image-map.json
 *   public/images/wp/*.webp
 */
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import {
  loadEnv,
  gqlEndpoint,
  gql,
  paginate,
  Q_SERVICES_BUILD,
  Q_LOCATIONPAGES_BUILD,
  Q_PRICEMODELS_BUILD,
  Q_DEVICECATEGORIES_BUILD,
  Q_SITE_SETTINGS,
  Q_FAQ_LIST,
} from "./wp-gql.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "src", "generated", "wp-data");
const genDir = path.join(root, "src", "generated");
const wpImgDir = path.join(root, "public", "images", "wp");

const IMG_RE = /https?:\/\/[^\s"'<>)]+\.(?:jpg|jpeg|png|gif|webp)(?:\?[^\s"'<>)]*)?/gi;
const imagesOnly = process.argv.includes("--images-only");

function collectUrlsFromString(s) {
  if (!s || typeof s !== "string") return [];
  return s.match(IMG_RE) || [];
}

function collectUrlsFromNode(node) {
  const urls = new Set();
  const walk = (v) => {
    if (typeof v === "string") {
      collectUrlsFromString(v).forEach((u) => urls.add(u));
      return;
    }
    if (Array.isArray(v)) {
      v.forEach(walk);
      return;
    }
    if (v && typeof v === "object") {
      Object.values(v).forEach(walk);
    }
  };
  walk(node);
  return urls;
}

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

async function syncImagesFromPayload(payload) {
  await fs.mkdir(wpImgDir, { recursive: true });
  const urls = new Set();
  for (const n of payload.services?.nodes || []) collectUrlsFromNode(n).forEach((u) => urls.add(u));
  for (const n of payload.locationpages?.nodes || []) collectUrlsFromNode(n).forEach((u) => urls.add(u));
  for (const n of payload.pricemodels?.nodes || []) collectUrlsFromNode(n).forEach((u) => urls.add(u));
  for (const n of payload.devicecategories?.nodes || []) collectUrlsFromNode(n).forEach((u) => urls.add(u));
  for (const n of payload.faqs?.nodes || []) collectUrlsFromNode(n).forEach((u) => urls.add(u));
  if (payload.siteSettings?.content) collectUrlsFromString(payload.siteSettings.content).forEach((u) => urls.add(u));

  const map = {};
  let ok = 0;
  let skip = 0;
  for (const url of urls) {
    if (!url.startsWith("http")) continue;
    try {
      const local = await downloadToWebp(url, wpImgDir);
      map[url] = local;
      ok++;
      console.log("[webp]", local);
    } catch (e) {
      skip++;
      console.warn("[skip image]", url.slice(0, 70), e?.message || e);
    }
  }
  await fs.mkdir(genDir, { recursive: true });
  await fs.writeFile(path.join(genDir, "wp-image-map.json"), JSON.stringify(map), "utf8");
  console.log(`[images] mapped ${ok} ok, ${skip} skipped`);
  return map;
}

async function loadExistingPayload() {
  const read = async (name) => {
    try {
      const raw = await fs.readFile(path.join(dataDir, name), "utf8");
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };
  const services = await read("services.json");
  const locationpages = await read("locationpages.json");
  const pricemodels = await read("pricemodels.json");
  const devicecategories = await read("devicecategories.json");
  const siteSettings = await read("site-settings.json");
  const faqs = await read("faqs.json");
  if (!services?.nodes?.length) return null;
  return {
    services: services ?? { nodes: [] },
    locationpages: locationpages ?? { nodes: [] },
    pricemodels: pricemodels ?? { nodes: [] },
    devicecategories: devicecategories ?? { nodes: [] },
    siteSettings: siteSettings?.page ?? siteSettings ?? {},
    faqs: faqs ?? { nodes: [] },
  };
}

async function fetchAllFromWp() {
  console.log("[sync:wp] endpoint:", gqlEndpoint());

  const [services, locationpages, pricemodels, devicecategories] = await Promise.all([
    paginate("services", Q_SERVICES_BUILD),
    paginate("locationpages", Q_LOCATIONPAGES_BUILD),
    paginate("pricemodels", Q_PRICEMODELS_BUILD),
    paginate("devicecategories", Q_DEVICECATEGORIES_BUILD),
  ]);

  let siteSettings = {};
  try {
    const s = await gql(Q_SITE_SETTINGS);
    siteSettings = s?.page ?? {};
  } catch (e) {
    console.warn("[sync:wp] site-settings skip:", e?.message || e);
  }

  let faqNodes = [];
  try {
    const f = await gql(Q_FAQ_LIST);
    faqNodes = f?.faqs?.nodes ?? [];
  } catch (e) {
    console.warn("[sync:wp] faqs skip (schema may not expose faqs):", e?.message || e);
  }

  const syncedAt = new Date().toISOString();
  const payload = {
    services: { nodes: services },
    locationpages: { nodes: locationpages },
    pricemodels: { nodes: pricemodels },
    devicecategories: { nodes: devicecategories },
    siteSettings,
    faqs: { nodes: faqNodes },
    meta: {
      syncedAt,
      endpoint: gqlEndpoint(),
      counts: {
        services: services.length,
        locationpages: locationpages.length,
        pricemodels: pricemodels.length,
        devicecategories: devicecategories.length,
        faqs: faqNodes.length,
      },
    },
  };

  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(path.join(dataDir, "services.json"), JSON.stringify({ nodes: services, syncedAt }, null, 2), "utf8");
  await fs.writeFile(
    path.join(dataDir, "locationpages.json"),
    JSON.stringify({ nodes: locationpages, syncedAt }, null, 2),
    "utf8"
  );
  await fs.writeFile(
    path.join(dataDir, "pricemodels.json"),
    JSON.stringify({ nodes: pricemodels, syncedAt }, null, 2),
    "utf8"
  );
  await fs.writeFile(
    path.join(dataDir, "devicecategories.json"),
    JSON.stringify({ nodes: devicecategories, syncedAt }, null, 2),
    "utf8"
  );
  await fs.writeFile(
    path.join(dataDir, "site-settings.json"),
    JSON.stringify({ page: siteSettings, syncedAt }, null, 2),
    "utf8"
  );
  await fs.writeFile(path.join(dataDir, "faqs.json"), JSON.stringify({ nodes: faqNodes, syncedAt }, null, 2), "utf8");
  await fs.writeFile(path.join(dataDir, "meta.json"), JSON.stringify(payload.meta, null, 2), "utf8");

  console.log("[sync:wp] wrote JSON:", payload.meta.counts);
  return payload;
}

async function main() {
  loadEnv(root);

  let payload;
  if (imagesOnly) {
    payload = await loadExistingPayload();
    if (!payload) {
      console.error("[sync:wp] --images-only requires src/generated/wp-data/*.json — run npm run sync:wp first");
      process.exit(1);
    }
    console.log("[sync:wp] images-only from local JSON");
  } else {
    payload = await fetchAllFromWp();
  }

  await syncImagesFromPayload(payload);
  console.log("[sync:wp] done — commit src/generated/wp-data, wp-image-map.json, public/images/wp/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
