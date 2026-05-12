import { priceRangeLabel } from "@/lib/price-display";
import JsonLd from "@/components/JsonLd";
import type { ServicePageModel } from "@/lib/build-service-page";

export function ServiceView(m: ServicePageModel) {
  const {
    service,
    contentHtml,
    faqItems,
    relatedLocations,
    relatedPrices,
    breadcrumbJson,
    faqJson,
    reviewJson,
    primaryCatSlug,
    primaryCatName,
    catDesc,
    cats,
  } = m;

  return (
    <div className="space-y-10">
      <JsonLd json={breadcrumbJson} />
      {faqJson != null && <JsonLd json={faqJson} />}
      <JsonLd json={reviewJson} />

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
                <a className="link" href={`/categories/${primaryCatSlug}`}>
                  {primaryCatName}
                </a>
              </li>
            </>
          )}
          <li className="opacity-60">/</li>
          <li className="font-semibold text-slate-900">{String(service.title)}</li>
        </ol>
      </nav>

      <section className="card hero card-pad space-y-6">
        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip">บริการ</span>
              {cats.slice(0, 6).map((c) => (
                <a key={c.slug} href={`/categories/${c.slug}`} className="badge">
                  {c.name || c.slug}
                </a>
              ))}
            </div>

            <h1 className="h1">{String(service.title)}</h1>

            {catDesc ? <p className="lead">{catDesc}</p> : (
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
                ติดต่อเรา Line : @webuy
              </a>
            </div>

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

            <div className="mt-4 flex flex-wrap gap-2">
              {primaryCatSlug && (
                <a className="badge" href={`/categories/${primaryCatSlug}`}>
                  รวมเนื้อหาในหมวด {primaryCatName}
                </a>
              )}
              {relatedLocations.slice(0, 4).map((l: { slug?: string; title?: string }) => (
                <a key={l.slug} className="badge" href={`/locations/${l.slug}`}>
                  พื้นที่: {l.title}
                </a>
              ))}
              {relatedPrices.slice(0, 4).map((p: { slug?: string; title?: string }) => (
                <a key={p.slug} className="badge" href={`/prices/${p.slug}`}>
                  รุ่น/ราคา: {p.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

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
                ติดต่อเรา Line : @webuy
              </a>
            </div>
          </div>
        </section>
      )}

      {!contentHtml && faqItems.length > 0 && (
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

      {relatedLocations.length > 0 && (
        <section className="space-y-4">
          <h2 className="h2">พื้นที่ที่เกี่ยวข้อง</h2>
          <div className="cards-grid">
            {relatedLocations.map((l: { slug?: string; title?: string; province?: string }) => (
              <a key={l.slug} className="card p-6 transition hover:shadow-md" href={`/locations/${l.slug}`}>
                <div className="text-base font-extrabold">{l.title}</div>
                {l.province && <div className="muted mt-1 text-sm">📍 {l.province}</div>}
                <div className="mt-4 text-sm font-semibold text-brand-700">ดูรายละเอียด →</div>
              </a>
            ))}
          </div>
        </section>
      )}

      {relatedPrices.length > 0 && (
        <section className="space-y-4">
          <h2 className="h2">รุ่น/ราคาที่เกี่ยวข้อง</h2>
          <div className="cards-grid">
            {relatedPrices.map((p: { slug?: string; title?: string }) => (
              <a key={p.slug} className="card p-6 transition hover:shadow-md" href={`/prices/${p.slug}`}>
                <div className="text-base font-extrabold">{p.title}</div>
                <div className="muted mt-1 text-sm">
                  {priceRangeLabel(p) ? (
                    <>
                      ช่วงราคารับซื้อ: <span className="font-semibold text-slate-900">{priceRangeLabel(p)}</span> บาท
                    </>
                  ) : (
                    <span className="text-slate-500">ดูรายละเอียดราคาในหน้ารุ่น</span>
                  )}
                </div>
                <div className="mt-4 text-sm font-semibold text-brand-700">ดูราคา →</div>
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
        </div>
      </section>
    </div>
  );
}
