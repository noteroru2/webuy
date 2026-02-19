// src/lib/seoLocation.ts
function areaText(province: string, district?: string) {
  return district ? `${district} ${province}` : province;
}

export function locationTitle(args: { province: string; district?: string }) {
  const area = areaText(args.province, args.district);
  return `รับซื้อโน๊ตบุ๊ค ${area} • ประเมินไว • นัดรับถึงที่`;
}

export function locationH1(args: { province: string; district?: string }) {
  const area = areaText(args.province, args.district);
  return `รับซื้อโน๊ตบุ๊ค ${area}`;
}

export function locationDescription(args: { province: string; district?: string }) {
  const area = areaText(args.province, args.district);
  return `รับซื้อโน๊ตบุ๊คในพื้นที่ ${area} ประเมินไวผ่าน LINE @webuy นัดรับถึงที่ จ่ายทันที (เงินสด/โอน) รองรับ Windows/MacBook/เกมมิ่งโน๊ตบุ๊ค ตามสภาพจริง`;
}

export function locationIntroBullets() {
  return [
    "รับซื้อโน๊ตบุ๊คทุกแบรนด์ (Acer/Asus/Lenovo/HP/Dell/MSI/Apple)",
    "ประเมินไว: ส่งรูป + สเปค + สภาพ ทาง LINE",
    "นัดรับถึงที่ในพื้นที่บริการ และจ่ายทันทีหลังตรวจเช็ค",
    "ให้ราคาตามสภาพจริง (อุปกรณ์/แบต/จอ/คีย์บอร์ด/ประกัน)",
  ];
}

/** FAQ seed สำหรับพื้นที่จังหวัด/อำเภอ (6–10 ข้อ, คีย์เวิร์ดค้นหา) */
export function locationFaqSeed(area: string, isDistrict = false): { q: string; a: string }[] {
  const base = [
    {
      q: `รับซื้อโน๊ตบุ๊ค ${area} ถึงบ้านไหม?`,
      a: `ได้ครับ นัดรับถึงที่ในพื้นที่ ${area} หรือสะดวกนำมาหน้าร้านก็ได้ ส่งโลเคชัน+รูปเครื่องใน LINE @webuy เพื่อเช็คคิวรับสินค้า`,
    },
    {
      q: `รับซื้อโน๊ตบุ๊ค ${area} ราคาเท่าไหร่?`,
      a: `ราคาขึ้นอยู่กับรุ่น/สเปค/สภาพ/แบตเตอรี่/จอ/อุปกรณ์ประกอบ ส่งรูปและสเปคใน LINE @webuy เพื่อประเมินราคาให้ตามสภาพจริง`,
    },
    {
      q: "ต้องเตรียมอะไรบ้างก่อนขายโน๊ตบุ๊ค?",
      a: "แนะนำสำรองข้อมูล ออกจากระบบ iCloud/Windows account ปิด Find My (กรณี MacBook) และเตรียมอะแดปเตอร์/กล่อง/ใบเสร็จ (ถ้ามี) เพื่อช่วยประเมินราคาได้ดีขึ้น",
    },
    {
      q: "เครื่องเปิดไม่ติด/จอแตก รับซื้อไหม?",
      a: "รับซื้อครับ แต่ราคาจะอิงตามอาการและมูลค่าชิ้นส่วน ส่งรูป/อาการใน LINE @webuy เพื่อประเมินเบื้องต้นได้",
    },
    {
      q: "รับซื้อ MacBook ไหม?",
      a: "รับซื้อครับ ทั้ง MacBook Air / Pro ทุกรุ่น ราคาอิงสภาพและรุ่น ส่งรูป+สเปคใน LINE @webuy เพื่อประเมิน",
    },
    {
      q: "จ่ายเงินแบบไหน?",
      a: "จ่ายเงินสดหรือโอนทันทีหลังตรวจสภาพเรียบร้อย นัดรับถึงที่หรือนำมาหน้าร้านได้",
    },
    {
      q: "ใช้เวลาประเมินราคานานไหม?",
      a: "ส่งรูปและสเปคใน LINE @webuy โดยปกติตอบกลับภายในวันทำการ",
    },
  ];

  if (isDistrict) {
    base.push({
      q: `รับซื้อโน๊ตบุ๊ค ${area} ต่างจากจังหวัดยังไง?`,
      a: `บริการเหมือนกันทุกพื้นที่ นัดรับถึงที่ใน ${area} ได้ ส่งโลเคชันใน LINE @webuy เพื่อเช็คคิว`,
    });
  }

  return base.slice(0, 10);
}

/** FAQ seed สำหรับหน้าบริการ (service) — ใช้เมื่อไม่มี FAQ จาก WP หรือเสริมให้ครบ */
export function serviceFaqSeed(serviceTitle: string, _categoryName?: string): { q: string; a: string }[] {
  return [
    {
      q: `${serviceTitle} ราคาเท่าไหร่?`,
      a: "ราคาขึ้นอยู่กับรุ่น/สเปค/สภาพ ส่งรูปและสเปคใน LINE @webuy เพื่อประเมินราคาให้ตามสภาพจริง ตอบภายใน 5 นาที",
    },
    {
      q: "ต้องเตรียมอะไรบ้างก่อนขาย?",
      a: "แนะนำสำรองข้อมูล ออกจากระบบ (iCloud/บัญชี Windows) ปิด Find My (กรณี Apple) และเตรียมอะแดปเตอร์/กล่อง/ใบเสร็จ (ถ้ามี) เพื่อช่วยประเมินราคาได้ดีขึ้น",
    },
    {
      q: "เครื่องเสีย/จอแตก รับซื้อไหม?",
      a: "รับซื้อครับ ราคาอิงตามอาการและมูลค่าชิ้นส่วน ส่งรูป/อาการใน LINE @webuy เพื่อประเมินเบื้องต้น",
    },
    {
      q: "จ่ายเงินแบบไหน?",
      a: "จ่ายเงินสดหรือโอนทันทีหลังตรวจสภาพเรียบร้อย นัดรับถึงที่หรือนำมาหน้าร้านได้",
    },
    {
      q: "ใช้เวลาประเมินราคานานไหม?",
      a: "ส่งรูปและสเปคใน LINE @webuy โดยปกติตอบกลับภายใน 5 นาที ในวันทำการ",
    },
    {
      q: "รับซื้อถึงบ้านไหม?",
      a: "ได้ครับ นัดรับถึงที่ในพื้นที่บริการ ส่งโลเคชันใน LINE @webuy เพื่อเช็คคิวรับสินค้า",
    },
  ];
}
