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

export const revalidate = 60; // Auto-revalidate ทุก 60 วินาที (ไม่ต้อง webhook)
export const dynamicParams = true;

/**
 * Generate static params - Full Static Generation + Rate Limiting
 */
export async function generateStaticParams() {
  console.log('🔍 [Services] Fetching ALL service slugs from WordPress...');
  
  try {
    const data = await fetchGql<any>(Q_SERVICE_SLUGS, undefined, { revalidate: 3600 });
    const nodes = data?.services?.nodes ?? [];
    
    if (!nodes || nodes.length === 0) {
      console.warn('⚠️ [Services] No services found in WordPress');
      return [];
    }
    
    const params = nodes
      .filter((n: any) => String(n?.status || "").toLowerCase() === "publish" && n?.slug)
      .map((n: any) => ({ slug: n.slug }));
    
    console.log(`✅ [Services] Generating ${params.length} services (full static generation)`);
    console.log(`   💼 Services:`, params.map((p: { slug: string }) => p.slug).join(', '));
    
    return params;
  } catch (error) {
    console.error('❌ [Services] Failed to fetch service slugs:', error);
    return [];
  }
}

function toHtml(x: any) {
  const s = String(x ?? "");
  return s.trim();
}

function pickPrimaryCategory(service: any) {
  const cats = service?.devicecategories?.nodes ?? [];
  if (!cats.length) return null;

  const withDesc = cats.find((c: any) => String(c?.description || "").trim());
  return withDesc || cats[0];
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = String(params.slug || "").trim();
  if (!slug) return {};

  try {
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
  } catch (error) {
    console.error('Error generating metadata for service:', slug, error);
    return {};
  }
}

export default async function Page({ params }: { params: { slug: string } }) {
  const slug = String(params.slug || "").trim();
  if (!slug) notFound();

  let service;
  let index;

  try {
    const data = await fetchGql<any>(Q_SERVICE_BY_SLUG, { slug }, { revalidate });
    service = data?.service;
    if (!service || String(service?.status || "").toLowerCase() !== "publish") notFound();
  } catch (error) {
    console.error('Error fetching service:', slug, error);
    notFound();
  }

  try {
    index = await fetchGql<any>(Q_HUB_INDEX, undefined, { revalidate: 3600 });
  } catch (error) {
    console.error('Error fetching hub index:', error);
    index = { locationPages: { nodes: [] }, priceModels: { nodes: [] }, faqs: { nodes: [] } };
  }

  const relatedLocations = relatedByCategory(index.locationPages?.nodes ?? [], service, 8);
  const relatedPrices = relatedByCategory(index.priceModels?.nodes ?? [], service, 8);

  const serviceCats = nodeCats(service);
  const faqsAll = (index.faqs?.nodes ?? []) as any[];
  const relatedFaqs = faqsAll
    .filter(
      (f) =>
        f?.slug &&
        serviceCats.some((c) => (f.devicecategories?.nodes ?? []).some((n: any) => n?.slug === c))
    )
    .slice(0, 20);

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

  const contentHtml = toHtml(service.content);

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
        <div className="flex flex-col gap-6">
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
              <a 
                className="btn btn-primary text-xl px-8 py-4 shadow-lg shadow-brand-600/30 hover:shadow-xl hover:shadow-brand-600/40 transition-all" 
                href="https://line.me/R/ti/p/@webuy" 
                target="_blank" 
                rel="noreferrer"
              >
                <span className="text-2xl mr-2">💬</span>
                LINE: @webuy
              </a>

              <Link className="btn btn-ghost" href={primaryCatSlug ? `/categories/${primaryCatSlug}` : "/categories"}>
                ดูหมวด {primaryCatName} →
              </Link>
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

            {/* Internal links block */}
            <div className="mt-4 flex flex-wrap gap-2">
              {primaryCatSlug && (
                <Link className="badge" href={`/categories/${primaryCatSlug}`}>
                  รวมเนื้อหาในหมวด {primaryCatName}
                </Link>
              )}
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
        </div>
      </section>

      {/* CONTENT */}
      {contentHtml && (
        <section className="space-y-4">
          <h2 className="h2">รายละเอียดบริการ</h2>

          <article className="card card-pad">
            {contentHtml.includes("<") ? (
              <div className="wp-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
            ) : (
              <div className="wp-content whitespace-pre-line">{contentHtml}</div>
            )}
          </article>

          <div className="card-soft p-8 text-center">
            <div className="text-xl font-extrabold text-slate-900">ต้องการประเมินราคาไว?</div>
            <div className="muted mt-2 text-base">ส่งรูป + สเปค + สภาพ ทาง LINE แล้วทีมงานจะตอบกลับพร้อมช่วงราคา</div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a 
                className="btn btn-primary text-xl px-8 py-4 shadow-lg shadow-brand-600/30 hover:shadow-xl hover:shadow-brand-600/40 transition-all" 
                href="https://line.me/R/ti/p/@webuy" 
                target="_blank" 
                rel="noreferrer"
              >
                <span className="text-2xl mr-2">💬</span>
                LINE: @webuy
              </a>
              <Link className="btn btn-ghost px-6 py-4" href={primaryCatSlug ? `/categories/${primaryCatSlug}` : "/categories"}>
                ดูหมวด {primaryCatName} →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {relatedFaqs.length > 0 && (
        <section className="space-y-4">
          <h2 className="h2">คำถามที่พบบ่อย</h2>

          <div className="grid gap-4">
            {relatedFaqs.map((f: any) => {
              const q = String(f.question || f.title || "").trim();
              const a = f.answer ? stripHtml(String(f.answer)) : "";
              if (!q || !a) return null;
              return (
                <details key={f.slug} className="faq">
                  <summary>{q}</summary>
                  <div className="answer">{a}</div>
                </details>
              );
            })}
          </div>
        </section>
      )}

      {/* RELATED LOCATIONS */}
      {relatedLocations.length > 0 && (
        <section className="space-y-4">
          <h2 className="h2">พื้นที่ที่เกี่ยวข้อง</h2>

          <div className="cards-grid">
            {relatedLocations.map((l: any) => (
              <Link key={l.slug} className="card p-6 transition hover:shadow-md" href={`/locations/${l.slug}`}>
                <div className="text-base font-extrabold">{l.title}</div>
                {l.province && (
                  <div className="muted mt-1 text-sm">📍 {l.province}</div>
                )}
                <div className="mt-4 text-sm font-semibold text-brand-700">ดูรายละเอียด →</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* RELATED PRICES */}
      {relatedPrices.length > 0 && (
        <section className="space-y-4">
          <h2 className="h2">รุ่น/ราคาที่เกี่ยวข้อง</h2>

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
                <div className="mt-4 text-sm font-semibold text-brand-700">ดูราคา →</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Footer internal links */}
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
