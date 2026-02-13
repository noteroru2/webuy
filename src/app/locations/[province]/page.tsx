import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchGql, siteUrl, nodeCats } from "@/lib/wp";
import { Q_HUB_INDEX, Q_LOCATION_SLUGS, Q_LOCATIONPAGES_LIST } from "@/lib/queries";
import JsonLd from "@/components/JsonLd";
import { jsonLdBreadcrumb, jsonLdLocalBusiness, jsonLdFaqPage } from "@/lib/jsonld";
import { pageMetadata, inferDescriptionFromHtml } from "@/lib/seo";
import { locationFaqSeed } from "@/lib/seoLocation";
import { relatedByCategory } from "@/lib/related";
import { stripHtml } from "@/lib/shared";
import { BackToTop } from "@/components/BackToTop";

export const revalidate = 60; // Auto-revalidate ทุก 60 วินาที (ไม่ต้อง webhook)
export const dynamicParams = true; // Allow dynamic routes for new location pages

function isPublish(status: any) {
  return String(status || "").toLowerCase() === "publish";
}

/** 
 * Generate static params - Full Static Generation + Rate Limiting
 * 
 * Strategy: Generate ทุกหน้าตอน build (ไม่โหลดช้า)
 * แต่ใช้ rate limiting เพื่อป้องกัน WordPress ล่ม
 * 
 * Benefits:
 * - ✅ ทุกหน้าโหลดเร็ว (pre-generated)
 * - ✅ WordPress ไม่ล่ม (มี delay ระหว่าง requests)
 * - ✅ Auto-revalidate ตาม revalidate time
 * - ✅ สามารถ manual revalidate ด้วย API
 */
export async function generateStaticParams() {
  console.log('🔍 [Locations] Fetching ALL location slugs from WordPress...');
  
  try {
    const data = await fetchGql<any>(Q_LOCATION_SLUGS, undefined, { revalidate: 3600 });
    const nodes = data?.locationpages?.nodes ?? [];
    
    if (!nodes || nodes.length === 0) {
      console.warn('⚠️ [Locations] No location pages found in WordPress');
      return [];
    }
    
    const params = nodes
      .filter((n: any) => 
        n?.slug && 
        isPublish(n?.status) &&
        String(n?.site || "").toLowerCase() === "webuy"
      )
      .map((n: any) => ({ province: String(n.slug).trim() }));
    
    console.log(`✅ [Locations] Pre-generating ${params.length} location pages`);
    console.log(`   📍 Slugs:`, params.map((p: { province: string }) => p.province).join(', '));
    
    return params;
  } catch (error) {
    console.error('❌ [Locations] Failed to fetch location slugs:', error);
    // Return empty array to allow build to continue (pages will be generated on-demand)
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { province: string };
}): Promise<Metadata> {
  const slug = String(params?.province ?? "").trim();
  if (!slug) return {};
  
  try {
    const data = await fetchGql<any>(Q_LOCATIONPAGES_LIST, undefined, { revalidate: 3600 });
    const loc = (data?.locationpages?.nodes ?? []).find((n: any) => String(n?.slug || "").toLowerCase() === String(slug).toLowerCase());
    if (!loc || !isPublish(loc?.status)) return {};
    
    const pathname = `/locations/${loc.slug}`;
    const fallback = `พื้นที่บริการรับซื้อโน๊ตบุ๊คและอุปกรณ์ไอที ${[loc.province, loc.district].filter(Boolean).join(" ")} • ประเมินไว นัดรับถึงที่ จ่ายทันที LINE @webuy`;
    const description = inferDescriptionFromHtml(loc.content, fallback);
    
    return pageMetadata({
      title: loc.title || "พื้นที่บริการ",
      description,
      pathname,
    });
  } catch (error) {
    console.error('Error generating metadata for location:', slug, error);
    return {};
  }
}

function toHtml(x: any) {
  return String(x ?? "").trim();
}

export default async function Page({
  params,
}: {
  params: { province: string };
}) {
  const slug = String(params?.province ?? "").trim();
  if (!slug) notFound();

  let location;
  let index;

  try {
    const data = await fetchGql<any>(Q_LOCATIONPAGES_LIST, undefined, { revalidate });
    location = (data?.locationpages?.nodes ?? []).find((n: any) => String(n?.slug || "").toLowerCase() === String(slug).toLowerCase());
    if (!location || !isPublish(location?.status)) notFound();
  } catch (error) {
    console.error('Error fetching location:', slug, error);
    notFound();
  }

  const emptyIndex = { services: { nodes: [] as any[] }, locationpages: { nodes: [] as any[] }, pricemodels: { nodes: [] as any[] } };
  try {
    const raw = await fetchGql<any>(Q_HUB_INDEX, undefined, { revalidate });
    index = raw ?? emptyIndex;
  } catch (error) {
    console.error('Error fetching hub index:', error);
    index = emptyIndex;
  }

  return <LocationPage location={location} index={index} />;
}

function LocationPage({ location, index }: { location: any; index: any }) {
  // Defensive: ensure location and required fields exist
  if (!location?.slug) {
    return (
      <div className="card p-8 text-center">
        <h1 className="text-xl font-bold">ไม่พบข้อมูลพื้นที่</h1>
        <p className="mt-2 text-slate-600">กรุณาติดต่อทาง LINE: @webuy</p>
      </div>
    );
  }

  const pageUrl = `${siteUrl()}/locations/${location.slug}`;
  const cats = location.devicecategories?.nodes ?? [];
  const primaryCatSlug = cats[0]?.slug;
  const primaryCatName = cats[0]?.title || primaryCatSlug || "หมวดสินค้า";

  const relatedServices = relatedByCategory(index?.services?.nodes ?? [], location, 8);
  const relatedPrices = relatedByCategory(index?.pricemodels?.nodes ?? [], location, 8);
  const otherLocations = (index?.locationpages?.nodes ?? [])
    .filter((l: any) => l?.slug && l.slug !== location.slug && isPublish(l?.status))
    .filter((l: any) => {
      try {
        return nodeCats(l).some((c: string) => nodeCats(location).includes(c));
      } catch {
        return false;
      }
    })
    .slice(0, 8);

  const faqsAll = (index?.faqs?.nodes ?? []) as any[];
  const locationCats = nodeCats(location);
  const relatedFaqs = faqsAll
    .filter(
      (f) =>
        f?.slug &&
        locationCats.some((c) => (f.devicecategories?.nodes ?? []).some((n: any) => n?.slug === c))
    )
    .slice(0, 20);
  const areaName = [location.province, location.district].filter(Boolean).join(" ");
  const seedFaqs = areaName ? locationFaqSeed(areaName, !!location.district) : [];
  const faqItems = [
    ...relatedFaqs.map((f) => ({
      title: String(f?.question || f?.title || "").trim(),
      answer: stripHtml(String(f?.answer || "")),
    })),
    ...seedFaqs.map((f) => ({ title: f.q, answer: f.a })),
  ].filter((x) => x.title && x.answer);
  const faqJson = faqItems.length > 0 ? jsonLdFaqPage(pageUrl, faqItems) : null;

  const breadcrumbJson = jsonLdBreadcrumb(pageUrl, [
    { name: "WEBUY HUB", url: `${siteUrl()}/` },
    { name: "พื้นที่บริการ", url: `${siteUrl()}/locations` },
    { name: location.title || location.province || "พื้นที่บริการ", url: pageUrl },
  ]);

  const lbJson = jsonLdLocalBusiness(
    index?.page ?? {},
    pageUrl,
    { province: location.province || undefined, district: location.district || undefined },
    { enabled: true, ratingValue: 4.9, reviewCount: 128 }
  );

  const contentHtml = toHtml(location.content || "");

  return (
    <div className="space-y-10">
      <JsonLd json={breadcrumbJson} />
      <JsonLd json={lbJson} />
      <JsonLd json={faqJson} />

      <nav className="pt-2 text-sm text-slate-600">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link className="link" href="/">หน้าแรก</Link></li>
          <li className="opacity-60">/</li>
          <li><Link className="link" href="/locations">พื้นที่บริการ</Link></li>
          <li className="opacity-60">/</li>
          <li className="font-semibold text-slate-900">{location.title}</li>
        </ol>
      </nav>

      <section className="card hero card-pad space-y-4">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip">พื้นที่บริการ (จาก WordPress)</span>
              {cats.slice(0, 5).map((c: any) => (
                <Link key={c.slug} href={`/categories/${c.slug}`} className="badge">{c.title || c.slug}</Link>
              ))}
            </div>
            <h1 className="h1">{location.title}</h1>
            {(location.province || location.district) && (
              <p className="lead">พื้นที่บริการ: {[location.province, location.district].filter(Boolean).join(" • ")}</p>
            )}
            <div className="flex flex-wrap gap-3 pt-2">
              <a className="btn btn-primary" href="https://line.me/R/ti/p/@webuy" target="_blank" rel="noreferrer">แชท LINE @webuy</a>
              {primaryCatSlug && (
                <Link className="btn btn-ghost" href={`/categories/${primaryCatSlug}`}>ดูหมวด {primaryCatName} →</Link>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {primaryCatSlug && (
                <Link className="badge" href={`/categories/${primaryCatSlug}`}>หมวด {primaryCatName}</Link>
              )}
              {relatedServices.slice(0, 3).map((s: any) => (
                <Link key={s.slug} className="badge" href={`/services/${s.slug}`}>บริการ: {s.title}</Link>
              ))}
              {otherLocations.slice(0, 3).map((l: any) => (
                <Link key={l.slug} className="badge" href={`/locations/${l.slug}`}>พื้นที่: {l.title}</Link>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:w-[360px]">
            <div className="kpi">
              <div className="label">พื้นที่</div>
              <div className="value">{location.province || location.title}</div>
            </div>
            <div className="kpi">
              <div className="label">บริการที่เกี่ยวข้อง</div>
              <div className="value">{relatedServices.length}</div>
            </div>
          </div>
        </div>
      </section>

      {contentHtml ? (
        <section className="space-y-4">
          <h2 className="h2">รายละเอียดพื้นที่บริการ</h2>
          <article className="card card-pad">
            {contentHtml.includes("<") ? (
              <div className="wp-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
            ) : (
              <div className="wp-content whitespace-pre-line">{contentHtml}</div>
            )}
          </article>
        </section>
      ) : null}

      {faqItems.length > 0 && (
        <section className="space-y-4">
          <h2 className="h2">คำถามที่พบบ่อย</h2>
          <div className="grid gap-4">
            {faqItems.map((f, i) => (
              <details key={i} className="faq">
                <summary>{f.title}</summary>
                <div className="answer">{f.answer}</div>
              </details>
            ))}
          </div>
        </section>
      )}

      {(relatedServices.length > 0 || relatedPrices.length > 0) && (
        <section className="space-y-4">
          <h2 className="h2">บริการและรุ่นราคาที่เกี่ยวข้อง</h2>
          <div className="cards-grid">
            {relatedServices.slice(0, 4).map((s: any) => (
              <Link key={s.slug} className="card p-6 hover:shadow-md transition" href={`/services/${s.slug}`}>
                <div className="text-base font-extrabold">{s.title}</div>
                <div className="muted mt-1 text-sm">/services/{s.slug}</div>
              </Link>
            ))}
            {relatedPrices.slice(0, 4).map((p: any) => (
              <Link key={p.slug} className="card p-6 hover:shadow-md transition" href={`/prices/${p.slug}`}>
                <div className="text-base font-extrabold">{p.title}</div>
                <div className="muted mt-1 text-sm">/prices/{p.slug}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {otherLocations.length > 0 && (
        <section className="space-y-4">
          <h2 className="h2">พื้นที่บริการอื่นที่เกี่ยวข้อง</h2>
          <div className="flex flex-wrap gap-2">
            {otherLocations.map((l: any) => (
              <Link key={l.slug} className="badge" href={`/locations/${l.slug}`}>{l.title}</Link>
            ))}
          </div>
        </section>
      )}

      <section className="card-soft p-6">
        <div className="text-base font-extrabold">ส่งรูป + สเปค เพื่อประเมินไวใน LINE</div>
        <div className="mt-4">
          <a className="btn btn-primary" href="https://line.me/R/ti/p/@webuy" target="_blank" rel="noreferrer">เริ่มประเมินใน LINE @webuy</a>
        </div>
      </section>

      <BackToTop />
    </div>
  );
}
