import Link from "next/link";
import Image from "next/image";
import { fetchGql, siteUrl } from "@/lib/wp";
import { Q_HUB_INDEX } from "@/lib/queries";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { jsonLdHowTo } from "@/lib/jsonld";
import { jsonLdOrganization, jsonLdWebSite } from "@/lib/jsonld-org";
import { BackToTop } from "@/components/BackToTop";
import { EmptyState } from "@/components/EmptyState";
import { BUSINESS_INFO } from "@/lib/constants";

export const metadata: Metadata = pageMetadata({
  title: "รับซื้อโน๊ตบุ๊ค MacBook PC อุปกรณ์ไอที | ราคาสูง นัดรับถึงบ้าน",
  description:
    "รับซื้อโน๊ตบุ๊ค MacBook PC อุปกรณ์ไอที ให้ราคาสูง ประเมินฟรี นัดรับถึงที่ จ่ายเงินสด ทั่วประเทศ | LINE @webuy โทร 064-2579353",
  pathname: "/",
});

export const revalidate = 3600;

// ช่วยรวม category จาก items หลายชุด (services/locationPages/priceModels/faqs)
function collectCategories(items: any[]) {
  const map = new Map<string, { slug: string; name: string; count: number }>();

  for (const it of items ?? []) {
    for (const n of it?.devicecategories?.nodes ?? []) {
      const slug = String(n?.slug || "").trim();
      if (!slug) continue;

      const name = String(n?.name || slug).trim();
      const prev = map.get(slug);

      if (!prev) map.set(slug, { slug, name, count: 1 });
      else map.set(slug, { ...prev, count: prev.count + 1, name: prev.name || name });
    }
  }

  // เรียง: count มากก่อน แล้วตามชื่อ
  return Array.from(map.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function isPublish(status: any) {
  return String(status || "").toLowerCase() === "publish";
}

function takePublished(nodes: any[], limit = 8) {
  return (nodes ?? []).filter((x: any) => x?.slug && isPublish(x?.status)).slice(0, limit);
}

export default async function Page() {
  const data = await fetchGql<any>(Q_HUB_INDEX, undefined, { revalidate });

  const servicesAll = data.services?.nodes ?? [];
  const locationsAll = data.locationPages?.nodes ?? [];
  const pricesAll = data.priceModels?.nodes ?? [];
  const faqsAll = data.faqs?.nodes ?? [];

  const allItems = [...servicesAll, ...locationsAll, ...pricesAll, ...faqsAll];
  const categories = collectCategories(allItems);

  // ✅ internal linking hub (เลือกชุด “ล่าสุด/มีอยู่จริง” ก่อน)
  const topServices = takePublished(servicesAll, 8);
  const topLocations = takePublished(locationsAll, 8);
  const topPrices = takePublished(pricesAll, 8);

  // ✅ สุ่ม “หมวดตัวอย่าง” ให้ชัวร์ว่ามี
  const sampleCatSlug = categories[0]?.slug || "notebook";

  const pageUrl = siteUrl() + "/";
  const howToJson = jsonLdHowTo(pageUrl);
  const orgJson = jsonLdOrganization(data.page ?? {});
  const websiteJson = jsonLdWebSite();

  return (
    <div className="space-y-10 py-8">
      <JsonLd json={orgJson} />
      <JsonLd json={websiteJson} />
      <JsonLd json={howToJson} />
      {/* HERO */}
      <section className="card hero card-pad relative">
        {/* Floating elements */}
        <div className="absolute top-10 right-10 opacity-20 hidden lg:block">
          <div className="text-8xl animate-float">💻</div>
        </div>
        <div className="absolute bottom-10 left-10 opacity-20 hidden lg:block" style={{ animationDelay: '1s' }}>
          <div className="text-6xl animate-float">📱</div>
        </div>
        
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4 lg:w-3/5 animate-fadeIn">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip text-xs sm:text-sm">🚀 Webuy Hub • รับซื้ออุปกรณ์ไอทีออนไลน์</span>
              <span className="badge animate-pulse">ประเมินไว</span>
              <span className="badge animate-pulse" style={{ animationDelay: '0.2s' }}>นัดรับถึงที่</span>
              <span className="badge animate-pulse" style={{ animationDelay: '0.4s' }}>จ่ายทันที</span>
            </div>

            <h1 className="h1 bg-gradient-to-r from-slate-900 via-brand-700 to-slate-900 bg-clip-text text-transparent">
              รับซื้ออุปกรณ์ไอทีถึงบ้าน<br />
              <span className="text-brand-600">ประเมินไว • นัดรับถึงที่ • จ่ายทันที</span>
            </h1>
            <p className="lead text-slate-600">
              ✨ ส่งรูป + สเปคทาง LINE แล้วรอรับราคา • นัดรับถึงที่ในพื้นที่บริการ • รับเงินสดหรือโอนทันที
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <a className="btn btn-primary text-lg px-8 py-4" href={BUSINESS_INFO.lineUrl} target="_blank" rel="noreferrer">
                💬 LINE: {BUSINESS_INFO.line}
              </a>

              <Link className="btn btn-ghost" href={`/categories/${sampleCatSlug}`}>
                ดูตัวอย่างหมวด →
              </Link>
            </div>

            {/* quick jump */}
            <div className="mt-3 flex flex-wrap gap-2">
              <a className="badge" href="#categories">หมวดสินค้า</a>
              <a className="badge" href="#services">บริการ</a>
              <a className="badge" href="#locations">พื้นที่บริการ</a>
              <a className="badge" href="#prices">รุ่น/ราคา</a>
              <a className="badge" href="#how">ขั้นตอนรับซื้อ</a>
            </div>

            {/* ✅ internal links (Hub) */}
            {(topServices.length || topLocations.length || topPrices.length) ? (
              <div className="mt-4">
                <div className="text-sm font-extrabold">ลิงก์ยอดนิยม (ช่วยค้นหาข้อมูลไว)</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {topServices.slice(0, 3).map((s: any) => (
                    <Link key={s.slug} className="badge" href={`/services/${s.slug}`}>
                      บริการ: {s.title}
                    </Link>
                  ))}
                  {topLocations.slice(0, 3).map((l: any) => (
                    <Link key={l.slug} className="badge" href={`/locations/${l.slug}`}>
                      พื้นที่: {l.title}
                    </Link>
                  ))}
                  {topPrices.slice(0, 3).map((p: any) => (
                    <Link key={p.slug} className="badge" href={`/prices/${p.slug}`}>
                      รุ่น/ราคา: {p.title}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Hero Image */}
          <div className="lg:w-2/5 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <div className="relative">
              {/* Main hero image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <Image
                  src="/images/hero-products.jpg"
                  alt="WEBUY HUB - รับซื้ออุปกรณ์ไอที โน๊ตบุ๊ค MacBook iPhone"
                  width={600}
                  height={750}
                  priority
                  quality={90}
                  className="w-full h-auto"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -left-4 animate-float z-10">
                <div className="rounded-2xl bg-emerald-500 px-4 py-2 shadow-lg backdrop-blur">
                  <div className="text-sm font-bold text-white">⚡ ตอบใน 5 นาที</div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 animate-float z-10" style={{ animationDelay: '1.5s' }}>
                <div className="rounded-2xl bg-blue-500 px-4 py-2 shadow-lg backdrop-blur">
                  <div className="text-sm font-bold text-white">🎯 ราคาดีที่สุด</div>
                </div>
              </div>

              {/* Stats overlay */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[90%]">
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-white/95 backdrop-blur p-3 text-center shadow-lg border border-slate-200">
                    <div className="text-xl sm:text-2xl font-extrabold text-brand-600">500+</div>
                    <div className="text-[10px] sm:text-xs text-slate-600">ลูกค้า</div>
                  </div>
                  <div className="rounded-xl bg-white/95 backdrop-blur p-3 text-center shadow-lg border border-slate-200">
                    <div className="text-xl sm:text-2xl font-extrabold text-blue-600">24/7</div>
                    <div className="text-[10px] sm:text-xs text-slate-600">บริการ</div>
                  </div>
                  <div className="rounded-xl bg-white/95 backdrop-blur p-3 text-center shadow-lg border border-slate-200">
                    <div className="text-xl sm:text-2xl font-extrabold text-orange-600">4.9⭐</div>
                    <div className="text-[10px] sm:text-xs text-slate-600">รีวิว</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 highlights */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { 
              icon: "⚡", 
              color: "from-yellow-400 to-orange-500",
              t: "ประเมินไว", 
              d: "ส่งรูป + สเปค ทาง LINE รับราคาภายใน 5 นาที" 
            },
            { 
              icon: "🚗", 
              color: "from-blue-400 to-blue-600",
              t: "นัดรับถึงที่", 
              d: "รับถึงบ้าน/ออฟฟิศ ในพื้นที่บริการ" 
            },
            { 
              icon: "💵", 
              color: "from-emerald-400 to-emerald-600",
              t: "จ่ายทันที", 
              d: "เงินสด/โอนหน้างาน หลังตรวจสภาพ" 
            },
          ].map((x, i) => (
            <div 
              key={x.t} 
              className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-md hover:shadow-xl transition-all duration-300 animate-fadeIn border border-slate-200"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br ${x.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
              <div className="relative">
                <div className="text-4xl mb-3">{x.icon}</div>
                <div className="text-base font-extrabold text-slate-900">{x.t}</div>
                <div className="muted mt-2 text-sm leading-relaxed">{x.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="section scroll-mt-24">
        <div className="text-center mb-8">
          <h2 className="h2 inline-flex items-center gap-3">
            <span className="text-3xl">📦</span>
            หมวดสินค้า
          </h2>
          <p className="muted mt-2 text-sm">เลือกหมวดเพื่อดูบริการ พื้นที่ รุ่น/ราคา และ FAQ</p>
        </div>

        <div className="cards-grid">
          {categories.map((c, i) => {
            const icons: Record<string, string> = {
              'notebook': '💻',
              'macbook': '🍎',
              'pc': '🖥️',
              'phone': '📱',
              'tablet': '📱',
              'camera': '📷',
              'console': '🎮',
              'gpu': '🎨',
              'monitor': '🖥️',
              'printer': '🖨️',
              'accessories': '⌨️'
            };
            const icon = icons[c.slug] || '📦';
            const gradients = [
              'from-blue-500 to-purple-600',
              'from-emerald-500 to-teal-600',
              'from-orange-500 to-red-600',
              'from-pink-500 to-rose-600',
              'from-cyan-500 to-blue-600',
              'from-amber-500 to-orange-600'
            ];
            const gradient = gradients[i % gradients.length];
            
            return (
              <Link
                key={c.slug}
                href={`/categories/${c.slug}`}
                className="group relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                
                {/* Icon background */}
                <div className="absolute -top-4 -right-4 text-8xl opacity-5 group-hover:opacity-10 transition-opacity">
                  {icon}
                </div>

                <div className="relative">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-2xl shadow-md`}>
                      {icon}
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {c.count} รายการ
                    </span>
                  </div>
                  
                  <div className="text-lg font-extrabold text-slate-900 mb-2">{c.name}</div>
                  <div className="text-xs text-slate-500 mb-4">/{c.slug}</div>

                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 group-hover:text-brand-700">
                    เข้าไปดูหมวด 
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </Link>
            );
          })}

          {!categories.length && (
            <EmptyState
              title="ยังไม่มีหมวดสินค้า"
              description="กำลังเพิ่มหมวดสินค้าใหม่ ติดต่อ LINE เพื่อสอบถามข้อมูล"
              icon="📦"
              actionLabel="แชท LINE"
              actionHref="https://line.me/R/ti/p/@webuy"
              actionExternal
            />
          )}
        </div>
      </section>

      {/* SERVICES HUB */}
      <section id="services" className="space-y-4 scroll-mt-24">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="h2">บริการยอดนิยม</h2>
            <p className="muted text-sm">เข้าไปอ่านรายละเอียดบริการ + FAQ + ลิงก์ไปพื้นที่/รุ่นที่เกี่ยวข้อง</p>
          </div>
          {!!topServices[0]?.slug && (
            <Link className="link" href={`/services/${topServices[0].slug}`}>ดูตัวอย่าง →</Link>
          )}
        </div>

        <div className="cards-grid">
          {topServices.map((s: any) => (
            <Link key={s.slug} className="card p-6 transition hover:shadow-md" href={`/services/${s.slug}`}>
              <div className="text-base font-extrabold">{s.title}</div>
              <div className="muted mt-1 text-sm">/services/{s.slug}</div>
              <div className="mt-4 text-sm font-semibold text-brand-700">เปิดหน้า Service →</div>
            </Link>
          ))}

          {!topServices.length && (
            <EmptyState
              title="กำลังเพิ่มบริการใหม่"
              description="ติดต่อทาง LINE เพื่อสอบถามบริการที่คุณสนใจ"
              icon="🔧"
              actionLabel="แชท LINE"
              actionHref="https://line.me/R/ti/p/@webuy"
              actionExternal
            />
          )}
        </div>
      </section>

      {/* LOCATIONS HUB */}
      <section id="locations" className="space-y-4 scroll-mt-24">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="h2">พื้นที่บริการ</h2>
            <p className="muted text-sm">เราให้บริการรับซื้อทั่วประเทศ มีหน้าร้านจริงที่อุบลราชธานี พร้อมนัดรับถึงที่</p>
          </div>
          {!!topLocations[0]?.slug && (
            <Link className="link" href={`/locations/${topLocations[0].slug}`}>ดูตัวอย่าง →</Link>
          )}
        </div>

        <div className="cards-grid">
          {topLocations.map((l: any) => (
            <Link key={l.slug} className="card p-6 transition hover:shadow-md" href={`/locations/${l.slug}`}>
              <div className="text-base font-extrabold">{l.title}</div>
              <div className="muted mt-1 text-sm">/locations/{l.slug}</div>
              <div className="mt-4 text-sm font-semibold text-brand-700">เปิดหน้า Location →</div>
            </Link>
          ))}

          {!topLocations.length && (
            <EmptyState
              title="กำลังขยายพื้นที่บริการ"
              description="สอบถามพื้นที่บริการของคุณทาง LINE"
              icon="📍"
              actionLabel="สอบถามพื้นที่"
              actionHref="https://line.me/R/ti/p/@webuy"
              actionExternal
            />
          )}
        </div>
      </section>

      {/* PRICES HUB */}
      <section id="prices" className="space-y-4 scroll-mt-24">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="h2">รุ่น/ช่วงราคารับซื้อ</h2>
            <p className="muted text-sm">ตรวจสอบราคารับซื้อตามรุ่นและสเปค ราคาอัปเดตตามสภาพตลาด</p>
          </div>
          {!!topPrices[0]?.slug && (
            <Link className="link" href={`/prices/${topPrices[0].slug}`}>ดูตัวอย่าง →</Link>
          )}
        </div>

        <div className="cards-grid">
          {topPrices.map((p: any) => (
            <Link key={p.slug} className="card p-6 transition hover:shadow-md" href={`/prices/${p.slug}`}>
              <div className="text-base font-extrabold">{p.title}</div>
              <div className="muted mt-1 text-sm">
                ช่วงราคารับซื้อ:{" "}
                <span className="font-semibold text-slate-900">
                  {p.buyPriceMin}-{p.buyPriceMax}
                </span>{" "}
                บาท
              </div>
              <div className="mt-4 text-sm font-semibold text-brand-700">เปิดหน้า Price →</div>
            </Link>
          ))}

          {!topPrices.length && (
            <EmptyState
              title="กำลังอัปเดตราคา"
              description="ส่งรูป + สเปคทาง LINE เพื่อประเมินราคาแบบเรียลไทม์"
              icon="💰"
              actionLabel="ประเมินราคา"
              actionHref="https://line.me/R/ti/p/@webuy"
              actionExternal
            />
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-50 via-white to-blue-50 p-8 sm:p-12 scroll-mt-24 border border-brand-100">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="relative">
          <div className="text-center mb-10">
            <h2 className="h2 inline-flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              ขั้นตอนรับซื้อ
            </h2>
            <p className="muted mt-2 text-sm">ง่าย • ชัดเจน • จบไวใน 3 ขั้นตอน</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 relative">
            {/* Connection lines */}
            <div className="hidden md:block absolute top-1/4 left-1/4 right-1/4 h-1 bg-gradient-to-r from-brand-200 via-brand-300 to-brand-200 -z-0" />

            {[
              { 
                num: "1", 
                icon: "📱", 
                title: "ส่งข้อมูล", 
                desc: `ส่งรูป + รุ่น/สเปค + สภาพ ทาง LINE ${BUSINESS_INFO.line}`,
                color: "from-blue-500 to-blue-600" 
              },
              { 
                num: "2", 
                icon: "💡", 
                title: "ประเมินราคา", 
                desc: "ทีมงานตอบกลับภายใน 5 นาที พร้อมช่วงราคาตามสภาพจริง",
                color: "from-emerald-500 to-emerald-600" 
              },
              { 
                num: "3", 
                icon: "✨", 
                title: "นัดรับ/จ่ายเงิน", 
                desc: "นัดรับถึงบ้าน/ออฟฟิศ และจ่ายเงินสดหรือโอนทันที",
                color: "from-orange-500 to-orange-600" 
              },
            ].map((step, i) => (
              <div key={step.num} className="relative animate-fadeIn" style={{ animationDelay: `${i * 0.2}s` }}>
                {/* Step number badge */}
                <div className={`absolute -top-3 -left-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${step.color} text-xl font-extrabold text-white shadow-lg`}>
                  {step.num}
                </div>

                <div className="h-full rounded-2xl bg-white border-2 border-brand-100 p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="text-5xl mb-4 text-center animate-float" style={{ animationDelay: `${i * 0.5}s` }}>
                    {step.icon}
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-extrabold text-slate-900 mb-2">{step.title}</div>
                    <div className="text-sm text-slate-600 leading-relaxed">{step.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a 
              className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-8 py-4 text-base font-bold text-white shadow-lg hover:shadow-xl transition-all hover:scale-105" 
              href={BUSINESS_INFO.lineUrl} 
              target="_blank" 
              rel="noreferrer"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              เริ่มประเมินราคาใน LINE ฟรี
            </a>
            <p className="mt-4 text-xs text-slate-500">🔒 ปลอดภัย • ไม่มีค่าใช้จ่าย • ตอบภายใน 5 นาที</p>
          </div>
        </div>
      </section>

      {/* ABOUT / TEAM */}
      <section className="card overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image side */}
          <div className="relative h-64 md:h-auto">
            <Image
              src="/images/staff-laptop.jpg"
              alt="ทีมงาน WEBUY HUB - รับซื้อโน๊ตบุ๊ค MacBook อุปกรณ์ไอที"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent md:bg-gradient-to-r" />
            
            {/* Text on image */}
            <div className="absolute bottom-6 left-6 text-white z-10">
              <div className="text-2xl sm:text-3xl font-extrabold mb-2">We buy new and<br />used notebooks.</div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold shadow-lg">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
                LINE {BUSINESS_INFO.line}
              </div>
            </div>
          </div>

          {/* Content side */}
          <div className="p-8 sm:p-12 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 text-brand-600 font-bold text-sm mb-4">
              <span className="h-1 w-8 rounded-full bg-brand-600" />
              เกี่ยวกับเรา
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4">
              ทีมงานมืออาชีพ<br />
              <span className="text-brand-600">พร้อมให้บริการคุณ</span>
            </h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              เรามีประสบการณ์มากกว่า <strong className="text-slate-900">5 ปี</strong> ในการรับซื้อ-ขายอุปกรณ์ไอที 
              มีร้านจริง ทีมงานจริง ประเมินราคายุติธรรมตามสภาพจริง พร้อมให้คำปรึกษาฟรี
            </p>
            <ul className="space-y-3 mb-8">
              {[
                { icon: "✅", text: "ประเมินราคาฟรี ไม่มีค่าใช้จ่าย" },
                { icon: "✅", text: "ทีมงานมืออาชีพ ประสบการณ์ 5+ ปี" },
                { icon: "✅", text: "มีหน้าร้านจริง ตรวจสอบได้" },
                { icon: "✅", text: "รับซื้อทุกสภาพ (ใช้งานได้/ชำรุด)" }
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-emerald-500 text-lg flex-shrink-0">{item.icon}</span>
                  <span className="text-sm text-slate-700">{item.text}</span>
                </li>
              ))}
            </ul>
            <a 
              href={BUSINESS_INFO.lineUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-xl bg-emerald-500 px-6 py-3 text-white font-bold hover:bg-emerald-600 transition-all hover:scale-105 shadow-lg w-fit"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              คุยกับทีมงานทาง LINE
            </a>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="h2 inline-flex items-center gap-3">
            <span className="text-3xl">💬</span>
            ลูกค้าพูดถึงเรา
          </h2>
          <p className="muted mt-2 text-sm">ความคิดเห็นจากลูกค้าที่ใช้บริการจริง</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "คุณสมชาย ว.",
              rating: 5,
              text: "ประเมินราคาไว ได้ราคาดี นัดรับถึงบ้าน จ่ายเงินสดทันที ประทับใจมากครับ 👍",
              product: "MacBook Pro M1",
              avatar: "🧑‍💼",
              gradient: "from-blue-500 to-purple-600"
            },
            {
              name: "คุณนิดา ส.",
              rating: 5,
              text: "บริการดีมาก ทีมงานมืออาชีพ อธิบายชัดเจน ได้ราคายุติธรรม แนะนำเลยค่ะ 💯",
              product: "iPhone 13 Pro",
              avatar: "👩‍💼",
              gradient: "from-pink-500 to-rose-600"
            },
            {
              name: "คุณวิชัย ก.",
              rating: 5,
              text: "รวดเร็ว โปร่งใส ตรวจสอบสภาพละเอียด ไม่บีบราคา ใช้บริการหลายรอบแล้ว 🔥",
              product: "Gaming Notebook",
              avatar: "👨‍💻",
              gradient: "from-orange-500 to-red-600"
            }
          ].map((review, i) => (
            <div 
              key={i} 
              className="group relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Quote icon */}
              <div className="absolute top-4 right-4 text-4xl opacity-10">"</div>
              
              {/* Rating stars */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(review.rating)].map((_, j) => (
                  <span key={j} className="text-yellow-400 text-lg">⭐</span>
                ))}
              </div>

              {/* Review text */}
              <p className="text-sm text-slate-700 leading-relaxed mb-6 relative z-10">
                {review.text}
              </p>

              {/* Reviewer info */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${review.gradient} text-2xl shadow-md`}>
                  {review.avatar}
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-900">{review.name}</div>
                  <div className="text-xs text-slate-500">{review.product}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: "⭐", value: "4.9/5", label: "คะแนนรีวิว" },
            { icon: "👥", value: "500+", label: "ลูกค้า" },
            { icon: "✅", value: "100%", label: "จ่ายทันที" },
            { icon: "🚀", value: "< 5 นาที", label: "ประเมินราคา" }
          ].map((stat, i) => (
            <div key={i} className="text-center p-4 rounded-2xl bg-gradient-to-br from-white to-slate-50 border border-slate-200">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-xl font-extrabold text-brand-600">{stat.value}</div>
              <div className="text-xs text-slate-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA END */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-emerald-600 p-8 sm:p-12 text-white shadow-2xl">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        
        <div className="relative z-10 text-center">
          <div className="text-5xl mb-4 animate-float">🚀</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">พร้อมประเมินราคาแล้ว?</h2>
          <p className="text-white/90 text-base sm:text-lg max-w-2xl mx-auto mb-8">
            ส่งรูป + รุ่น/สเปค + สภาพ ทาง LINE แล้วทีมงานจะประเมินให้ภายใน 5 นาที<br />
            <span className="text-sm">(ราคาขึ้นอยู่กับสภาพจริง)</span>
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              className="inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-base font-bold text-brand-600 shadow-lg hover:shadow-xl transition-all hover:scale-105" 
              href={BUSINESS_INFO.lineUrl} 
              target="_blank" 
              rel="noreferrer"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              💬 LINE: {BUSINESS_INFO.line}
            </a>
            {!!categories[0]?.slug && (
              <Link 
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-white px-8 py-4 text-base font-bold text-white hover:bg-white/10 transition-all" 
                href={`/categories/${categories[0].slug}`}
              >
                เริ่มจากหมวดที่คนนิยม →
              </Link>
            )}
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>ฟรีไม่มีค่าใช้จ่าย</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>ตอบภายใน 5 นาที</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>ปลอดภัย 100%</span>
            </div>
          </div>
        </div>
      </section>

      <BackToTop />
    </div>
  );
}
