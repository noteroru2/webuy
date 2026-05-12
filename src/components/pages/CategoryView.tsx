import { BUSINESS_INFO } from "@/lib/constants";
import { hubEmptyCopy } from "@/lib/hub-empty-copy";
import { EmptyState } from "@/components/EmptyState";
import { priceRangeLabel } from "@/lib/price-display";
import JsonLd from "@/components/JsonLd";
import type { JsonLdPayload } from "@/lib/jsonld/types";
import type { CategoryPageModel } from "@/lib/build-category-page";

type HubCard = { slug?: string; title?: string };

export function CategoryView(m: CategoryPageModel) {
  const {
    termName,
    termDescHtml,
    termDescPlain,
    hubFetchFailed,
    services,
    locations,
    prices,
    faqs,
    breadcrumbJson,
    faqJson,
    topInternalLinks,
    catSlug,
  } = m;

  return (
    <div className="space-y-10">
      <JsonLd json={breadcrumbJson as JsonLdPayload} />
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
            <a className="link" href="/categories">
              หมวดสินค้า
            </a>
          </li>
          <li className="opacity-60">/</li>
          <li className="font-semibold text-slate-900">{termName}</li>
        </ol>
      </nav>

      <section className="card hero card-pad space-y-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip">หมวดสินค้า</span>
              <span className="badge">{termName}</span>
              <span className="badge">/{catSlug}</span>
            </div>

            <h1 className="h1">รวมเนื้อหาในหมวด: {termName}</h1>

            {termDescHtml ? (
              <div className="lead">
                {termDescHtml.includes("<") ? (
                  <div className="wp-content" dangerouslySetInnerHTML={{ __html: termDescHtml }} />
                ) : (
                  <div className="whitespace-pre-line">{termDescHtml}</div>
                )}
              </div>
            ) : (
              <p className="lead">Service / Location / Price / FAQ ที่เกี่ยวข้องในหมวดเดียวกัน</p>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <a className="btn btn-primary text-lg px-6 py-3" href={BUSINESS_INFO.lineUrl} target="_blank" rel="noreferrer">
                💬 LINE: {BUSINESS_INFO.line}
              </a>
              <a className="btn btn-ghost" href="/">
                ← กลับหน้าแรก
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

            <div className="mt-3 flex flex-wrap gap-2">
              <a className="badge" href="#services">
                Services
              </a>
              <a className="badge" href="#locations">
                Locations
              </a>
              <a className="badge" href="#prices">
                Price Models
              </a>
              <a className="badge" href="#faqs">
                FAQs
              </a>
            </div>
          </div>

          <div className="grid gap-3 sm:w-[360px]">
            <div className="kpi">
              <div className="label">จำนวนบริการ</div>
              <div className="value">{services.length}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="kpi">
                <div className="label">พื้นที่</div>
                <div className="value">{locations.length}</div>
              </div>
              <div className="kpi">
                <div className="label">รุ่นราคา</div>
                <div className="value">{prices.length}</div>
              </div>
            </div>
            <div className="kpi">
              <div className="label">คำถามที่พบบ่อย</div>
              <div className="value">{faqs.length}</div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="space-y-4 scroll-mt-24">
        <div>
          <h2 className="h2">🔧 บริการ</h2>
          <p className="muted text-sm">หน้าบริการที่อยู่ในหมวดนี้</p>
        </div>
        <div className="cards-grid">
          {(services as HubCard[]).map((s) => (
            <a
              key={s.slug}
              className="card-service group p-6 transition hover:-translate-y-0.5 hover:shadow-md"
              href={`/services/${s.slug}`}
            >
              <div className="text-base font-extrabold">{s.title}</div>
              <div className="muted mt-1 text-sm">/services/{s.slug}</div>
              <div className="mt-4 text-sm font-semibold text-blue-600">
                ดูรายละเอียด <span className="inline-block transition group-hover:translate-x-0.5">→</span>
              </div>
            </a>
          ))}
          {!services.length && (
            <EmptyState
              {...hubEmptyCopy(hubFetchFailed, {
                title: "ยังไม่มีบริการในหมวดนี้",
                description: "ติดต่อทาง LINE เพื่อสอบถามบริการหรือรอเพิ่มข้อมูลในหมวดนี้",
              })}
              icon="🔧"
              actionLabel="แชท LINE"
              actionHref="https://line.me/R/ti/p/@webuy"
              actionExternal
            />
          )}
        </div>
      </section>

      <section id="locations" className="space-y-4 scroll-mt-24">
        <div>
          <h2 className="h2">📍 พื้นที่บริการ</h2>
          <p className="muted text-sm">พื้นที่/จังหวัดที่ให้บริการในหมวดนี้</p>
        </div>
        <div className="cards-grid">
          {(locations as HubCard[]).map((l) => (
            <a
              key={l.slug}
              className="card-location group p-6 transition hover:-translate-y-0.5 hover:shadow-md"
              href={`/locations/${l.slug}`}
            >
              <div className="text-base font-extrabold">{l.title}</div>
              <div className="muted mt-1 text-sm">/locations/{l.slug}</div>
              <div className="mt-4 text-sm font-semibold text-orange-600">
                ดูรายละเอียด <span className="inline-block transition group-hover:translate-x-0.5">→</span>
              </div>
            </a>
          ))}
          {!locations.length && (
            <EmptyState
              {...hubEmptyCopy(hubFetchFailed, {
                title: "ยังไม่มีพื้นที่ในหมวดนี้",
                description: "สอบถามพื้นที่ของคุณทาง LINE",
              })}
              icon="📍"
              actionLabel="สอบถามพื้นที่"
              actionHref="https://line.me/R/ti/p/@webuy"
              actionExternal
            />
          )}
        </div>
      </section>

      <section id="prices" className="space-y-4 scroll-mt-24">
        <div>
          <h2 className="h2">Price Models</h2>
          <p className="muted text-sm">รุ่น/ช่วงราคารับซื้อโดยประมาณในหมวดนี้</p>
        </div>
        <div className="cards-grid">
          {(prices as HubCard[]).map((p) => (
            <a key={p.slug} className="card group p-6 transition hover:-translate-y-0.5 hover:shadow-md" href={`/prices/${p.slug}`}>
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
              <div className="mt-4 text-sm font-semibold text-brand-700">
                เปิดหน้า Price <span className="inline-block transition group-hover:translate-x-0.5">→</span>
              </div>
            </a>
          ))}
          {!prices.length && (
            <EmptyState
              {...hubEmptyCopy(hubFetchFailed, {
                title: "ยังไม่มีรุ่นราคาในหมวดนี้",
                description: "ส่งรูป + สเปคทาง LINE เพื่อประเมินราคา",
              })}
              icon="💰"
              actionLabel="ประเมินราคา"
              actionHref="https://line.me/R/ti/p/@webuy"
              actionExternal
            />
          )}
        </div>
      </section>

      <section id="faqs" className="space-y-4 scroll-mt-24">
        <div>
          <h2 className="h2">❓ คำถามที่พบบ่อย</h2>
          <p className="muted text-sm">คำถามที่พบบ่อยในหมวดนี้</p>
        </div>
        <div className="grid gap-4">
          {faqs.map((f, i) => (
            <details key={f.slug || f.q || i} className="faq">
              <summary>{f.q || f.question || f.title}</summary>
              <div className="answer">{f.a}</div>
            </details>
          ))}
          {!faqs.length && (
            <EmptyState
              title="ยังไม่มีคำถามในหมวดนี้"
              description="หากมีคำถาม สอบถามได้ทาง LINE"
              icon="❓"
              actionLabel="ถามคำถาม"
              actionHref="https://line.me/R/ti/p/@webuy"
              actionExternal
            />
          )}
        </div>
      </section>

      <section className="card-soft p-6">
        <div className="text-base font-extrabold">ต้องการประเมินราคาในหมวด {termName} แบบไว ๆ ?</div>
        <div className="muted mt-1 text-sm">
          ส่งรูป + รุ่น/สเปค + สภาพ ทาง LINE แล้วทีมงานจะประเมินให้ทันที (ราคาขึ้นอยู่กับสภาพจริง)
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <a className="btn btn-primary text-lg px-6 py-3" href={BUSINESS_INFO.lineUrl} target="_blank" rel="noreferrer">
            💬 LINE: {BUSINESS_INFO.line}
          </a>
          {!!(services[0] as HubCard | undefined)?.slug && (
            <a className="btn btn-ghost" href={`/services/${(services[0] as HubCard).slug}`}>
              ดูบริการยอดนิยมในหมวดนี้ →
            </a>
          )}
          {!!(prices[0] as HubCard | undefined)?.slug && (
            <a className="btn btn-ghost" href={`/prices/${(prices[0] as HubCard).slug}`}>
              ดูรุ่น/ช่วงราคาแนะนำ →
            </a>
          )}
        </div>
      </section>

      <section className="card-soft p-6">
        <div className="text-sm font-extrabold">ลิงก์ที่เกี่ยวข้อง</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {topInternalLinks.map((item, i) => (
            <a key={item.href + i} className="badge" href={item.href}>
              {item.label}
            </a>
          ))}
          {!!termDescPlain && <span className="badge">คำอธิบายหมวด: มี</span>}
        </div>
      </section>
    </div>
  );
}
