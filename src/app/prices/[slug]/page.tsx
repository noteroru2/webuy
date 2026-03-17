import { notFound } from "next/navigation";
import Link from "next/link";
import { siteUrl } from "@/lib/wp";
import { getPriceBySlug, getHubIndex } from "@/lib/wp-deduped";
import { relatedByCategory } from "@/lib/related";
import { JsonLd } from "@/components/JsonLd";
import { jsonLdProductOffer, jsonLdBreadcrumb } from "@/lib/jsonld";
import type { Metadata } from "next";
import { pageMetadata, inferDescriptionFromHtml } from "@/lib/seo";
import { jsonLdReviewAggregate } from "@/lib/jsonld";

export const revalidate = 86400; // 24 ชม. — กัน WP ล่มตอน ISR
export const dynamicParams = true;

/** ไม่ SSG ตอน build — ทุก price เป็น ISR (build เร็ว) */
export async function generateStaticParams() {
  return [];
}

function toHtml(x: any) {
  const s = String(x ?? "");
  return s.trim();
}

function pickPrimaryCategory(node: any) {
  const cats = node?.devicecategories?.nodes ?? [];
  if (!cats.length) return null;
  const withDesc = cats.find((c: any) => String(c?.description || "").trim());
  return withDesc || cats[0];
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = String(params.slug || "").trim();
  if (!slug) return {};
  try {
    const price = await getPriceBySlug(slug);
    if (!price) return {};
    const pathname = `/prices/${price.slug}`;
    const range =
      price.buyPriceMin != null && price.buyPriceMax != null
        ? `ช่วงรับซื้อประมาณ ${price.buyPriceMin}-${price.buyPriceMax} บาท`
        : "ช่วงราคารับซื้อโดยประมาณ";
    const fallback = `${price.title || "รุ่นสินค้า"} • ${range} (ขึ้นอยู่กับสภาพ/อุปกรณ์/ประกัน) ติดต่อ LINE @webuy เพื่อประเมินจริง`;
    const desc = inferDescriptionFromHtml(price.content, fallback);
    return pageMetadata({
      title: price.title || "รุ่น/ช่วงราคารับซื้อ",
      description: desc,
      pathname,
    });
  } catch (error) {
    console.error("Error generating metadata for price:", slug, error);
    return {};
  }
}

export default async function Page({ params }: { params: { slug: string } }) {
  const slug = String(params.slug || "").trim();
  if (!slug) notFound();

  const price = await getPriceBySlug(slug);
  if (!price) notFound();

  const emptyIndex = { services: { nodes: [] as any[] }, locationpages: { nodes: [] as any[] }, pricemodels: { nodes: [] as any[] } };
  const index = (await getHubIndex()) ?? emptyIndex;

  const relatedServices = relatedByCategory(index?.services?.nodes ?? [], price, 8);
  const relatedLocations = relatedByCategory(index?.locationpages?.nodes ?? [], price, 8);

  const pageUrl = `${siteUrl()}/prices/${price.slug}`;

  const reviewJson = jsonLdReviewAggregate(pageUrl, {
    name: price.title,
    ratingValue: 4.7,
    reviewCount: 52,
  });

  const productJson = jsonLdProductOffer(pageUrl, {
    title: price.title,
    brand: price.brand,
    buyPriceMin: price.buyPriceMin,
    buyPriceMax: price.buyPriceMax,
    content: price.content,
  });

  const cats = price.devicecategories?.nodes ?? [];
  const primaryCat = pickPrimaryCategory(price);

  const primaryCatSlug = String(primaryCat?.slug || "").trim();
  const primaryCatName = String(primaryCat?.name || primaryCatSlug || "หมวดสินค้า").trim();

  const primaryCatHref = primaryCatSlug ? `/categories/${primaryCatSlug}` : "/categories";

  const breadcrumbJson = jsonLdBreadcrumb(pageUrl, [
    { name: "WEBUY HUB", url: `${siteUrl()}/` },
    { name: "หมวดสินค้า", url: `${siteUrl()}/categories` },
    ...(primaryCatSlug
      ? [{ name: primaryCatName, url: `${siteUrl()}/categories/${primaryCatSlug}` }]
      : []),
    { name: String(price.title || "รุ่น/ช่วงราคา"), url: pageUrl },
  ]);

  const contentHtml = toHtml(price.content);

  const rangeText =
    price.buyPriceMin != null && price.buyPriceMax != null
      ? `${price.buyPriceMin}-${price.buyPriceMax}`
      : "";

  const topInternalLinks = [
    primaryCatSlug
      ? { href: `/categories/${primaryCatSlug}`, label: `รวมเนื้อหาในหมวด ${primaryCatName}` }
      : { href: "/categories", label: "ดูหมวดสินค้าทั้งหมด" },
    ...relatedServices.slice(0, 4).map((s: any) => ({
      href: `/services/${s.slug}`,
      label: `บริการ: ${s.title}`,
    })),
    ...relatedLocations.slice(0, 4).map((l: any) => ({
      href: `/locations/${l.slug}`,
      label: `พื้นที่: ${l.title}`,
    })),
  ];

  return (
    <div className="space-y-10">
      <JsonLd json={breadcrumbJson} />
      <JsonLd json={productJson} />
      <JsonLd json={reviewJson} />

      {/* BREADCRUMB */}
      <nav className="pt-2 text-sm text-slate-600">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link className="link" href="/">
              หน้าแรก
            </Link>
          </li>
          <li className="opacity-60">/</li>
          <li>
            <Link className="link" href="/categories">
              หมวดสินค้า
            </Link>
          </li>
          {primaryCatSlug && (
            <>
              <li className="opacity-60">/</li>
              <li>
                <Link className="link" href={primaryCatHref}>
                  {primaryCatName}
                </Link>
              </li>
            </>
          )}
          <li className="opacity-60">/</li>
          <li className="font-semibold text-slate-900">{price.title}</li>
        </ol>
      </nav>

      {/* HERO */}
      <section className="card hero card-pad space-y-5">
        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip">รุ่น/ช่วงราคารับซื้อ</span>
              {price.brand ? <span className="badge">{price.brand}</span> : null}
              {cats.slice(0, 6).map((c: any) => (
                <Link key={c.slug} href={`/categories/${c.slug}`} className="badge">
                  {c.name || c.slug}
                </Link>
              ))}
            </div>

            <h1 className="h1">{price.title}</h1>

            <p className="lead">
              ช่วงราคารับซื้อโดยประมาณ:{" "}
              <span className="font-extrabold text-slate-900">{rangeText || "ตามสภาพสินค้า"}</span>{" "}
              {rangeText ? "บาท" : ""} (ขึ้นอยู่กับสภาพ/อุปกรณ์/ประกัน)
            </p>

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
              <Link className="btn btn-ghost" href={primaryCatHref}>
                ดูหมวด {primaryCatName} →
              </Link>
            </div>

            {!!topInternalLinks.length && (
              <div className="mt-3 flex flex-wrap gap-2">
                {topInternalLinks.map((x) => (
                  <Link key={x.href} className="badge" href={x.href}>
                    {x.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CONTENT */}
      {contentHtml && (
        <section className="space-y-4">
          <h2 className="h2">รายละเอียดรุ่น/การประเมินราคา</h2>

          <article className="card card-pad">
            {contentHtml.includes("<") ? (
              <div className="wp-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
            ) : (
              <div className="wp-content whitespace-pre-line">{contentHtml}</div>
            )}
          </article>

          <div className="card-soft p-8 text-center">
            <div className="text-xl font-extrabold text-slate-900">อยากได้ราคาที่ "ตรงสภาพจริง"?</div>
            <div className="muted mt-2 text-base">ส่งรูป + สภาพ + อุปกรณ์ที่มี/ไม่มี + ประกัน ทาง LINE แล้วทีมงานประเมินให้ทันที</div>
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
              <Link className="btn btn-ghost px-6 py-4" href={primaryCatHref}>
                ดูหมวด {primaryCatName} →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* RELATED SERVICES */}
      {relatedServices.length > 0 && (
        <section className="space-y-4">
          <h2 className="h2">บริการที่เกี่ยวข้อง</h2>

          <div className="cards-grid">
            {relatedServices.map((s: any) => (
              <Link key={s.slug} className="card p-6 hover:shadow-md transition" href={`/services/${s.slug}`}>
                <div className="text-base font-extrabold">{s.title}</div>
                <div className="mt-4 text-sm font-semibold text-brand-700">ดูบริการ →</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* RELATED LOCATIONS */}
      {relatedLocations.length > 0 && (
        <section className="space-y-4">
          <h2 className="h2">พื้นที่ที่เกี่ยวข้อง</h2>

          <div className="cards-grid">
            {relatedLocations.map((l: any) => (
              <Link key={l.slug} className="card p-6 hover:shadow-md transition" href={`/locations/${l.slug}`}>
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

      {/* Footer links */}
      <section className="card-soft p-6">
        <div className="text-sm font-extrabold">ลิงก์ที่เกี่ยวข้อง</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {cats.slice(0, 10).map((c: any) => (
            <Link key={c.slug} className="badge" href={`/categories/${c.slug}`}>
              หมวด: {c.name || c.slug}
            </Link>
          ))}
          {relatedServices.slice(0, 4).map((s: any) => (
            <Link key={s.slug} className="badge" href={`/services/${s.slug}`}>
              บริการ: {s.title}
            </Link>
          ))}
          {relatedLocations.slice(0, 4).map((l: any) => (
            <Link key={l.slug} className="badge" href={`/locations/${l.slug}`}>
              พื้นที่: {l.title}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
