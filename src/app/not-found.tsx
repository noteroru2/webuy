import Link from "next/link";
import { BUSINESS_INFO } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ไม่พบหน้า",
  description: "หน้าที่คุณต้องการไม่มีอยู่ ลองกลับหน้าแรกหรือดูหมวดสินค้า",
  robots: "noindex, follow",
};

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center max-w-md mx-auto space-y-6">
        <div className="text-8xl font-black text-slate-200 select-none">404</div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          ไม่พบหน้าที่คุณต้องการ
        </h1>
        <p className="muted text-sm leading-relaxed">
          หน้านี้อาจถูกลบหรือย้ายไปแล้ว
          <br />
          ลองกลับหน้าแรกหรือดูหมวดสินค้าที่รับซื้อ
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <Link
            href="/"
            className="btn btn-primary inline-flex items-center gap-2"
          >
            ← กลับหน้าแรก
          </Link>
          <Link
            href="/categories"
            className="btn btn-ghost inline-flex items-center gap-2"
          >
            ดูหมวดสินค้า
          </Link>
        </div>
        <div className="pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-600 mb-3">หรือติดต่อเราทาง LINE</p>
          <a
            href={BUSINESS_INFO.lineUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-600 transition"
          >
            💬 LINE: {BUSINESS_INFO.line}
          </a>
        </div>
      </div>
    </div>
  );
}
