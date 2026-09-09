const BASE = (process.env.WEBUY_BASE_URL || "https://webuy.in.th").replace(/\/$/, "");
const EXPECTED_SOURCE = "33d8c18f6fef5e1694005ff10db0a160e531b888";

async function get(path, init = {}) {
  const url = `${BASE}${path}`;
  try {
    const res = await fetch(url, { redirect: "follow", ...init });
    const text = await res.text();
    return { url, status: res.status, ok: res.ok, text, finalUrl: res.url };
  } catch (error) {
    return { url, status: 0, ok: false, text: "", error: String(error) };
  }
}

function count(html, re) {
  return [...html.matchAll(re)].length;
}

function hasSchema(html, type) {
  const escaped = type.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`"@type"\\s*:\\s*"${escaped}"`, "i").test(html);
}

function metaDescription(html) {
  return html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1]
    || html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i)?.[1]
    || "";
}

const checks = [];
function check(name, pass, detail = "") {
  checks.push({ name, pass: Boolean(pass), detail });
}

const fingerprint = await get("/webuy-recovery-gate.json");
let fingerprintJson = null;
try { fingerprintJson = JSON.parse(fingerprint.text); } catch {}

if (!fingerprint.ok || fingerprintJson?.sourceSha !== EXPECTED_SOURCE || fingerprintJson?.gate !== "WEBUY_W5") {
  console.log(JSON.stringify({
    batch: "WEBUY_W5",
    verdict: "WAIT_FOR_DEPLOY_OR_RECRAWL",
    reason: "Production fingerprint is missing or does not match the W4+G0 behavior source.",
    fingerprintStatus: fingerprint.status,
    fingerprint: fingerprintJson,
  }, null, 2));
  process.exit(0);
}

const robots = await get("/robots.txt");
check("robots accessible", robots.ok, `status=${robots.status}`);
check("robots does not block whole site", !/User-agent:\s*\*[\s\S]*?Disallow:\s*\/\s*(?:\r?\n|$)/i.test(robots.text), "no whole-site Disallow:/");

const home = await get("/");
check("homepage 200", home.ok, `status=${home.status}`);
check("homepage one H1", count(home.text, /<h1\b/gi) === 1, `h1=${count(home.text, /<h1\b/gi)}`);
check("homepage Organization schema", hasSchema(home.text, "Organization"));
check("homepage WebSite schema", hasSchema(home.text, "WebSite"));
check("homepage no SearchAction", !hasSchema(home.text, "SearchAction"));
check("homepage no synthetic trust score", !/4\.9(?:\/5|⭐)|500\+|ปลอดภัย\s*100%|ตอบ(?:กลับ)?ภายใน\s*5\s*นาที|24\/7\s*บริการ/i.test(home.text));
check("homepage no synthetic testimonial names", !/คุณสมชาย\s*ว\.|คุณนิดา\s*ส\.|คุณวิชัย\s*ก\./i.test(home.text));
check("homepage OG image", /property=["']og:image["']/i.test(home.text));

const maha = await get("/locations/maha-sarakham/");
check("Maha Sarakham 200", maha.ok, `status=${maha.status}`);
check("Maha W1 marker", /data-location-optimization=["']WINNER_PUSH["']/i.test(maha.text), "W1 optimization marker");
check("Maha exactly one H1", count(maha.text, /<h1\b/gi) === 1, `h1=${count(maha.text, /<h1\b/gi)}`);
check("Maha Service schema", hasSchema(maha.text, "Service"));
check("Maha Breadcrumb schema", hasSchema(maha.text, "BreadcrumbList"));
check("Maha no FAQPage schema", !hasSchema(maha.text, "FAQPage"));
check("Maha no HowTo schema", !hasSchema(maha.text, "HowTo"));
check("Maha no Article schema", !hasSchema(maha.text, "Article"));
check("Maha no AggregateRating schema", !hasSchema(maha.text, "AggregateRating"));
check("Maha no English district system label", !maha.text.includes("Mueang Maha Sarakham"));

const uthai = await get("/locations/uthithani/");
const uthaiDescription = metaDescription(uthai.text);
check("Uthai Thani 200", uthai.ok, `status=${uthai.status}`);
check("Uthai W2 marker", /data-location-optimization=["']CTR_PUSH["']/i.test(uthai.text));
check("Uthai W2 description", uthaiDescription.includes("อุทัยธานี") && uthaiDescription.includes("LINE @webuy"), uthaiDescription);

const phrae = await get("/locations/phrae/");
check("Phrae combined W1/W2 marker", /data-location-optimization=["']WINNER_CTR_PUSH["']/i.test(phrae.text));

const serviceWinner = await get("/services/sell-used-printer-udonthani/");
check("protected service winner 200", serviceWinner.ok, `status=${serviceWinner.status}`);
check("service no FAQPage schema", !hasSchema(serviceWinner.text, "FAQPage"));
check("service no AggregateRating schema", !hasSchema(serviceWinner.text, "AggregateRating"));
check("service Breadcrumb schema", hasSchema(serviceWinner.text, "BreadcrumbList"));

const notebookCategory = await get("/categories/notebook/");
check("notebook category 200", notebookCategory.ok, `status=${notebookCategory.status}`);
check("category no FAQPage schema", !hasSchema(notebookCategory.text, "FAQPage"));
check("category Breadcrumb schema", hasSchema(notebookCategory.text, "BreadcrumbList"));
check("category no internal English headings", !/>\s*(?:Services|Locations|Price Models|FAQs)\s*</i.test(notebookCategory.text));

let sitemap = null;
for (const path of ["/sitemap-index.xml", "/sitemap-0.xml", "/sitemap.xml"]) {
  const candidate = await get(path);
  if (candidate.ok && /<urlset|<sitemapindex/i.test(candidate.text)) {
    sitemap = { path, ...candidate };
    break;
  }
}
check("sitemap accessible", Boolean(sitemap), sitemap?.path || "not found");
if (sitemap) check("sitemap includes location surface", sitemap.text.includes("/locations/") || /<sitemapindex/i.test(sitemap.text), sitemap.path);

const failed = checks.filter((x) => !x.pass);
const verdict = failed.length ? "NO_GO" : "PASS";
console.log(JSON.stringify({ batch: "WEBUY_W5", verdict, base: BASE, fingerprint: fingerprintJson, checks, failedCount: failed.length }, null, 2));
if (verdict === "NO_GO") process.exitCode = 1;
