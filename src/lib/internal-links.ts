/**
 * Auto internal link: แปลงคำในเนื้อหา HTML เป็นลิงก์ภายใน
 * - แทนที่เฉพาะใน text content (ไม่ใช่ภายใน HTML tag หรือลิงก์ที่มีอยู่)
 * - เรียงจาก phrase ยาวสุดก่อน เพื่อเลี่ยงการแทนที่ซ้ำซ้อน
 */

export type InternalLinkReplacement = { phrase: string; href: string };

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * แปลง phrase เป็น internal link ในข้อความระหว่าง HTML tags เท่านั้น
 * ไม่แทนที่ภายใน <a ...>...</a> หรือ attribute
 */
export function addInternalLinks(
  html: string,
  replacements: InternalLinkReplacement[],
  baseUrl: string
): string {
  if (!html || !replacements?.length) return html;

  const sorted = [...replacements]
    .filter((r) => r?.phrase && r?.href)
    .sort((a, b) => b.phrase.length - a.phrase.length);

  if (!sorted.length) return html;

  // แทนที่เฉพาะใน text ระหว่าง > กับ < (ไม่ใช่ tag content)
  // เพิ่มช่องว่างหลัง </a> ถ้าตัวอักษรถัดไปเป็น Thai/letter (ป้องกัน "รับซื้อแท็บเล็ต</a>และ")
  return html.replace(/>([^<]+)</g, (_, text: string) => {
    let t = text;
    for (const { phrase, href } of sorted) {
      const url = href.startsWith("http") ? href : baseUrl.replace(/\/$/, "") + (href.startsWith("/") ? href : "/" + href);
      const regex = new RegExp(escapeRegExp(phrase), "g");
      t = t.replace(regex, (match: string, offset: number, fullString: string) => {
        const nextChar = fullString[offset + match.length];
        const needsSpace = nextChar && /[\p{L}\p{N}\u0E00-\u0E7F]/u.test(nextChar);
        return `<a href="${url}" class="internal-link">${phrase}</a>` + (needsSpace ? " " : "");
      });
    }
    return ">" + t + "<";
  });
}

/**
 * สร้างรายการ replacements จาก index (categories, services, locations, prices)
 * สำหรับหน้า location
 */
export function buildLocationInternalLinks(
  index: {
    devicecategories?: { nodes?: Array<{ slug?: string; name?: string }> };
    services?: { nodes?: Array<{ slug?: string; title?: string }> };
    locationpages?: { nodes?: Array<{ slug?: string; province?: string; title?: string }> };
  } | null,
  currentSlug: string
): InternalLinkReplacement[] {
  const out: InternalLinkReplacement[] = [];

  // Category phrase -> /categories/{slug}
  const catPhrases: Record<string, string> = {
    mobile: "รับซื้อมือถือ",
    notebook: "รับซื้อโน๊ตบุ๊ค",
    tablet: "รับซื้อแท็บเล็ต",
    computer: "รับซื้อคอมพิวเตอร์",
    accessories: "รับซื้ออุปกรณ์เสริม",
    camera: "รับซื้อกล้อง",
    gaming: "รับซื้อเกมมิ่ง",
    smartwatch: "รับซื้อสมาร์ทวอทช์",
  };
  const cats = index?.devicecategories?.nodes ?? [];
  for (const c of cats) {
    const slug = c?.slug;
    const phrase = slug ? catPhrases[slug] : null;
    if (slug && phrase) out.push({ phrase, href: `/categories/${slug}` });
  }

  // Service titles -> /services/{slug}
  const services = index?.services?.nodes ?? [];
  for (const s of services) {
    if (s?.slug && s?.title) out.push({ phrase: s.title, href: `/services/${s.slug}` });
  }

  // Province names -> /locations/{slug} (ไม่ใช่หน้าปัจจุบัน)
  const locations = index?.locationpages?.nodes ?? [];
  for (const l of locations) {
    if (l?.slug && l.slug !== currentSlug && l?.province) {
      out.push({ phrase: l.province, href: `/locations/${l.slug}` });
    }
  }

  return out;
}
