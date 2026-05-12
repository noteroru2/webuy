import JsonLd from "@/components/JsonLd";
import type { JsonLdPayload } from "@/lib/jsonld/types";
import type { PricePageModel } from "@/lib/build-price-page";

type HubCard = { slug?: string; title?: string; province?: string };

export function PriceView(m: PricePageModel) {
  const {
    price,
    contentHtml,
    relatedServices,
    relatedLocations,
    breadcrumbJson,
    productJson,
    reviewJson,
    cats,
    primaryCatSlug,
    primaryCatName,
    primaryCatHref,
    topInternalLinks,
    rangeText,
  } = m;

  return (
    <div className="space-y-10">
      <JsonLd json={breadcrumbJson as JsonLdPayload} />
      <JsonLd json={productJson as JsonLdPayload} />
      <JsonLd json={reviewJson as JsonLdPayload} />

      <nav className="pt-2 text-sm text-slate-600">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <a className="link" href="/">
              หน้าแรก
            </a>
          </li>
          <li className="opacity-60">/</li>
          <li>
            <a className="link" href="/categories">
              หมวดสินค้า
            </a>
          </li>
          {primaryCatSlug && (
            <>
              <li className="opacity-60">/</li>
              <li>
                <a className="link" href={primaryCatHref}>
                  {primaryCatName}
                </a>
              </li>
            </>
          )}
          <li className="opacity-60">/</li>
          <li className="font-semibold text-slate-900">{String(price.title)}</li>
        </ol>
      </nav>

      <section className="card hero card-pad space-y-5">
        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip">รุ่น/ช่วงราคารับซื้อ</span>
              {price.brand ? <span className="badge">{String(price.brand)}</span> : null}
              {cats.slice(0, 6).map((c) => (
                <a key={c.slug} href={`/categories/${c.slug}`} className="badge">
                  {c.name || c.slug}
                </a>
              ))}
            </div>

            <h1 className="h1">{String(price.title)}</h1>

            <p className="lead">
              ช่วงราคารับซื้อโดยประมาณ:{" "}
              <span className="font-extrabold text-slate-900">{rangeText || "ตามสภาพสินค้า"}</span>
              {rangeText ? " บาท" : ""} (ขึ้นอยู่กับสภาพ/อุปกรณ์/ประกัน)
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
              <a className="btn btn-ghost" href={primaryCatHref}>
                ดูหมวด {primaryCatName} →
              </a>
            </div>

            {!!topInternalLinks.length && (
              <div className="mt-3 flex flex-wrap gap-2">
                {topInternalLinks.map((x) => (
                  <a key={x.href} className="badge" href={x.href}>
                    {x.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

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
            <div className="text-xl font-extrabold text-slate-900">อยากได้ราคาที่ &quot;ตรงสภาพจริง&quot;?</div>
            <div className="muted mt-2 text-base">
              ส่งรูป + สภาพ + อุปกรณ์ที่มี/ไม่มี + ประกัน ทาง LINE แล้วทีมงานจะประเมินให้ทันที
            </div>
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
              <a className="btn btn-ghost px-6 py-4" href={primaryCatHref}>
                ดูหมวด {primaryCatName} →
              </a>
            </div>
          </div>
        </section>
      )}

      {relatedServices.length > 0 && (
        <section className="space-y-4">
          <h2 className="h2">บริการที่เกี่ยวข้อง</h2>
          <div className="cards-grid">
            {(relatedServices as HubCard[]).map((s) => (
              <a key={s.slug} className="card p-6 hover:shadow-md transition" href={`/services/${s.slug}`}>
                <div className="text-base font-extrabold">{s.title}</div>
                <div className="mt-4 text-sm font-semibold text-brand-700">ดูบริการ →</div>
              </a>
            ))}
          </div>
        </section>
      )}

      {relatedLocations.length > 0 && (
        <section className="space-y-4">
          <h2 className="h2">พื้นที่ที่เกี่ยวข้อง</h2>
          <div className="cards-grid">
            {(relatedLocations as HubCard[]).map((l) => (
              <a key={l.slug} className="card p-6 hover:shadow-md transition" href={`/locations/${l.slug}`}>
                <div className="text-base font-extrabold">{l.title}</div>
                {l.province && <div className="muted mt-1 text-sm">📍 {l.province}</div>}
                <div className="mt-4 text-sm font-semibold text-brand-700">ดูรายละเอียด →</div>
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="card-soft p-6">
        <div className="text-sm font-extrabold">ลิงก์ที่เกี่ยวข้อง</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {cats.slice(0, 10).map((c) => (
            <a key={c.slug} className="badge" href={`/categories/${c.slug}`}>
              หมวด: {c.name || c.slug}
            </a>
          ))}
          {(relatedServices as HubCard[]).slice(0, 4).map((s) => (
            <a key={s.slug} className="badge" href={`/services/${s.slug}`}>
              บริการ: {s.title}
            </a>
          ))}
          {(relatedLocations as HubCard[]).slice(0, 4).map((l) => (
            <a key={l.slug} className="badge" href={`/locations/${l.slug}`}>
              พื้นที่: {l.title}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
