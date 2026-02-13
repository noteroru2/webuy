import Link from "next/link";
import { fetchGql } from "@/lib/wp";
import { Q_HUB_INDEX } from "@/lib/queries";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "หมวดสินค้า | WEBUY HUB",
  description:
    "รวมหมวดสินค้ารับซื้ออุปกรณ์ไอทีทั้งหมด เลือกหมวดเพื่อดูบริการ พื้นที่ รุ่น/ราคา และ FAQ ที่เกี่ยวข้อง",
  pathname: "/categories",
});

// รวม category จาก items หลายชุด (services/locationPages/priceModels/faqs)
function collectCategories(items: any[]) {
  const map = new Map<string, { slug: string; name: string; count: number }>();

  for (const it of items ?? []) {
    for (const n of it?.devicecategories?.nodes ?? []) {
      const slug = String(n?.slug || "").trim();
      if (!slug) continue;

      const name = String(n?.title || slug).trim();
      const prev = map.get(slug);

      if (!prev) map.set(slug, { slug, name, count: 1 });
      else map.set(slug, { ...prev, count: prev.count + 1, name: prev.name || name });
    }
  }

  return Array.from(map.values()).sort((a, b) => (b.count - a.count) || a.name.localeCompare(b.name));
}

export default async function Page() {
  const data = await fetchGql<any>(Q_HUB_INDEX, undefined, { revalidate });

  const allItems = [
    ...(data.services?.nodes ?? []),
    ...(data.locationpages?.nodes ?? []),
    ...(data.pricemodels?.nodes ?? []),
  ];

  const categories = collectCategories(allItems);

  return (
    <div className="space-y-10 py-8">
      {/* HERO */}
      <section className="card hero card-pad">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip">WEBUY HUB</span>
              <span className="badge">หมวดสินค้า</span>
              <span className="badge">SEO Silo</span>
            </div>

            <h1 className="h1">หมวดสินค้า (Categories)</h1>
            <p className="lead">
              เลือกหมวดสินค้าเพื่อไปดู <b>บริการ</b> • <b>พื้นที่</b> • <b>รุ่น/ราคา</b> • <b>FAQ</b> ที่เกี่ยวข้องในหมวดเดียวกัน
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <a className="btn btn-primary" href="https://line.me/R/ti/p/@webuy" target="_blank" rel="noreferrer">
                แชท LINE @webuy
              </a>
              <Link className="btn btn-ghost" href="/">
                ← กลับหน้าแรก
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:w-[360px]">
            <div className="kpi">
              <div className="label">จำนวนหมวดทั้งหมด</div>
              <div className="value">{categories.length}</div>
            </div>
            <div className="card-soft p-5">
              <div className="text-sm font-extrabold">ทริค SEO</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>✅ หมวด = Silo hub</li>
                <li>✅ ลิงก์เข้าหน้าหมวดช่วยกระจายพลัง SEO</li>
                <li>✅ ช่วย breadcrumb ถูกต้อง</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* LIST */}
      <section className="section scroll-mt-24">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="h2">รายการหมวดสินค้า</h2>
            <p className="muted text-sm">ดึงจาก devicecategories ที่ถูกผูกกับ Service/Location/Price/FAQ</p>
          </div>
        </div>

        <div className="cards-grid">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/categories/${c.slug}`}
              className="card group p-6 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-extrabold">{c.name}</div>
                  <div className="muted mt-1 text-sm">
                    มีเนื้อหาในหมวดนี้ประมาณ <span className="font-semibold text-slate-900">{c.count}</span> รายการ
                  </div>
                </div>
                <span className="badge">{c.slug}</span>
              </div>

              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
                เข้าไปดูหมวด <span className="transition group-hover:translate-x-0.5">→</span>
              </div>
            </Link>
          ))}

          {!categories.length && (
            <div className="card card-pad">
              <div className="text-sm font-extrabold">ยังไม่มีหมวด</div>
              <div className="muted mt-1 text-sm">
                ให้ไปที่ WP แล้วผูก devicecategories กับ Service/Location/Price/FAQ อย่างน้อย 1 รายการ
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
