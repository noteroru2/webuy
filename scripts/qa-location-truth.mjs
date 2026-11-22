import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const distRoots = ["dist", "dist/client", "dist/assets", "dist/static"];

function findOutput(relativePath) {
  for (const root of distRoots) {
    const absolutePath = path.resolve(root, relativePath);
    if (fs.existsSync(absolutePath)) return fs.readFileSync(absolutePath, "utf8");
  }
  throw new Error("Missing generated HTML: " + relativePath + " (run npm run build without FAST_BUILD_LIMIT)");
}

const slugs = {
  chonburi: "ขายโน๊ตบุ๊ค คอม มือถือจากชลบุรี",
  yala: "ขายมือถือ โน๊ตบุ๊ค และคอมจากยะลา",
  "maha-sarakham": "ขายโน๊ตบุ๊ค iPad คอมจากมหาสารคาม",
};

for (const [slug, expectedTitle] of Object.entries(slugs)) {
  const html = findOutput("locations/" + slug + "/index.html");
  assert(html.includes(expectedTitle), "Missing corrected title for " + slug);
  assert(html.includes("https://webuy.in.th/locations/" + slug + "/"), "Canonical lost for " + slug);
  assert(html.includes("อุบลราชธานี"), "No true store attribution for " + slug);
  assert(html.includes("LINE @webuy"), "LINE contact missing for " + slug);
  // A truthful warning such as <strong>ไม่รับประกัน...ได้เงินภายในวันเดียว</strong>
  // is not a promise. Check for the obsolete claims OUTSIDE explicit disclaimers.
  const unconditionalHtml = html.replace(/<strong>\s*ไม่รับประกัน[^<]*<\/strong>/g, "");
  for (const obsolete of ["วันนี้ เราพร้อมให้บริการชาว", "ประเมินฟรี รับถึงบ้าน", "ได้เงินภายในวันเดียว", "ตอบกลับภายใน 5 นาที"]) {
    if (unconditionalHtml.includes(obsolete)) {
      const p = unconditionalHtml.indexOf(obsolete);
      console.error("STALE_CLAIM_CONTEXT " + slug + " " + obsolete + ": " + unconditionalHtml.slice(Math.max(0,p-210),p+210).replace(/\s+/g, " ").slice(0,450));
    }
    assert(!unconditionalHtml.includes(obsolete), "Legacy promise still in " + slug + ": " + obsolete);
  }
  assert(!/<title>[^<]*(?:จ่ายสดทันที|รับถึงบ้าน)[^<]*<\/title>/i.test(html), "Misleading title for " + slug);
}

const indexHtml = findOutput("locations/index.html");
assert(indexHtml.includes("ส่งรูปเช็กราคาได้ก่อน"), "Location index still uses old headline");
assert(!indexHtml.includes("นัดรับถึงบ้านทั่วไทย"), "Unverified nationwide guarantee persists");

console.log("PASS: 3 protected location editorials, 3 canonicals, LINE CTAs and location index.");
