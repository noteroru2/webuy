import Link from "next/link";
import { fetchGql } from "@/lib/wp";
import { Q_HUB_INDEX } from "@/lib/queries";
import { getCategoriesFromHub } from "@/lib/categories";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 86400; // 24 ชม. กัน WP ล่มตอน ISR

export const metadata: Metadata = pageMetadata({
  title: "หมวดสินค้า | WEBUY HUB",
  description:
    "รวมหมวดสินค้ารับซื้ออุปกรณ์ไอที โน๊ตบุ๊ค มือถือ แท็บเล็ต เลือกหมวดเพื่อดูบริการรับซื้อ พื้นที่ให้บริการ และราคารับซื้อ",
  pathname: "/categories",
});

export default async function Page() {
  const raw = await fetchGql<any>(Q_HUB_INDEX, undefined, { revalidate });
  const data = raw ?? {};

  const categories = getCategoriesFromHub(data);

  return (
    <div className="space-y-10 py-8">
      {/* HERO */}
      <section className="card hero card-pad">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <h1 className="h1">หมวดสินค้า</h1>
            <p className="lead">
              เลือกหมวดที่สนใจเพื่อดูบริการรับซื้อ พื้นที่ให้บริการ ราคารับซื้อ และคำถามที่พบบ่อยในหมวดนั้น
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

          <div className="kpi sm:w-[200px]">
            <div className="label">หมวดสินค้า</div>
            <div className="value">{categories.length}</div>
          </div>
        </div>
      </section>

      {/* LIST */}
      <section className="section scroll-mt-24">
        <h2 className="h2">รายการหมวดสินค้า</h2>

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
                    {c.count > 0
                      ? <>มีเนื้อหาในหมวดนี้ประมาณ <span className="font-semibold text-slate-900">{c.count}</span> รายการ</>
                      : "มีบริการ • พื้นที่ • ราคา ในหมวดนี้"}
                  </div>
                </div>
                <span className="badge">{c.slug}</span>
              </div>

              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
                เข้าไปดูหมวด <span className="transition group-hover:translate-x-0.5">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
