import JsonLd from "@/components/JsonLd";
import type { JsonLdPayload } from "@/lib/jsonld/types";
import type { LocationPageModel } from "@/lib/build-location-page";

type HubCard = { slug?: string; title?: string };

export function LocationView(m: LocationPageModel) {
  const {
    location,
    contentHtml,
    relatedServices,
    relatedPrices,
    otherLocations,
    faqItems,
    breadcrumbJson,
    lbJson,
    articleJson,
    howToJson,
    serviceJson,
    faqJson,
    primaryCatSlug,
    primaryCatName,
    cats,
  } = m;

  const loc = location as {
    slug?: string;
    title?: string;
    province?: string;
    district?: string;
  };

  return (
    <div className="space-y-10">
      <JsonLd json={breadcrumbJson as JsonLdPayload} />
      <JsonLd json={lbJson as JsonLdPayload} />
      <JsonLd json={articleJson as JsonLdPayload} />
      <JsonLd json={howToJson as JsonLdPayload} />
      <JsonLd json={serviceJson as JsonLdPayload} />
      <JsonLd json={faqJson as JsonLdPayload} />

      <nav className="pt-2 text-sm text-slate-600">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <a className="link" href="/">
              หน้าแรก
            </a>
          </li>
          <li className="opacity-60">/</li>
          <li>
            <a className="link" href="/locations">
              พื้นที่บริการ
            </a>
          </li>
          <li className="opacity-60">/</li>
          <li className="font-semibold text-slate-900">{loc.title}</li>
        </ol>
      </nav>

      <section className="card hero card-pad space-y-4">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip">พื้นที่บริการรับซื้อ</span>
              {cats.slice(0, 5).map((c) => (
                <a key={c.slug} href={`/categories/${c.slug}`} className="badge">
                  {c.name || c.slug}
                </a>
              ))}
            </div>
            <h1 className="h1">{loc.title}</h1>
            {(loc.province || loc.district) && (
              <p className="lead">พื้นที่บริการ: {[loc.province, loc.district].filter(Boolean).join(" • ")}</p>
            )}
            <div className="flex flex-wrap gap-3 pt-2">
              <a className="btn btn-primary" href="https://line.me/R/ti/p/@webuy" target="_blank" rel="noreferrer">
                แชท LINE @webuy
              </a>
              {primaryCatSlug && (
                <a className="btn btn-ghost" href={`/categories/${primaryCatSlug}`}>
                  ดูหมวด {primaryCatName} →
                </a>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {primaryCatSlug && (
                <a className="badge" href={`/categories/${primaryCatSlug}`}>
                  หมวด {primaryCatName}
                </a>
              )}
              {(relatedServices as HubCard[]).slice(0, 3).map((s) => (
                <a key={s.slug} className="badge" href={`/services/${s.slug}`}>
                  บริการ: {s.title}
                </a>
              ))}
              {(otherLocations as HubCard[]).slice(0, 3).map((l) => (
                <a key={l.slug} className="badge" href={`/locations/${l.slug}`}>
                  พื้นที่: {l.title}
                </a>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:w-[360px]">
            <div className="kpi">
              <div className="label">พื้นที่</div>
              <div className="value">{loc.province || loc.title}</div>
            </div>
            <div className="kpi">
              <div className="label">{relatedServices.length > 0 ? "บริการที่เกี่ยวข้อง" : "บริการ"}</div>
              <div className="value">
                {relatedServices.length > 0 ? relatedServices.length : "ครบทุกประเภท"}
              </div>
            </div>
            <div className="kpi">
              <div className="label">ความน่าเชื่อถือ</div>
              <div className="value flex items-center gap-1.5">
                <span aria-hidden>⭐</span> 4.9
                <span className="text-slate-500 text-sm font-normal">(128+ รีวิว)</span>
              </div>
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
            {(relatedServices as HubCard[]).slice(0, 4).map((s) => (
              <a key={s.slug} className="card p-6 hover:shadow-md transition" href={`/services/${s.slug}`}>
                <div className="text-base font-extrabold">{s.title}</div>
                <div className="muted mt-1 text-sm">/services/{s.slug}</div>
              </a>
            ))}
            {(relatedPrices as HubCard[]).slice(0, 4).map((p) => (
              <a key={p.slug} className="card p-6 hover:shadow-md transition" href={`/prices/${p.slug}`}>
                <div className="text-base font-extrabold">{p.title}</div>
                <div className="muted mt-1 text-sm">/prices/{p.slug}</div>
              </a>
            ))}
          </div>
        </section>
      )}

      {otherLocations.length > 0 && (
        <section className="space-y-4">
          <h2 className="h2">พื้นที่บริการอื่นที่เกี่ยวข้อง</h2>
          <div className="flex flex-wrap gap-2">
            {(otherLocations as HubCard[]).map((l) => (
              <a key={l.slug} className="badge" href={`/locations/${l.slug}`}>
                {l.title}
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="card-soft p-6">
        <div className="text-base font-extrabold">ส่งรูป + สเปค เพื่อประเมินไวใน LINE</div>
        <div className="mt-4">
          <a className="btn btn-primary" href="https://line.me/R/ti/p/@webuy" target="_blank" rel="noreferrer">
            เริ่มประเมินใน LINE @webuy
          </a>
        </div>
      </section>
    </div>
  );
}
