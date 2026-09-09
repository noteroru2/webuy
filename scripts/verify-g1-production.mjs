const BASE = (process.env.WEBUY_BASE_URL || "https://webuy.in.th").replace(/\/$/, "");
const EXPECTED_SOURCE = "d5177861673291b1b971e44386aee701e511e10b";

async function get(path) {
  const url = `${BASE}${path}`;
  try {
    const res = await fetch(url, { redirect: "follow" });
    const text = await res.text();
    return { url, status: res.status, ok: res.ok, text, finalUrl: res.url };
  } catch (error) {
    return { url, status: 0, ok: false, text: "", error: String(error) };
  }
}

const checks = [];
function check(name, pass, detail = "") {
  checks.push({ name, pass: Boolean(pass), detail });
}

function attr(html, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return html.match(new RegExp(`${escaped}=["']([^"']+)["']`, "i"))?.[1] || "";
}

const fingerprint = await get("/webuy-g1-gate.json");
let fingerprintJson = null;
try { fingerprintJson = JSON.parse(fingerprint.text); } catch {}

if (!fingerprint.ok || fingerprintJson?.gate !== "WEBUY_G1" || fingerprintJson?.sourceSha !== EXPECTED_SOURCE) {
  console.log(JSON.stringify({
    gate: "WEBUY_G1",
    verdict: "WAIT_FOR_DEPLOY_OR_RECRAWL",
    reason: "G1 production fingerprint is missing or does not match the expected behavior source.",
    expectedSource: EXPECTED_SOURCE,
    fingerprintStatus: fingerprint.status,
    fingerprint: fingerprintJson,
  }, null, 2));
  process.exit(0);
}

const home = await get("/");
check("homepage 200", home.ok, `status=${home.status}`);
check(
  "G1 conversion marker",
  /data-webuy-conversion-tracking=["']v1["']/i.test(home.text),
  "data-webuy-conversion-tracking=v1",
);

const ga4Status = attr(home.text, "data-ga4-status");
check(
  "GA4 status marker",
  ga4Status === "active" || ga4Status === "not-configured",
  ga4Status || "missing",
);

check("line_click event installed", home.text.includes("line_click"));
check("phone_click event installed", home.text.includes("phone_click"));
check("cta_impression event installed", home.text.includes("cta_impression"));
check("LINE banner attribution marker", /data-cta-location=["']line_banner["']/i.test(home.text));
check("contact section attribution marker", /data-cta-location=["']contact_section["']/i.test(home.text));
check("footer attribution marker", /data-cta-location=["']footer_contact["']/i.test(home.text));
check("floating LINE attribution marker", /data-cta-location=["']floating_line["']/i.test(home.text));
check(
  "no fixed five-minute promise",
  !/ตอบ(?:กลับ)?ภายใน\s*5\s*นาที|รับราคา(?:ภายใน)?\s*5\s*นาที/i.test(home.text),
);

if (ga4Status === "active") {
  check(
    "GA4 loader active",
    /googletagmanager\.com\/gtag\/js\?id=G-[A-Z0-9]+/i.test(home.text),
    "gtag loader present",
  );
}

const failed = checks.filter((item) => !item.pass);
let verdict = "NO_GO";
if (!failed.length) verdict = ga4Status === "active" ? "PASS" : "PASS_WITH_CONFIGURATION_REQUIRED";

console.log(JSON.stringify({
  gate: "WEBUY_G1",
  verdict,
  base: BASE,
  expectedSource: EXPECTED_SOURCE,
  ga4Status,
  events: ["line_click", "phone_click", "cta_impression"],
  checks,
  failedCount: failed.length,
  note: ga4Status === "not-configured"
    ? "Instrumentation is deployed, but no valid PUBLIC_GA4_MEASUREMENT_ID is active in production."
    : "GA4 measurement is active in production.",
}, null, 2));

if (verdict === "NO_GO") process.exitCode = 1;
