import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { fetchGql } from "@/lib/wp";
import { Q_LOCATION_SLUGS } from "@/lib/queries";
import { BUSINESS_INFO } from "@/lib/constants";

export const revalidate = 86400; // 24 ชม. — ลดการยิง WP (กัน container ล่มตอน ISR)

function isPublish(status: any) {
  return String(status || "").toLowerCase() === "publish";
}

export const metadata: Metadata = pageMetadata({
  title: "พื้นที่บริการรับซื้อโน๊ตบุ๊ค • เลือกจังหวัด/อำเภอ | WEBUY HUB",
  description:
    "รวมพื้นที่บริการรับซื้อโน๊ตบุ๊คทั่วไทย เลือกจังหวัดเพื่อดูอำเภอ/เขตที่ให้บริการ ประเมินไว • นัดรับถึงที่ • จ่ายทันที ติดต่อ LINE: @webuy โทร: 064-2579353",
  pathname: "/locations",
});

export default async function Page() {
  let locations: any[] = [];

  try {
    const data = await fetchGql<any>(Q_LOCATION_SLUGS, undefined, { revalidate: 86400 });
    const nodes = (data?.locationpages?.nodes ?? [])
      .filter((n: any) => {
        if (!n?.slug || !isPublish(n?.status)) return false;
        const s = String(n?.site || "").toLowerCase();
        return !s || s === "webuy"; // ยอมรับ site ว่าง หรือ webuy
      })
      .sort((a: any, b: any) => String(a.title || "").localeCompare(String(b.title || ""), "th"));
    if (nodes.length > 0) {
      locations = nodes;
      if (process.env.NODE_ENV === "development") console.log(`✅ [Locations Index] Found ${locations.length} from WP`);
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.warn("[Locations Index] WP fetch failed:", (error as Error)?.message);
  }

  return (
    <div className="space-y-10 py-6">
      <nav className="pt-2 text-sm text-slate-600">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link className="link" href="/">หน้าแรก</Link></li>
          <li className="opacity-60">/</li>
          <li className="font-semibold text-slate-900">พื้นที่บริการ</li>
        </ol>
      </nav>

      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-50 via-white to-slate-50 p-8 shadow-lg">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-brand-100/30 blur-3xl"></div>
        <div className="absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-sky-100/40 blur-3xl"></div>
        
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm">
                📍 พื้นที่บริการ
              </span>
              <span className="badge bg-white/80 backdrop-blur">ทั่วประเทศ</span>
            </div>
            
            <h1 className="text-4xl font-extrabold leading-tight text-slate-900 lg:text-5xl">
              รับซื้อโน๊ตบุ๊ค<br />
              <span className="bg-gradient-to-r from-brand-600 to-sky-600 bg-clip-text text-transparent">
                ครอบคลุมทุกจังหวัด
              </span>
            </h1>
            
            <p className="max-w-2xl text-lg text-slate-600">
              นัดรับถึงบ้านทั่วไทย • ประเมินฟรีทาง LINE • จ่ายเงินสดทันที
            </p>
            
            <div className="flex flex-wrap gap-3 pt-2">
              <a 
                className="btn btn-primary text-lg px-8 py-4 shadow-lg shadow-brand-600/30 hover:shadow-xl hover:shadow-brand-600/40 transition-all" 
                href={BUSINESS_INFO.lineUrl} 
                target="_blank" 
                rel="noreferrer"
              >
                <span className="text-2xl mr-2">💬</span>
                LINE: {BUSINESS_INFO.line}
              </a>
              <a 
                className="btn btn-ghost px-8 py-4 bg-white/80 backdrop-blur hover:bg-white" 
                href={BUSINESS_INFO.phoneHref}
              >
                📞 {BUSINESS_INFO.phone}
              </a>
            </div>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:w-[400px] lg:grid-cols-1">
            <div className="rounded-xl bg-white/80 p-6 shadow-md backdrop-blur">
              <div className="mb-2 text-sm font-semibold text-slate-500">พื้นที่ให้บริการ</div>
              <div className="text-4xl font-extrabold text-brand-600">{locations.length}</div>
              <div className="mt-1 text-sm text-slate-600">จังหวัดทั่วประเทศ</div>
            </div>
            
            <div className="rounded-xl bg-white/80 p-6 shadow-md backdrop-blur">
              <div className="mb-2 text-sm font-semibold text-slate-500">หน้าร้าน</div>
              <div className="text-lg font-bold text-slate-900">{BUSINESS_INFO.address.province}</div>
              <div className="mt-2 space-y-1.5 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>ประเมินฟรี</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>นัดรับถึงบ้าน</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>จ่ายสดทันที</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="provinces" className="space-y-6 scroll-mt-24">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900">เลือกพื้นที่บริการของคุณ</h2>
          <p className="mt-2 text-slate-600">คลิกเพื่อดูรายละเอียดและบริการที่เกี่ยวข้อง</p>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((loc: any) => (
            <Link 
              key={loc.slug} 
              href={`/locations/${loc.slug}`} 
              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl"
            >
              <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-br from-brand-100/50 to-transparent"></div>
              
              <div className="relative space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-brand-600 transition-colors">
                      {loc.title || loc.province || 'ไม่ระบุชื่อ'}
                    </h3>
                    {loc.province && loc.title !== loc.province && (
                      <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                        <span className="text-brand-600">📍</span>
                        <span>{loc.province}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-xl text-brand-600 transition-all group-hover:bg-brand-600 group-hover:text-white group-hover:scale-110">
                    →
                  </div>
                </div>
                
                {(loc.devicecategories?.nodes ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {(loc.devicecategories?.nodes ?? []).slice(0, 3).map((cat: any) => (
                      <span 
                        key={cat.slug} 
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        {cat.name}
                      </span>
                    ))}
                    {(loc.devicecategories?.nodes ?? []).length > 3 && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                        +{(loc.devicecategories?.nodes ?? []).length - 3}
                      </span>
                    )}
                  </div>
                )}
                
                <div className="pt-2 text-sm font-semibold text-brand-600 group-hover:text-brand-700">
                  ดูรายละเอียด →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {locations.length === 0 && (
        <section className="card p-8 text-center">
          <div className="text-4xl mb-4">📍</div>
          <h2 className="text-xl font-bold mb-2">กำลังเพิ่มพื้นที่บริการ</h2>
          <p className="text-slate-600 mb-4">
            ติดต่อสอบถามพื้นที่บริการของคุณได้ทาง LINE: {BUSINESS_INFO.line}
          </p>
          <a 
            href={BUSINESS_INFO.lineUrl} 
            target="_blank" 
            rel="noreferrer"
            className="btn btn-primary inline-flex items-center gap-2"
          >
            💬 แชท LINE
          </a>
        </section>
      )}

      <section className="card-soft p-8 text-center">
        <h2 className="text-xl font-bold mb-4">📱 ส่งรูปเพื่อประเมินราคา</h2>
        <p className="text-slate-600 mb-6">
          ส่ง: รุ่น/CPU/RAM/SSD + รูปเครื่อง/ตำหนิ + อุปกรณ์ที่มี (อะแดปเตอร์/กล่อง/ใบเสร็จ)
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a 
            className="btn btn-primary text-lg px-6 py-3" 
            href={BUSINESS_INFO.lineUrl} 
            target="_blank" 
            rel="noreferrer"
          >
            💬 LINE: {BUSINESS_INFO.line}
          </a>
          <a className="btn btn-ghost px-6 py-3" href={BUSINESS_INFO.phoneHref}>
            📞 {BUSINESS_INFO.phone}
          </a>
        </div>
      </section>
    </div>
  );
}
