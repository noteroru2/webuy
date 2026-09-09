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
    hubFetchFailed,
    services,
    locations,
    prices,
    faqs,
    breadcrumbJson,
    topInternalLinks,
  } = m;

  return (
    <div className="space-y-10">
      <JsonLd json={breadcrumbJson as JsonLdPayload} />

      <nav className="pt-2 text-sm text-slate-600">
        <ol className="flex flex-wrap items-center gap-2">
          <li><a className="link" href="/">หน้าแรก</a></li>
          <li className="opacity-60">/</li>
          <li><a className="link" href="/categories">สินค้าที่รับซื้อ</a></li>
          <li className="opacity-60">/</li>
          <li className="font-semibold text-slate-900">{termName}</li>
        </ol>
      </nav>

      <section className="card hero card-pad space-y-5">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip">สินค้าที่รับซื้อ</span>
            <span className="badge">{termName}</span>
          </div>

          <h1 className="h1">รับซื้อ {termName}</h1>

          {termDescHtml ? (
            termDescHtml.includes("<") ? (
              <div className="lead wp-content" dangerouslySetInnerHTML={{ __html: termDescHtml }} />
            ) : (
              <div className="lead whitespace-pre-line">{termDescHtml}</div>
            )
          ) : (
            <p className="lead">ดูบริการรับซื้อ พื้นที่ให้บริการ รุ่น/ราคา และคำถามที่พบบ่อยสำหรับ {termName}</p>
          )}

          <div className="flex flex-wrap gap-3">
            <a className="btn btn-primary" href={BUSINESS_INFO.lineUrl} target="_blank" rel="noreferrer">ส่งรูปประเมินทาง LINE {BUSINESS_INFO.line}</a>
            <a className="btn btn-ghost" href="/categories">ดูสินค้าประเภทอื่น →</a>
          </div>

          {!!topInternalLinks.length && (
            <div className="flex flex-wrap gap-2">
              {topInternalLinks.slice(0, 8).map((x) => (
                <a key={x.href} className="badge" href={x.href}>{x.label}</a>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="services" className="space-y-4 scroll-mt-24">
        <div>
          <h2 className="h2">บริการรับซื้อที่เกี่ยวข้อง</h2>
          <p className="muted text-sm">เลือกบริการที่ตรงกับรุ่น สภาพ หรือพื้นที่ของสินค้าที่ต้องการขาย</p>
        </div>
        <div className="cards-grid">
          {(services as HubCard[]).map((s) => (
            <a key={s.slug} className="card p-6 transition hover:shadow-md" href={`/services/${s.slug}`}>
              <div className="text-base font-extrabold">{s.title}</div>
              <div className="mt-4 text-sm font-semibold text-brand-700">ดูรายละเอียดบริการ →</div>
            </a>
          ))}
          {!services.length && (
            <EmptyState
              {...hubEmptyCopy(hubFetchFailed, { title: "ยังไม่มีบริการเฉพาะในหมวดนี้", description: "ส่งรูปและข้อมูลสินค้าทาง LINE เพื่อสอบถามได้ทันที" })}
              icon="🔧"
              actionLabel="แชท LINE"
              actionHref={BUSINESS_INFO.lineUrl}
              actionExternal
            />
          )}
        </div>
      </section>

      <section id="locations" className="space-y-4 scroll-mt-24">
        <div>
          <h2 className="h2">พื้นที่ให้บริการ</h2>
          <p className="muted text-sm">ดูจังหวัดและพื้นที่ที่มีข้อมูลบริการรับซื้อสำหรับสินค้าประเภทนี้</p>
        </div>
        <div className="cards-grid">
          {(locations as HubCard[]).map((l) => (
            <a key={l.slug} className="card p-6 transition hover:shadow-md" href={`/locations/${l.slug}`}>
              <div className="text-base font-extrabold">{l.title}</div>
              <div className="mt-4 text-sm font-semibold text-orange-600">ดูรายละเอียดพื้นที่ →</div>
            </a>
          ))}
          {!locations.length && (
            <EmptyState
              {...hubEmptyCopy(hubFetchFailed, { title: "ยังไม่มีพื้นที่เฉพาะในหมวดนี้", description: "สอบถามพื้นที่ของคุณทาง LINE" })}
              icon="📍"
              actionLabel="สอบถามพื้นที่"
              actionHref={BUSINESS_INFO.lineUrl}
              actionExternal
            />
          )}
        </div>
      </section>

      <section id="prices" className="space-y-4 scroll-mt-24">
        <div>
          <h2 className="h2">รุ่นและช่วงราคารับซื้อ</h2>
          <p className="muted text-sm">ใช้เป็นข้อมูลประกอบการตัดสินใจ ราคาจริงขึ้นอยู่กับรุ่น สเปก สภาพ อุปกรณ์ และผลตรวจเครื่อง</p>
        </div>
        <div className="cards-grid">
          {(prices as HubCard[]).map((p) => (
            <a key={p.slug} className="card p-6 transition hover:shadow-md" href={`/prices/${p.slug}`}>
              <div className="text-base font-extrabold">{p.title}</div>
              <div className="muted mt-1 text-sm">
                {priceRangeLabel(p) ? <>ช่วงราคารับซื้อประมาณ <span className="font-semibold text-slate-900">{priceRangeLabel(p)}</span> บาท</> : "ดูรายละเอียดราคาและเงื่อนไขในหน้ารุ่น"}
              </div>
              <div className="mt-4 text-sm font-semibold text-brand-700">ดูรายละเอียดราคา →</div>
            </a>
          ))}
          {!prices.length && (
            <EmptyState
              {...hubEmptyCopy(hubFetchFailed, { title: "ยังไม่มีข้อมูลราคารุ่นในหมวดนี้", description: "ส่งรูป รุ่น/สเปก และสภาพทาง LINE เพื่อประเมิน" })}
              icon="💰"
              actionLabel="ประเมินราคา"
              actionHref={BUSINESS_INFO.lineUrl}
              actionExternal
            />
          )}
        </div>
      </section>

      <section id="faqs" className="space-y-4 scroll-mt-24">
        <div>
          <h2 className="h2">คำถามที่พบบ่อย</h2>
          <p className="muted text-sm">ข้อมูลเบื้องต้นก่อนส่งเครื่องหรืออุปกรณ์มาประเมิน</p>
        </div>
        <div className="grid gap-4">
          {faqs.map((f, i) => (
            <details key={f.slug || f.q || i} className="faq">
              <summary>{f.q || f.question || f.title}</summary>
              <div className="answer">{f.a || f.answer}</div>
            </details>
          ))}
          {!faqs.length && (
            <EmptyState title="ยังไม่มีคำถามเฉพาะในหมวดนี้" description="สอบถามทีมงานได้ทาง LINE" icon="❓" actionLabel="ถามทีมงาน" actionHref={BUSINESS_INFO.lineUrl} actionExternal />
          )}
        </div>
      </section>

      <section className="card-soft p-6">
        <div className="text-base font-extrabold">ต้องการเช็กราคาของ {termName}?</div>
        <div className="muted mt-1 text-sm">ส่งรูป รุ่น/สเปก สภาพ และอุปกรณ์ที่มี เพื่อให้ทีมงานตรวจข้อมูลเบื้องต้น</div>
        <div className="mt-4"><a className="btn btn-primary" href={BUSINESS_INFO.lineUrl} target="_blank" rel="noreferrer">LINE {BUSINESS_INFO.line}</a></div>
      </section>
    </div>
  );
}
