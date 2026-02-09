import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { listProvinces, collectDistricts } from "@/lib/locations";

export const revalidate = 3600;

/** Internal link hub – จังหวัดยอดนิยมจาก AUTO_LOCATIONS */
function topProvincesForHub(limit = 6) {
  return listProvinces()
    .sort((a, b) => String(a.province).localeCompare(String(b.province), "th"))
    .slice(0, limit);
}

export const metadata: Metadata = pageMetadata({
  title: "พื้นที่บริการรับซื้อโน๊ตบุ๊ค • เลือกจังหวัด/อำเภอ | WEBUY HUB",
  description:
    "รวมพื้นที่บริการรับซื้อโน๊ตบุ๊คทั่วไทย เลือกจังหวัดเพื่อดูอำเภอ/เขตที่ให้บริการ ประเมินไว • นัดรับถึงที่ • จ่ายทันที ติดต่อ LINE @webuy",
  pathname: "/locations",
});

function sortedProvinces() {
  return listProvinces().sort((a, b) =>
    String(a.province).localeCompare(String(b.province), "th")
  );
}

export default function Page() {
  const provinces = sortedProvinces();

  return (
    <div className="space-y-10 py-6">
      <nav className="pt-2 text-sm text-slate-600">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link className="link" href="/">หน้าแรก</Link></li>
          <li className="opacity-60">/</li>
          <li className="font-semibold text-slate-900">พื้นที่บริการ</li>
        </ol>
      </nav>

      <section className="card hero card-pad space-y-4">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip">Locations Index</span>
              <span className="badge">รับซื้อโน๊ตบุ๊ค + จังหวัด</span>
            </div>
            <h1 className="h1">พื้นที่บริการรับซื้อโน๊ตบุ๊ค (เลือกจังหวัด/อำเภอ)</h1>
            <p className="lead">
              เลือกจังหวัดเพื่อเข้าหน้า "รับซื้อโน๊ตบุ๊ค + จังหวัด" และดูอำเภอ/เขตที่ให้บริการแบบเจาะพื้นที่
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a className="btn btn-primary" href="https://line.me/R/ti/p/@webuy" target="_blank" rel="noreferrer">แชท LINE @webuy</a>
              <Link className="btn btn-ghost" href="/categories/notebook">ดูหมวดโน๊ตบุ๊ค →</Link>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <a className="badge" href="#provinces">รายชื่อจังหวัด</a>
              <Link className="badge" href="/categories/notebook">หมวดโน๊ตบุ๊ค</Link>
              <Link className="badge" href="/">หน้าแรก</Link>
            </div>
            {/* Internal link hub – ช่วย SEO + AI */}
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
              <div className="text-sm font-bold text-slate-800">ลิงก์ที่เกี่ยวข้อง</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link className="badge" href="/categories/notebook">รับซื้อโน๊ตบุ๊ค (หมวด)</Link>
                {topProvincesForHub().map((p) => (
                  <Link key={p.provinceSlug} className="badge" href={`/locations/${p.provinceSlug}`}>
                    รับซื้อโน๊ตบุ๊ค {p.province}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:w-[360px]">
            <div className="kpi">
              <div className="label">จำนวนจังหวัด</div>
              <div className="value">{provinces.length}</div>
            </div>
            <div className="card-soft p-5">
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex gap-2"><span>✅</span><span>ประเมินไวใน LINE (ส่งรูป + สเปค)</span></li>
                <li className="flex gap-2"><span>✅</span><span>นัดรับถึงที่ (ตามพื้นที่บริการ)</span></li>
                <li className="flex gap-2"><span>✅</span><span>จ่ายทันที เงินสด/โอนหน้างาน</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="provinces" className="space-y-4 scroll-mt-24">
        <div>
          <h2 className="h2">รายชื่อจังหวัดที่ให้บริการ</h2>
          <p className="muted text-sm">คลิกจังหวัดเพื่อไปหน้า "รับซื้อโน๊ตบุ๊ค + จังหวัด" แล้วเลือกอำเภอ/เขตต่อได้</p>
        </div>
        <div className="cards-grid">
          {provinces.map((p) => {
            const n = collectDistricts(p.provinceSlug).length;
            return (
              <Link key={p.provinceSlug} href={`/locations/${p.provinceSlug}`} className="card group p-6 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-extrabold">รับซื้อโน๊ตบุ๊ค {p.province}</div>
                    <div className="muted mt-1 text-sm">/locations/{p.provinceSlug}</div>
                    <div className="muted mt-2 text-sm">มีอำเภอ/เขตย่อยประมาณ <span className="font-semibold text-slate-900">{n}</span> รายการ</div>
                  </div>
                  <span className="badge">{p.provinceSlug}</span>
                </div>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700">เข้าไปดูจังหวัด <span className="transition group-hover:translate-x-0.5">→</span></div>
              </Link>
            );
          })}
          {!provinces.length && (
            <div className="card card-pad">
              <div className="text-sm font-extrabold">ยังไม่มีข้อมูลจังหวัด</div>
              <div className="muted mt-1 text-sm">ตรวจ AUTO_LOCATIONS ให้มี record จังหวัด (provinceSlug มีค่า และ districtSlug ว่าง)</div>
            </div>
          )}
        </div>
      </section>

      <section className="card-soft p-6">
        <div className="text-base font-extrabold">ส่งรูป + สเปค เพื่อประเมินไวใน LINE</div>
        <div className="muted mt-1 text-sm">แนะนำส่ง: รุ่น/CPU/RAM/SSD + รูปเครื่อง/ตำหนิ + อะแดปเตอร์/กล่อง/ใบเสร็จ (ถ้ามี)</div>
        <div className="mt-4 flex flex-wrap gap-3">
          <a className="btn btn-primary" href="https://line.me/R/ti/p/@webuy" target="_blank" rel="noreferrer">เริ่มประเมินใน LINE @webuy</a>
          <Link className="btn btn-ghost" href="/">← กลับหน้าแรก</Link>
        </div>
      </section>
    </div>
  );
}
