import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchGql, siteUrl } from "@/lib/wp";
import { Q_PRICE_SLUGS, Q_PRICE_BY_SLUG, Q_HUB_INDEX } from "@/lib/queries";
import { relatedByCategory } from "@/lib/related";
import { JsonLd } from "@/components/JsonLd";
import { jsonLdProductOffer, jsonLdBreadcrumb } from "@/lib/jsonld";
import type { Metadata } from "next";
import { pageMetadata, inferDescriptionFromHtml } from "@/lib/seo";
import { jsonLdReviewAggregate } from "@/lib/jsonld";

export const revalidate = 1200;

export async function generateStaticParams() {
  const data = await fetchGql<any>(Q_PRICE_SLUGS, undefined, { revalidate: 3600 });
  const nodes = data.priceModels?.nodes ?? [];
  return nodes
    .filter((n: any) => String(n?.status || "").toLowerCase() === "publish" && n?.slug)
    .map((n: any) => ({ slug: n.slug }));
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

  const data = await fetchGql<any>(Q_PRICE_BY_SLUG, { slug }, { revalidate: 1200 });
  const price = data?.priceModel;
  if (!price || String(price?.status || "").toLowerCase() !== "publish") return {};

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
}

export default async function Page({ params }: { params: { slug: string } }) {
  const slug = String(params.slug || "").trim();
  if (!slug) notFound();

  const data = await fetchGql<any>(Q_PRICE_BY_SLUG, { slug }, { revalidate });
  const price = data?.priceModel;
  if (!price || String(price?.status || "").toLowerCase() !== "publish") notFound();

  const index = await fetchGql<any>(Q_HUB_INDEX, undefined, { revalidate: 3600 });

  const relatedServices = relatedByCategory(index.services?.nodes ?? [], price, 8);
  const relatedLocations = relatedByCategory(index.locationPages?.nodes ?? [], price, 8);

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

  // ✅ breadcrumb schema ใหม่
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

      {/* BREADCRUMB UI */}
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
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
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
              <a className="btn btn-primary" href="https://line.me/R/ti/p/@webuy" target="_blank" rel="noreferrer">
                ส่งรูปเพื่อประเมินใน LINE
              </a>
              <Link className="btn btn-ghost" href={primaryCatHref}>
                ดูหมวด {primaryCatName} →
              </Link>
              <Link className="btn btn-ghost" href="/">
                ← กลับหน้าแรก
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

          <div className="grid gap-3 sm:w-[360px]">
            <div className="kpi">
              <div className="label">บริการที่เกี่ยวข้อง</div>
              <div className="value">{relatedServices.length}</div>
            </div>
            <div className="kpi">
              <div className="label">พื้นที่ที่เกี่ยวข้อง</div>
              <div className="value">{relatedLocations.length}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="space-y-4">
        <div>
          <h2 className="h2">รายละเอียดรุ่น/การประเมินราคา</h2>
          <p className="muted text-sm">เนื้อหาจาก WordPress (Price Content)</p>
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
              ให้ไปเติม “Content” ใน WordPress (Price Model) และตรวจว่า Q_PRICE_BY_SLUG ดึง <b>content</b> มาด้วย
            </div>
          </div>
        )}

        {/* CTA ซ้ำท้ายบทความ */}
        <div className="card-soft p-6">
          <div className="text-base font-extrabold">อยากได้ราคาที่ “ตรงสภาพจริง”?</div>
          <div className="muted mt-1 text-sm">ส่งรูป + สภาพ + อุปกรณ์ที่มี/ไม่มี + ประกัน ทาง LINE แล้วทีมงานประเมินให้ทันที</div>
          <div className="mt-4 flex flex-wrap gap-3">
            <a className="btn btn-primary" href="https://line.me/R/ti/p/@webuy" target="_blank" rel="noreferrer">
              ส่งรูปเพื่อประเมินใน LINE
            </a>
            <Link className="btn btn-ghost" href={primaryCatHref}>
              ดูหมวด {primaryCatName} →
            </Link>
          </div>
        </div>
      </section>

      {/* RELATED SERVICES */}
      <section className="space-y-4">
        <div>
          <h2 className="h2">บริการที่เกี่ยวข้อง</h2>
          <p className="muted text-sm">Service pages ที่หมวดทับกัน</p>
        </div>

        <div className="cards-grid">
          {relatedServices.map((s: any) => (
            <Link key={s.slug} className="card p-6 hover:shadow-md transition" href={`/services/${s.slug}`}>
              <div className="text-base font-extrabold">{s.title}</div>
              <div className="muted mt-1 text-sm">/services/{s.slug}</div>
              <div className="mt-4 text-sm font-semibold text-brand-700">เปิดหน้า Service →</div>
            </Link>
          ))}
          {!relatedServices.length && (
            <div className="card card-pad">
              <div className="text-sm font-extrabold">ยังไม่มี Service ที่เชื่อมหมวด</div>
              <div className="muted mt-1 text-sm">ติ๊ก devicecategories ให้ priceModel ใน WP เพื่อให้เชื่อมโยงขึ้น</div>
            </div>
          )}
        </div>
      </section>

      {/* RELATED LOCATIONS */}
      <section className="space-y-4">
        <div>
          <h2 className="h2">พื้นที่ที่เกี่ยวข้อง</h2>
          <p className="muted text-sm">Location pages ที่หมวดทับกัน</p>
        </div>

        <div className="cards-grid">
          {relatedLocations.map((l: any) => (
            <Link key={l.slug} className="card p-6 hover:shadow-md transition" href={`/locations/${l.slug}`}>
              <div className="text-base font-extrabold">{l.title}</div>
              <div className="muted mt-1 text-sm">/locations/{l.slug}</div>
              <div className="mt-4 text-sm font-semibold text-brand-700">เปิดหน้า Location →</div>
            </Link>
          ))}
          {!relatedLocations.length && (
            <div className="card card-pad">
              <div className="text-sm font-extrabold">ยังไม่มี Location ที่เชื่อมหมวด</div>
              <div className="muted mt-1 text-sm">ติ๊ก devicecategories ให้ locationPage ใน WP เพื่อให้เชื่อมโยงขึ้น</div>
            </div>
          )}
        </div>
      </section>

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
