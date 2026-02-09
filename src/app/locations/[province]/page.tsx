import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchGql, siteUrl, nodeCats } from "@/lib/wp";
import { Q_HUB_INDEX, Q_LOCATION_SLUGS, Q_LOCATION_BY_SLUG } from "@/lib/queries";
import JsonLd from "@/components/JsonLd";
import { jsonLdBreadcrumb, jsonLdLocalBusiness, jsonLdFaqPage } from "@/lib/jsonld";
import { pageMetadata, inferDescriptionFromHtml } from "@/lib/seo";
import { locationFaqSeed } from "@/lib/seoLocation";
import { relatedByCategory } from "@/lib/related";
import { stripHtml } from "@/lib/shared";
import { BackToTop } from "@/components/BackToTop";

export const revalidate = 3600;
export const dynamicParams = true; // Allow dynamic routes for new location pages

function isPublish(status: any) {
  return String(status || "").toLowerCase() === "publish";
}

/** Generate static params from WordPress locationPages only */
export async function generateStaticParams() {
  try {
    const data = await fetchGql<any>(Q_LOCATION_SLUGS, undefined, { revalidate: 3600 });
    const nodes = data?.locationPages?.nodes ?? [];
    return nodes
      .filter((n: any) => n?.slug && isPublish(n?.status))
      .map((n: any) => ({ province: String(n.slug).trim() }));
  } catch (error) {
    console.error('Error fetching location slugs:', error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { province: string };
}): Promise<Metadata> {
  const slug = String(params?.province ?? "").trim();
  
  try {
    const data = await fetchGql<any>(Q_LOCATION_BY_SLUG, { slug }, { revalidate: 3600 });
    const loc = data?.locationPage;
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
    const data = await fetchGql<any>(Q_LOCATION_BY_SLUG, { slug }, { revalidate });
    location = data?.locationPage;
    if (!location || !isPublish(location?.status)) notFound();
  } catch (error) {
    console.error('Error fetching location:', slug, error);
    notFound();
  }

  try {
    index = await fetchGql<any>(Q_HUB_INDEX, undefined, { revalidate });
  } catch (error) {
    console.error('Error fetching hub index:', error);
    index = { services: { nodes: [] }, locationPages: { nodes: [] }, priceModels: { nodes: [] }, faqs: { nodes: [] } };
  }

  return <LocationPage location={location} index={index} />;
}

function LocationPage({ location, index }: { location: any; index: any }) {
  const pageUrl = `${siteUrl()}/locations/${location.slug}`;
  const cats = location.devicecategories?.nodes ?? [];
  const primaryCatSlug = cats[0]?.slug;
  const primaryCatName = cats[0]?.name || primaryCatSlug || "หมวดสินค้า";

  const relatedServices = relatedByCategory(index.services?.nodes ?? [], location, 8);
  const relatedPrices = relatedByCategory(index.priceModels?.nodes ?? [], location, 8);
  const otherLocations = (index.locationPages?.nodes ?? [])
    .filter((l: any) => l?.slug && l.slug !== location.slug && isPublish(l?.status))
    .filter((l: any) => nodeCats(l).some((c: string) => nodeCats(location).includes(c)))
    .slice(0, 8);

  const faqsAll = (index.faqs?.nodes ?? []) as any[];
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
      title: String(f.question || f.title || "").trim(),
      answer: stripHtml(String(f.answer || "")),
    })),
    ...seedFaqs.map((f) => ({ title: f.q, answer: f.a })),
  ].filter((x) => x.title && x.answer);
  const faqJson = jsonLdFaqPage(pageUrl, faqItems);

  const breadcrumbJson = jsonLdBreadcrumb(pageUrl, [
    { name: "WEBUY HUB", url: `${siteUrl()}/` },
    { name: "พื้นที่บริการ", url: `${siteUrl()}/locations` },
    { name: location.title || "พื้นที่บริการ", url: pageUrl },
  ]);

  const lbJson = jsonLdLocalBusiness(
    index.page ?? {},
    pageUrl,
    { province: location.province, district: location.district },
    { enabled: true, ratingValue: 4.9, reviewCount: 128 }
  );

  const contentHtml = toHtml(location.content);

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
                <Link key={c.slug} href={`/categories/${c.slug}`} className="badge">{c.name || c.slug}</Link>
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
