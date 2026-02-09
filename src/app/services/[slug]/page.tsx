import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchGql, siteUrl, nodeCats } from "@/lib/wp";
import { Q_SERVICE_SLUGS, Q_SERVICE_BY_SLUG, Q_HUB_INDEX } from "@/lib/queries";
import { relatedByCategory } from "@/lib/related";
import { JsonLd } from "@/components/JsonLd";
import { jsonLdFaqPage } from "@/lib/jsonld";
import { stripHtml } from "@/lib/shared";
import { pageMetadata, inferDescriptionFromHtml } from "@/lib/seo";
import { jsonLdBreadcrumb } from "@/lib/jsonld";
import { jsonLdReviewAggregate } from "@/lib/jsonld";

export const revalidate = 1200;

/** ดึง param ทุก service (publish) */
export async function generateStaticParams() {
  const data = await fetchGql<any>(Q_SERVICE_SLUGS, undefined, { revalidate: 3600 });
  const nodes = data.services?.nodes ?? [];
  return nodes
    .filter((n: any) => String(n?.status || "").toLowerCase() === "publish" && n?.slug)
    .map((n: any) => ({ slug: n.slug }));
}

function toHtml(x: any) {
  const s = String(x ?? "");
  return s.trim();
}

/** เลือก description ของหมวดที่ "น่าจะตรง" กับ Service นี้ */
function pickPrimaryCategory(service: any) {
  const cats = service?.devicecategories?.nodes ?? [];
  if (!cats.length) return null;

  const withDesc = cats.find((c: any) => String(c?.description || "").trim());
  return withDesc || cats[0];
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = String(params.slug || "").trim();
  if (!slug) return {};

  const data = await fetchGql<any>(Q_SERVICE_BY_SLUG, { slug }, { revalidate: 1200 });
  const service = data?.service;
  if (!service || String(service?.status || "").toLowerCase() !== "publish") return {};

  const pathname = `/services/${service.slug}`;
  const fallback = "บริการรับซื้อสินค้าไอที ประเมินไว นัดรับถึงที่ และจ่ายทันทีผ่าน LINE @webuy";

  const desc = inferDescriptionFromHtml(service.content, fallback);

  return pageMetadata({
    title: service.title || "บริการรับซื้อสินค้าไอที",
    description: desc,
    pathname,
  });
}

export default async function Page({ params }: { params: { slug: string } }) {
  const slug = String(params.slug || "").trim();
  if (!slug) notFound();

  // service detail
  const data = await fetchGql<any>(Q_SERVICE_BY_SLUG, { slug }, { revalidate });
  const service = data?.service;
  if (!service || String(service?.status || "").toLowerCase() !== "publish") notFound();

  // index for related
  const index = await fetchGql<any>(Q_HUB_INDEX, undefined, { revalidate: 3600 });

  const relatedLocations = relatedByCategory(index.locationPages?.nodes ?? [], service, 8);
  const relatedPrices = relatedByCategory(index.priceModels?.nodes ?? [], service, 8);

  // related FAQ by overlapping devicecategories
  const serviceCats = nodeCats(service);
  const faqsAll = (index.faqs?.nodes ?? []) as any[];
  const relatedFaqs = faqsAll
    .filter(
      (f) =>
        f?.slug &&
        serviceCats.some((c) => (f.devicecategories?.nodes ?? []).some((n: any) => n?.slug === c))
    )
    .slice(0, 20);

  // FAQ schema items (only filled Q/A)
  const faqItems = relatedFaqs
    .map((f) => ({
      title: String(f.question || f.title || "").trim(),
      answer: stripHtml(String(f.answer || "")),
    }))
    .filter((x) => x.title && x.answer);

  const pageUrl = `${siteUrl()}/services/${service.slug}`;
  const faqJson = jsonLdFaqPage(pageUrl, faqItems);

  const reviewJson = jsonLdReviewAggregate(pageUrl, {
  name: service.title,
  ratingValue: 4.8,
  reviewCount: 124,
});

  const cats = service.devicecategories?.nodes ?? [];
  const primaryCat = pickPrimaryCategory(service);
  const primaryCatSlug = String(primaryCat?.slug || "").trim();
  const primaryCatName = String(primaryCat?.name || primaryCatSlug || "หมวดสินค้า").trim();
  const catDesc = stripHtml(String(primaryCat?.description || "")).trim();
  
  const catName = String(primaryCat?.name || primaryCat?.slug || "").trim();
const catSlug = String(primaryCat?.slug || "").trim();
  

  const contentHtml = toHtml(service.content);
  const categoriesIndexHref = "/categories";
  // ใช้หมวดหลักเป็นลิงก์ “ดูหมวดสินค้า” ให้แน่นขึ้น (แทน hardcode notebook)
  const primaryCatHref = primaryCatSlug ? `/categories/${primaryCatSlug}` : "/";

    const breadcrumbJson = jsonLdBreadcrumb(pageUrl, [
  { name: "WEBUY HUB", url: `${siteUrl()}/` },
  { name: "หมวดสินค้า", url: `${siteUrl()}/categories` },
  ...(primaryCatSlug ? [{ name: primaryCatName, url: `${siteUrl()}/categories/${primaryCatSlug}` }] : []),
  { name: String(service.title || "บริการ"), url: pageUrl },
]);
  return (
    <div className="space-y-10">
      <JsonLd json={breadcrumbJson} />
      <JsonLd json={faqJson} />
      <JsonLd json={reviewJson} />

      {/* BREADCRUMB */}
      <nav className="pt-2 text-sm text-slate-600">
  <ol className="flex flex-wrap items-center gap-2">
    <li>
      <Link className="link" href="/">หน้าแรก</Link>
    </li>
    <li className="opacity-60">/</li>

    <li>
      <Link className="link" href="/categories">หมวดสินค้า</Link>
    </li>

    {primaryCatSlug && (
      <>
        <li className="opacity-60">/</li>
        <li>
          <Link className="link" href={`/categories/${primaryCatSlug}`}>{primaryCatName}</Link>
        </li>
      </>
    )}

    <li className="opacity-60">/</li>
    <li className="font-semibold text-slate-900">{service.title}</li>
  </ol>
</nav>


      {/* HERO */}
      <section className="card hero card-pad space-y-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip">บริการ</span>
              {cats.slice(0, 6).map((c: any) => (
                <Link key={c.slug} href={`/categories/${c.slug}`} className="badge">
                  {c.name || c.slug}
                </Link>
              ))}
            </div>

            <h1 className="h1">{service.title}</h1>

            {catDesc ? (
              <p className="lead">{catDesc}</p>
            ) : (
              <p className="lead">ประเมินไวผ่าน LINE • นัดรับถึงที่ในพื้นที่บริการ • จ่ายเงินสด/โอนหน้างาน</p>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <a className="btn btn-primary" href="https://line.me/R/ti/p/@webuy" target="_blank" rel="noreferrer">
                แชท LINE @webuy
              </a>

              <Link className="btn btn-ghost" href={primaryCatSlug ? `/categories/${primaryCatSlug}` : "/categories"}>
  ดูหมวด {primaryCatName} →
</Link>


              <a
                className="btn btn-ghost"
                href="https://search.google.com/test/rich-results"
                target="_blank"
                rel="noreferrer"
              >
                Rich Results Test
              </a>
            </div>

            {/* Quick facts */}
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { t: "ประเมินไว", d: "ส่งรูป + สเปค ทาง LINE" },
                { t: "นัดรับถึงที่", d: "ในเขตพื้นที่บริการ" },
                { t: "จ่ายทันที", d: "เงินสด / โอนหน้างาน" },
              ].map((x) => (
                <div key={x.t} className="card p-4">
                  <div className="text-sm font-extrabold">{x.t}</div>
                  <div className="mt-1 text-sm text-slate-600">{x.d}</div>
                </div>
              ))}
            </div>

            {/* Internal links block (ช่วย SEO ให้ครบ 6–12 ลิงก์/หน้า) */}
            <div className="mt-4 flex flex-wrap gap-2">
              {primaryCatSlug ? (
                <Link className="badge" href={`/categories/${primaryCatSlug}`}>
                  รวมเนื้อหาในหมวด {primaryCatName}
                </Link>
              ) : null}
              {relatedLocations.slice(0, 4).map((l: any) => (
                <Link key={l.slug} className="badge" href={`/locations/${l.slug}`}>
                  พื้นที่: {l.title}
                </Link>
              ))}
              {relatedPrices.slice(0, 4).map((p: any) => (
                <Link key={p.slug} className="badge" href={`/prices/${p.slug}`}>
                  รุ่น/ราคา: {p.title}
                </Link>
              ))}
            </div>
          </div>

          {/* KPI / Trust box */}
          <div className="grid gap-3 sm:w-[360px]">
            <div className="card-soft p-5">
              <div className="text-sm font-extrabold">สรุปหน้า</div>
              <div className="mt-3 grid gap-3">
                <div className="kpi">
                  <div className="label">FAQ ที่เกี่ยวข้อง</div>
                  <div className="value">{relatedFaqs.length}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="kpi">
                    <div className="label">พื้นที่</div>
                    <div className="value">{relatedLocations.length}</div>
                  </div>
                  <div className="kpi">
                    <div className="label">รุ่นราคา</div>
                    <div className="value">{relatedPrices.length}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-soft p-5">
              <div className="text-sm font-extrabold">ความมั่นใจในการบริการ</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>✅ ประเมินราคาไวใน LINE</li>
                <li>✅ จ่ายสด/โอนทันที</li>
                <li>✅ เงื่อนไขชัดเจน + FAQ</li>
                <li>✅ มีหน้ารุ่น/พื้นที่เชื่อมโยง</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT (บทความหลัก) */}
      <section className="space-y-4">
        <div>
          <h2 className="h2">รายละเอียดบริการ</h2>
          <p className="muted text-sm">เนื้อหาจาก WordPress (Service Content)</p>
        </div>

        {contentHtml ? (
          <article className="card card-pad">
            {contentHtml.includes("<") ? (
              <div className="wp-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
            ) : (
              <div className="wp-content whitespace-pre-line">{contentHtml}</div>
            )}
          </article>
        ) : (
          <div className="card card-pad">
            <div className="text-sm font-extrabold">ยังไม่มีเนื้อหา</div>
            <div className="muted mt-1 text-sm">
              ให้ไปเติม “Content” ใน WordPress (Service) และตรวจว่า query ดึง field <b>content</b> มาด้วย
            </div>
          </div>
        )}

        {/* CTA ซ้ำท้ายบทความ (ปิดการขาย) */}
        <div className="card-soft p-6">
          <div className="text-base font-extrabold">ต้องการประเมินราคาไว?</div>
          <div className="muted mt-1 text-sm">ส่งรูป + สเปค + สภาพ ทาง LINE แล้วทีมงานจะตอบกลับพร้อมช่วงราคา</div>
          <div className="mt-4 flex flex-wrap gap-3">
            <a className="btn btn-primary" href="https://line.me/R/ti/p/@webuy" target="_blank" rel="noreferrer">
              แชท LINE @webuy
            </a>
            <Link className="btn btn-ghost" href={primaryCatSlug ? `/categories/${primaryCatSlug}` : "/categories"}>
  ดูหมวด {primaryCatName} →
</Link>

          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="space-y-4">
        <div>
          <h2 className="h2">คำถามที่พบบ่อย</h2>
          <p className="muted text-sm">กรองเฉพาะที่มีคำตอบ (ใช้ทำ FAQPage schema)</p>
        </div>

        <div className="grid gap-4">
          {relatedFaqs.map((f: any) => {
            const q = String(f.question || f.title || "").trim();
            const a = f.answer ? stripHtml(String(f.answer)) : "";
            const ok = q && a;
            return (
              <details key={f.slug} className="faq">
                <summary>{q || "คำถามยังว่าง"}</summary>
                <div className="answer">{ok ? a : "คำถาม/คำตอบยังว่าง"}</div>
              </details>
            );
          })}

          {!relatedFaqs.length && (
            <div className="card card-pad">
              <div className="text-sm font-extrabold">ยังไม่มี FAQ ที่หมวดทับกัน</div>
              <div className="muted mt-1 text-sm">ติ๊ก devicecategories ใน FAQ ให้ตรงกับ Service</div>
            </div>
          )}
        </div>
      </section>

      {/* RELATED LOCATIONS */}
      <section className="space-y-4">
        <div>
          <h2 className="h2">พื้นที่ที่เกี่ยวข้อง</h2>
          <p className="muted text-sm">Location pages ที่หมวดทับกัน (ช่วยทำ internal linking)</p>
        </div>

        <div className="cards-grid">
          {relatedLocations.map((l: any) => (
            <Link key={l.slug} className="card p-6 transition hover:shadow-md" href={`/locations/${l.slug}`}>
              <div className="text-base font-extrabold">{l.title}</div>
              <div className="muted mt-1 text-sm">/locations/{l.slug}</div>
              <div className="mt-4 text-sm font-semibold text-brand-700">เปิดหน้า Location →</div>
            </Link>
          ))}

          {!relatedLocations.length && (
            <div className="card card-pad">
              <div className="text-sm font-extrabold">ยังไม่มี Location ที่เชื่อมหมวด</div>
              <div className="muted mt-1 text-sm">ติ๊ก devicecategories ให้ locationPage ใน WP</div>
            </div>
          )}
        </div>
      </section>

      {/* RELATED PRICES */}
      <section className="space-y-4">
        <div>
          <h2 className="h2">รุ่น/ราคาที่เกี่ยวข้อง</h2>
          <p className="muted text-sm">Price models ที่หมวดทับกัน</p>
        </div>

        <div className="cards-grid">
          {relatedPrices.map((p: any) => (
            <Link key={p.slug} className="card p-6 transition hover:shadow-md" href={`/prices/${p.slug}`}>
              <div className="text-base font-extrabold">{p.title}</div>
              <div className="muted mt-1 text-sm">
                ช่วงราคารับซื้อ:{" "}
                <span className="font-semibold text-slate-900">
                  {p.buyPriceMin}-{p.buyPriceMax}
                </span>{" "}
                บาท
              </div>
              <div className="mt-4 text-sm font-semibold text-brand-700">เปิดหน้า Price →</div>
            </Link>
          ))}

          {!relatedPrices.length && (
            <div className="card card-pad">
              <div className="text-sm font-extrabold">ยังไม่มี Price ที่เชื่อมหมวด</div>
              <div className="muted mt-1 text-sm">ติ๊ก devicecategories ให้ priceModel ใน WP</div>
            </div>
          )}
        </div>
      </section>

      {/* Footer internal links (เพิ่มอีกนิดให้ครบลิงก์) */}
      <section className="card-soft p-6">
        <div className="text-sm font-extrabold">ลิงก์ที่เกี่ยวข้อง</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {cats.slice(0, 10).map((c: any) => (
            <Link key={c.slug} className="badge" href={`/categories/${c.slug}`}>
              หมวด: {c.name || c.slug}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
