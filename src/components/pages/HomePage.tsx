import { hubEmptyCopy } from "@/lib/hub-empty-copy";
import { getCategoriesFromHub } from "@/lib/categories";
import { priceRangeLabel } from "@/lib/price-display";
import JsonLd from "@/components/JsonLd";
import { jsonLdOrganization, jsonLdWebSite } from "@/lib/jsonld-org";
import { BUSINESS_INFO } from "@/lib/constants";
import { EmptyState } from "@/components/EmptyState";

function isPublish(status: unknown) {
  return String(status || "").toLowerCase() === "publish";
}

function takePublished(nodes: any[], limit = 8) {
  return (nodes ?? []).filter((x: any) => x?.slug && isPublish(x?.status)).slice(0, limit);
}

function takeDiversePublishedServices(nodes: any[], limit = 8) {
  const out: any[] = [];
  const seenCategories = new Set<string>();
  const seenSlugs = new Set<string>();

  for (const item of nodes ?? []) {
    if (!item?.slug || !isPublish(item?.status)) continue;
    const slug = String(item.slug);
    if (seenSlugs.has(slug)) continue;

    const category = String(item?.devicecategories?.nodes?.[0]?.slug || "").trim();
    if (category && seenCategories.has(category)) continue;

    out.push(item);
    seenSlugs.add(slug);
    if (category) seenCategories.add(category);
    if (out.length >= limit) break;
  }

  if (out.length < limit) {
    for (const item of nodes ?? []) {
      if (!item?.slug || !isPublish(item?.status)) continue;
      const slug = String(item.slug);
      if (seenSlugs.has(slug)) continue;
      out.push(item);
      seenSlugs.add(slug);
      if (out.length >= limit) break;
    }
  }

  return out;
}

export function HomePage({
  hub,
  hubFetchFailed,
  sitePage = {},
}: {
  hub: Record<string, any> | null;
  hubFetchFailed: boolean;
  sitePage?: Record<string, any>;
}) {
  const data = hub ?? {};
  const servicesAll = data.services?.nodes ?? [];
  const locationsAll = data.locationpages?.nodes ?? [];
  const pricesAll = data.pricemodels?.nodes ?? [];
  const categories = getCategoriesFromHub(data);

  const topServices = takeDiversePublishedServices(servicesAll, 8);
  const topLocations = takePublished(locationsAll, 8);
  const topPrices = takePublished(pricesAll, 8);

  const orgJson = jsonLdOrganization(sitePage ?? {});
  const websiteJson = jsonLdWebSite();

  return (
    <div className="space-y-10 py-8">
      <JsonLd json={orgJson} />
      <JsonLd json={websiteJson} />

      <section className="card hero card-pad relative overflow-hidden">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip">WEBUY HUB • รับซื้ออุปกรณ์ไอที</span>
              <span className="badge">ประเมินฟรี</span>
              <span className="badge">มีหน้าร้านจริง</span>
            </div>

            <h1 className="h1">
              รับซื้ออุปกรณ์ไอทีถึงบ้าน
              <span className="block text-brand-600">ประเมินตามสภาพ • นัดรับถึงที่ • จ่ายหลังตรวจเครื่อง</span>
            </h1>

            <p className="lead text-slate-600">
              ส่งรูป รุ่น/สเปก และสภาพทาง LINE เพื่อเช็กราคาเบื้องต้นก่อนตัดสินใจขาย มีหน้าร้านจริงที่อุบลราชธานีและให้บริการนัดรับตามพื้นที่
            </p>

            <div className="flex flex-wrap gap-3">
              <a className="btn btn-primary text-lg px-8 py-4" href={BUSINESS_INFO.lineUrl} target="_blank" rel="noreferrer">
                💬 ส่งรูปประเมินทาง LINE {BUSINESS_INFO.line}
              </a>
              <a className="btn btn-ghost" href="/categories">ดูสินค้าที่รับซื้อ →</a>
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              <a className="badge" href="#categories">สินค้าที่รับซื้อ</a>
              <a className="badge" href="#services">บริการ</a>
              <a className="badge" href="#locations">พื้นที่บริการ</a>
              <a className="badge" href="#prices">เช็กราคาตามรุ่น</a>
              <a className="badge" href="#how">ขั้นตอนขาย</a>
            </div>
          </div>

          <div className="space-y-4">
            <div className="overflow-hidden rounded-3xl border-4 border-white shadow-xl">
              <img
                src="/images/hero-products.webp"
                alt="สินค้าไอทีที่ WEBUY HUB รับประเมิน เช่น โน๊ตบุ๊ค MacBook และอุปกรณ์ไอที"
                width={600}
                height={750}
                decoding="async"
                fetchPriority="high"
                className="h-auto w-full"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="kpi"><div className="label">LINE</div><div className="value text-base">{BUSINESS_INFO.line}</div></div>
              <div className="kpi"><div className="label">เวลาหน้าร้าน</div><div className="value text-base">จ.-ส.</div></div>
              <div className="kpi"><div className="label">ที่ตั้ง</div><div className="value text-base">อุบลราชธานี</div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="section scroll-mt-24 space-y-5">
        <div className="text-center">
          <h2 className="h2">สินค้าที่รับซื้อ</h2>
          <p className="muted mt-2 text-sm">เลือกประเภทสินค้าเพื่อดูบริการ พื้นที่ให้บริการ และข้อมูลราคาที่เกี่ยวข้อง</p>
        </div>
        <div className="cards-grid">
          {categories.map((c: any) => (
            <a key={c.slug} href={`/categories/${c.slug}`} className="card p-6 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="text-lg font-extrabold">{c.name}</div>
              {c.count > 0 && <div className="muted mt-1 text-sm">มีข้อมูลที่เกี่ยวข้อง {c.count} รายการ</div>}
              <div className="mt-4 text-sm font-semibold text-brand-700">ดูรายละเอียด →</div>
            </a>
          ))}
          {!categories.length && (
            <EmptyState
              {...hubEmptyCopy(hubFetchFailed, { title: "กำลังเพิ่มข้อมูลสินค้า", description: "สอบถามสินค้าที่ต้องการขายได้ทาง LINE" })}
              icon="📦"
              actionLabel="แชท LINE"
              actionHref={BUSINESS_INFO.lineUrl}
              actionExternal
            />
          )}
        </div>
      </section>

      <section id="services" className="space-y-4 scroll-mt-24">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="h2">บริการรับซื้อที่แนะนำ</h2>
            <p className="muted text-sm">คัดบริการจากหลายประเภทสินค้า เพื่อให้เลือกสิ่งที่ตรงกับของที่ต้องการขายได้ง่ายขึ้น</p>
          </div>
          <a className="link" href="/categories">ดูสินค้าทั้งหมด →</a>
        </div>
        <div className="cards-grid">
          {topServices.map((s: any) => (
            <a key={s.slug} className="card p-6 transition hover:shadow-md" href={`/services/${s.slug}`}>
              <div className="text-base font-extrabold">{s.title}</div>
              <div className="mt-4 text-sm font-semibold text-brand-700">ดูรายละเอียดบริการ →</div>
            </a>
          ))}
          {!topServices.length && (
            <EmptyState
              {...hubEmptyCopy(hubFetchFailed, { title: "กำลังเพิ่มบริการ", description: "ส่งข้อมูลสินค้ามาทาง LINE เพื่อสอบถามได้ทันที" })}
              icon="🔧"
              actionLabel="แชท LINE"
              actionHref={BUSINESS_INFO.lineUrl}
              actionExternal
            />
          )}
        </div>
      </section>

      <section id="locations" className="space-y-4 scroll-mt-24">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="h2">พื้นที่บริการ</h2>
            <p className="muted text-sm">มีหน้าร้านจริงที่อุบลราชธานี และมีบริการนัดรับตามพื้นที่ที่ระบุในเว็บไซต์</p>
          </div>
          <a className="link" href="/locations">ดูพื้นที่ทั้งหมด →</a>
        </div>
        <div className="cards-grid">
          {topLocations.map((l: any) => (
            <a key={l.slug} className="card p-6 transition hover:shadow-md" href={`/locations/${l.slug}`}>
              <div className="text-base font-extrabold">{l.title}</div>
              <div className="mt-4 text-sm font-semibold text-brand-700">ดูรายละเอียดพื้นที่ →</div>
            </a>
          ))}
        </div>
      </section>

      <section id="prices" className="space-y-4 scroll-mt-24">
        <div>
          <h2 className="h2">รุ่นและช่วงราคารับซื้อ</h2>
          <p className="muted text-sm">ราคาเป็นข้อมูลประกอบการประเมินและอาจเปลี่ยนตามรุ่น สเปก สภาพ อุปกรณ์ และตลาดในวันที่ตรวจเครื่อง</p>
        </div>
        <div className="cards-grid">
          {topPrices.map((p: any) => {
            const range = priceRangeLabel(p);
            return (
              <a key={p.slug} className="card p-6 transition hover:shadow-md" href={`/prices/${p.slug}`}>
                <div className="text-base font-extrabold">{p.title}</div>
                {!!range && <div className="muted mt-1 text-sm">ช่วงราคารับซื้อประมาณ <span className="font-semibold text-slate-900">{range}</span> บาท</div>}
                <div className="mt-4 text-sm font-semibold text-brand-700">ดูรายละเอียดราคา →</div>
              </a>
            );
          })}
        </div>
      </section>

      <section id="how" className="card-soft p-8 sm:p-10 scroll-mt-24">
        <div className="text-center">
          <h2 className="h2">ขายกับ WEBUY HUB อย่างไร</h2>
          <p className="muted mt-2 text-sm">เริ่มจากข้อมูลจริงของเครื่องก่อน แล้วค่อยนัดตรวจสภาพ</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { n: "1", t: "ส่งข้อมูล", d: `ส่งรูป รุ่น/สเปก สภาพ และอุปกรณ์ที่มี ทาง LINE ${BUSINESS_INFO.line}` },
            { n: "2", t: "รับราคาเบื้องต้น", d: "ทีมงานตรวจข้อมูลและแจ้งช่วงราคาตามรายละเอียดที่ได้รับ" },
            { n: "3", t: "ตรวจเครื่องและชำระเงิน", d: "นัดตรวจสภาพจริง ยืนยันราคาก่อนซื้อขาย และชำระเงินตามที่ตกลง" },
          ].map((step) => (
            <div key={step.n} className="card p-6">
              <div className="text-sm font-extrabold text-brand-700">ขั้นตอน {step.n}</div>
              <div className="mt-2 text-lg font-extrabold">{step.t}</div>
              <div className="muted mt-2 text-sm leading-6">{step.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="relative min-h-[18rem] md:min-h-[26rem]">
            <img src="/images/staff-laptop.webp" alt="ทีมงานร้านอำพล เทรดดิ้ง ให้บริการรับซื้ออุปกรณ์ไอที" className="absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
          </div>
          <div className="p-8 sm:p-12 flex flex-col justify-center">
            <div className="text-sm font-bold text-brand-700">ร้านที่ตรวจสอบตัวตนได้</div>
            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold">{BUSINESS_INFO.name}</h2>
            <p className="mt-4 text-slate-600 leading-7">
              มีหน้าร้านที่อุบลราชธานี พร้อมเบอร์โทร LINE Official และข้อมูลบริษัทชัดเจน การประเมินยึดรุ่น สเปก สภาพ อุปกรณ์ และผลตรวจเครื่องจริง
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li>✓ ประเมินเบื้องต้นฟรีทาง LINE</li>
              <li>✓ แจ้งรายละเอียดและตำหนิตามสภาพจริงก่อนตกลงราคา</li>
              <li>✓ ติดต่อหน้าร้านได้ในเวลาทำการ {BUSINESS_INFO.hours}</li>
              <li>✓ LINE Official: {BUSINESS_INFO.line}</li>
            </ul>
            <div className="mt-7">
              <a className="btn btn-primary" href={BUSINESS_INFO.lineUrl} target="_blank" rel="noreferrer">คุยกับทีมงานทาง LINE</a>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-gradient-to-br from-brand-600 to-emerald-600 p-8 sm:p-12 text-center text-white shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold">ต้องการเช็กราคาก่อนขาย?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-white/90">ส่งรูป รุ่น/สเปก สภาพ และอุปกรณ์ที่มีมาให้ทีมงานตรวจข้อมูลก่อนนัดตรวจเครื่องจริง</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a className="inline-flex items-center rounded-xl bg-white px-7 py-3 font-bold text-brand-700" href={BUSINESS_INFO.lineUrl} target="_blank" rel="noreferrer">LINE {BUSINESS_INFO.line}</a>
          <a className="inline-flex items-center rounded-xl border border-white/70 px-7 py-3 font-bold text-white" href={BUSINESS_INFO.phoneHref}>โทร {BUSINESS_INFO.phone}</a>
        </div>
        <p className="mt-5 text-sm text-white/80">หน้าร้าน: {BUSINESS_INFO.hours} • ราคาสุดท้ายยืนยันหลังตรวจสภาพจริง</p>
      </section>
    </div>
  );
}
