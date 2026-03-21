import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteUrl } from "@/lib/wp";
import { getCategoryBySlug, getHubIndex } from "@/lib/wp-deduped";
import { filterByCategory } from "@/lib/related";
import { stripHtml } from "@/lib/shared";
import { pageMetadata, inferDescriptionFromHtml } from "@/lib/seo";
import { jsonLdBreadcrumb, jsonLdFaqPage } from "@/lib/jsonld";
import { JsonLd } from "@/components/JsonLd";
import { categoryFaqSeed } from "@/lib/seoCategory";
import { BackToTop } from "@/components/BackToTop";
import { EmptyState } from "@/components/EmptyState";
import { BUSINESS_INFO } from "@/lib/constants";
import { hubEmptyCopy } from "@/lib/hub-empty-copy";

export const revalidate = 86400; // 24 ชม. — กัน WP ล่มตอน ISR
export const dynamicParams = true;

/** ไม่ SSG ตอน build — ทุก category เป็น ISR (build เร็ว) */
export async function generateStaticParams() {
  return [];
}

function toHtml(x: any) {
  const s = String(x ?? "");
  return s.trim();
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = String(params.slug || "").trim();
  if (!slug) return {};
  const term = await getCategoryBySlug(slug);
  if (!term?.slug) return {};
  const pathname = `/categories/${term.slug}`;
  const termName = term.name || term.slug;
  const fallback = `รวมเนื้อหาในหมวด ${termName}: บริการ • พื้นที่ • รุ่น/ราคา • FAQ พร้อมลิงก์เชื่อมโยงภายในแบบ Silo`;
  const desc = inferDescriptionFromHtml(term.description, fallback);
  return pageMetadata({
    title: `หมวดสินค้า: ${termName}`,
    description: desc,
    pathname,
  });
}

export default async function Page({ params }: { params: { slug: string } }) {
  const slugParam = String(params.slug || "").trim();
  if (!slugParam) notFound();

  const hubRaw = await getHubIndex();
  const hubFetchFailed = hubRaw === null;
  const data = hubRaw ?? {};
  const term = await getCategoryBySlug(slugParam);
  if (!term?.slug) notFound();

  const catSlug = String(term.slug).trim();
  const termName = String(term.name || catSlug).trim();

  const services = filterByCategory(data.services?.nodes ?? [], catSlug);
  const locations = filterByCategory(data.locationpages?.nodes ?? [], catSlug);
  const prices = filterByCategory(data.pricemodels?.nodes ?? [], catSlug);

  const seedFaqs = categoryFaqSeed(catSlug, termName);
  const faqs = seedFaqs
    .filter((x) => x.q && x.a)
    .slice(0, 10);

  const termDescPlain = stripHtml(String(term.description || "")).trim();
  const termDescHtml = toHtml(term.description);

  const pageUrl = `${siteUrl()}/categories/${catSlug}`;

  const breadcrumbJson = jsonLdBreadcrumb(pageUrl, [
    { name: "WEBUY HUB", url: `${siteUrl()}/` },
    { name: "หมวดสินค้า", url: `${siteUrl()}/categories` },
    { name: termName, url: pageUrl },
  ]);
  const faqJson = jsonLdFaqPage(pageUrl, faqs.map((f) => ({ title: f.q, answer: f.a })));

  // ✅ Internal links from WordPress data only
  const topInternalLinks = [
    ...services.slice(0, 5).map((s: any) => ({ href: `/services/${s.slug}`, label: `บริการ: ${s.title}` })),
    ...locations.slice(0, 5).map((l: any) => ({ href: `/locations/${l.slug}`, label: `${l.title}` })),
    ...prices.slice(0, 5).map((p: any) => ({ href: `/prices/${p.slug}`, label: `${p.title}` })),
  ].slice(0, 15);

  return (
    <div className="space-y-10">
      {/* JSON-LD */}
      <JsonLd json={breadcrumbJson} />
      <JsonLd json={faqJson} />

      {/* BREADCRUMB (UI) */}
      <nav className="pt-2 text-sm text-slate-600">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link className="link" href="/">
              หน้าแรก
            </Link>
          </li>
          <li className="opacity-60">/</li>
          <Link className="link" href="/categories">หมวดสินค้า</Link>

          <li className="opacity-60">/</li>
          <li className="font-semibold text-slate-900">{termName}</li>
        </ol>
      </nav>

      {/* HERO */}
      <section className="card hero card-pad space-y-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip">หมวดสินค้า</span>
              <span className="badge">{termName}</span>
              <span className="badge">/{catSlug}</span>
            </div>

            <h1 className="h1">รวมเนื้อหาในหมวด: {termName}</h1>

            {/* ✅ บทความหลักจาก WP (รองรับ HTML) */}
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
              <Link className="btn btn-ghost" href="/">
                ← กลับหน้าแรก
              </Link>
            </div>

            {/* Internal links badges (SEO) */}
            {!!topInternalLinks.length && (
              <div className="mt-3 flex flex-wrap gap-2">
                {topInternalLinks.map((x) => (
                  <Link key={x.href} className="badge" href={x.href}>
                    {x.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Quick jump */}
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

          {/* KPI */}
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

      {/* SERVICES */}
      <section id="services" className="space-y-4 scroll-mt-24">
        <div>
          <h2 className="h2">🔧 บริการ</h2>
          <p className="muted text-sm">หน้าบริการที่อยู่ในหมวดนี้</p>
        </div>

        <div className="cards-grid">
          {services.map((s: any) => (
            <Link
              key={s.slug}
              className="card-service group p-6 transition hover:-translate-y-0.5 hover:shadow-md"
              href={`/services/${s.slug}`}
            >
              <div className="text-base font-extrabold">{s.title}</div>
              <div className="muted mt-1 text-sm">/services/{s.slug}</div>
              <div className="mt-4 text-sm font-semibold text-blue-600">
                ดูรายละเอียด <span className="inline-block transition group-hover:translate-x-0.5">→</span>
              </div>
            </Link>
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

      {/* LOCATIONS */}
      <section id="locations" className="space-y-4 scroll-mt-24">
        <div>
          <h2 className="h2">📍 พื้นที่บริการ</h2>
          <p className="muted text-sm">พื้นที่/จังหวัดที่ให้บริการในหมวดนี้</p>
        </div>

        <div className="cards-grid">
          {locations.map((l: any) => (
            <Link
              key={l.slug}
              className="card-location group p-6 transition hover:-translate-y-0.5 hover:shadow-md"
              href={`/locations/${l.slug}`}
            >
              <div className="text-base font-extrabold">{l.title}</div>
              <div className="muted mt-1 text-sm">/locations/{l.slug}</div>
              <div className="mt-4 text-sm font-semibold text-orange-600">
                ดูรายละเอียด <span className="inline-block transition group-hover:translate-x-0.5">→</span>
              </div>
            </Link>
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

      {/* PRICES */}
      <section id="prices" className="space-y-4 scroll-mt-24">
        <div>
          <h2 className="h2">Price Models</h2>
          <p className="muted text-sm">รุ่น/ช่วงราคารับซื้อโดยประมาณในหมวดนี้</p>
        </div>

        <div className="cards-grid">
          {prices.map((p: any) => (
            <Link
              key={p.slug}
              className="card group p-6 transition hover:-translate-y-0.5 hover:shadow-md"
              href={`/prices/${p.slug}`}
            >
              <div className="text-base font-extrabold">{p.title}</div>
              <div className="muted mt-1 text-sm">
                ช่วงราคารับซื้อ:{" "}
                <span className="font-semibold text-slate-900">
                  {p.buyPriceMin}-{p.buyPriceMax}
                </span>{" "}
                บาท
              </div>
              <div className="mt-4 text-sm font-semibold text-brand-700">
                เปิดหน้า Price <span className="inline-block transition group-hover:translate-x-0.5">→</span>
              </div>
            </Link>
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

      {/* FAQ */}
      <section id="faqs" className="space-y-4 scroll-mt-24">
        <div>
          <h2 className="h2">❓ คำถามที่พบบ่อย</h2>
          <p className="muted text-sm">คำถามที่พบบ่อยในหมวดนี้</p>
        </div>

        <div className="grid gap-4">
          {faqs.map((f: any, i: number) => (
            <details key={f.slug || f.q || i} className="faq">
              <summary>{f.q || f.question || f.title}</summary>
              <div className="answer">{f.a || stripHtml(String(f.answer || ""))}</div>
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

      {/* CTA ซ้ำท้ายหน้า */}
      <section className="card-soft p-6">
        <div className="text-base font-extrabold">ต้องการประเมินราคาในหมวด {termName} แบบไว ๆ ?</div>
        <div className="muted mt-1 text-sm">
          ส่งรูป + รุ่น/สเปค + สภาพ ทาง LINE แล้วทีมงานประเมินให้ทันที (ราคาขึ้นอยู่กับสภาพจริง)
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <a className="btn btn-primary text-lg px-6 py-3" href={BUSINESS_INFO.lineUrl} target="_blank" rel="noreferrer">
            💬 LINE: {BUSINESS_INFO.line}
          </a>
          {!!services[0]?.slug && (
            <Link className="btn btn-ghost" href={`/services/${services[0].slug}`}>
              ดูบริการยอดนิยมในหมวดนี้ →
            </Link>
          )}
          {!!prices[0]?.slug && (
            <Link className="btn btn-ghost" href={`/prices/${prices[0].slug}`}>
              ดูรุ่น/ช่วงราคาแนะนำ →
            </Link>
          )}
        </div>
      </section>


      {/* ลิงก์ที่เกี่ยวข้อง (ช่วย internal linking ให้ครบ) */}
      <section className="card-soft p-6">
        <div className="text-sm font-extrabold">ลิงก์ที่เกี่ยวข้อง</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {topInternalLinks.map((item: { href: string; label: string }, i: number) => (
            <Link key={item.href + i} className="badge" href={item.href}>
              {item.label}
            </Link>
          ))}
          {!!termDescPlain && <span className="badge">คำอธิบายหมวด: มี</span>}
        </div>
      </section>

      <BackToTop />
    </div>
  );
}
