import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "นโยบายความเป็นส่วนตัว | WEBUY HUB",
  description:
    "นโยบายความเป็นส่วนตัวของ WEBUY HUB การเก็บรวบรวม ใช้ และปกป้องข้อมูลส่วนบุคคลของคุณเมื่อใช้บริการรับซื้ออุปกรณ์ไอที",
  pathname: "/privacy-policy",
  type: "website",
});

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-10 py-8">
      <section className="card hero card-pad">
        <h1 className="h1">นโยบายความเป็นส่วนตัว</h1>
        <p className="lead mt-2">
          บริษัท อำพล เทรดดิ้ง จำกัด ให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลของคุณ
        </p>
        <Link className="btn btn-ghost mt-4" href="/">
          ← กลับหน้าแรก
        </Link>
      </section>

      <section className="card card-pad space-y-6">
        <h2 className="h2">การเก็บรวบรวมข้อมูล</h2>
        <p className="text-slate-700">
          เราอาจเก็บรวบรวมข้อมูลที่คุณให้มาเมื่อติดต่อผ่าน LINE หรือช่องทางอื่น เช่น ชื่อ
          เบอร์โทรศัพท์ รูปภาพสินค้า และข้อมูลที่จำเป็นเพื่อการประเมินราคาและให้บริการ
        </p>

        <h2 className="h2">การใช้งานข้อมูล</h2>
        <p className="text-slate-700">
          เราใช้ข้อมูลเพื่อประเมินราคาสินค้า ให้บริการรับซื้อ นัดหมายการรับสินค้า
          และติดต่อคุณตามความจำเป็น เราไม่ขายหรือโอนข้อมูลให้บุคคลภายนอกโดยไม่ได้รับความยินยอม
        </p>

        <h2 className="h2">การเก็บรักษาข้อมูล</h2>
        <p className="text-slate-700">
          เราเก็บรักษาข้อมูลในระบบที่ปลอดภัยตามระยะเวลาที่จำเป็นสำหรับการให้บริการและตามกฎหมายที่เกี่ยวข้อง
        </p>

        <h2 className="h2">สิทธิของคุณ</h2>
        <p className="text-slate-700">
          คุณมีสิทธิขอเข้าถึง แก้ไข หรือลบข้อมูลส่วนบุคคลของคุณได้ โดยติดต่อเราทาง LINE @webuy
        </p>

        <p className="text-sm text-slate-500 mt-8">
          อัปเดตล่าสุด: มกราคม 2026 | ติดต่อ: LINE @webuy
        </p>
      </section>
    </div>
  );
}
