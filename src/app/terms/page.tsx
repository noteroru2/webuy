import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "เงื่อนไขการใช้งาน | WEBUY HUB",
  description:
    "เงื่อนไขการใช้งานบริการรับซื้ออุปกรณ์ไอทีของ WEBUY HUB การประเมินราคา นัดรับสินค้า และข้อตกลงระหว่างผู้ใช้กับบริษัท",
  pathname: "/terms",
  type: "website",
});

export default function TermsPage() {
  return (
    <div className="space-y-10 py-8">
      <section className="card hero card-pad">
        <h1 className="h1">เงื่อนไขการใช้งาน</h1>
        <p className="lead mt-2">
          การใช้บริการรับซื้ออุปกรณ์ไอทีของ WEBUY HUB ถือว่าคุณยอมรับเงื่อนไขดังต่อไปนี้
        </p>
        <Link className="btn btn-ghost mt-4" href="/">
          ← กลับหน้าแรก
        </Link>
      </section>

      <section className="card card-pad space-y-6">
        <h2 className="h2">บริการของเรา</h2>
        <p className="text-slate-700">
          WEBUY HUB ให้บริการรับซื้ออุปกรณ์ไอทีมือสอง เช่น มือถือ โน๊ตบุ๊ค แท็บเล็ต MacBook และอุปกรณ์เสริม โดยประเมินราคาตามสภาพจริงและจ่ายเงินสดทันทีหลังตรวจสภาพ
        </p>

        <h2 className="h2">การประเมินราคา</h2>
        <p className="text-slate-700">
          ราคาที่ประเมินเบื้องต้นเป็นการประมาณการเท่านั้น ราคาจริงอาจแตกต่างตามสภาพเครื่องในวันที่ตรวจ และอุปกรณ์ประกอบที่นำมาด้วย
        </p>

        <h2 className="h2">ข้อตกลงการขาย</h2>
        <p className="text-slate-700">
          การขายถือว่าสมบูรณ์เมื่อทั้งสองฝ่ายตกลงราคาและมีการโอนกรรมสิทธิ์สินค้า เราไม่รับผิดชอบความเสียหายหลังจากผู้ขายได้รับเงินครบถ้วนแล้ว
        </p>

        <h2 className="h2">การเปลี่ยนแปลง</h2>
        <p className="text-slate-700">
          เราอาจแก้ไขเงื่อนไขการใช้งานได้ตามความเหมาะสม การใช้บริการต่อหลังจากมีการเปลี่ยนแปลงถือว่าคุณยอมรับเงื่อนไขฉบับใหม่
        </p>

        <p className="text-sm text-slate-500 mt-8">
          อัปเดตล่าสุด: มกราคม 2026 | ติดต่อ: LINE @webuy
        </p>
      </section>
    </div>
  );
}
