# วิเคราะห์ SEO / AEO / AI สำหรับ WEBUY HUB

> เป้าหมาย: อันดับ 1 ในแต่ละ keyword ที่เกี่ยวข้องกับ "รับซื้ออุปกรณ์ไอที"

---

## 1. สถานะปัจจุบัน (หลังแก้ไข)

### SEO (Search Engine Optimization)
| หัวข้อ | สถานะ | หมายเหตุ |
|--------|--------|----------|
| H1 ตรงกับเนื้อหา | ✅ | หน้าแรกใช้ "รับซื้ออุปกรณ์ไอทีถึงบ้าน" |
| Meta description | ✅ | มี keywords หลัก: รับซื้อโน๊ตบุ๊ค MacBook PC |
| Internal linking | ✅ | หมวด ↔ บริการ ↔ พื้นที่ ↔ ราคา เชื่อมกัน |
| Structured data (JSON-LD) | ✅ | Organization, WebSite, HowTo |
| Mobile-friendly | ✅ | Responsive design |
| ความเร็วโหลด | ⚠️ | ใช้ static generation ควรเร็ว; ตรวจสอบ Core Web Vitals |

### AEO (Answer Engine Optimization)
| หัวข้อ | สถานะ | หมายเหตุ |
|--------|--------|----------|
| FAQ Schema | ⚠️ | บางหน้ามี; เพิ่มในหมวด/บริการที่สำคัญ |
| คำถามที่ตรงกับ “People Also Ask” | ⚠️ | ใช้คำถามแบบธรรมชาติใน FAQ |
| Featured snippet ready | ⚠️ | ย่อหน้าสั้นชัด (< 60 คำ) สำหรับคำตอบหลัก |

### AI Readiness (ChatGPT, Perplexity, Gemini)
| หัวข้อ | สถานะ | หมายเหตุ |
|--------|--------|----------|
| เนื้อหาชัดเจน มีโครงสร้าง | ✅ | H1, H2, lists |
| ตอบคำถามตรงๆ | ✅ | บริการ พื้นที่ ราคา วิธีติดต่อ |
| Schema ช่วย AI เข้าใจ | ✅ | JSON-LD Organization, HowTo |

---

## 2. Keywords หลักที่ควรโฟกัส (อันดับ 1)

| Keyword | ปริมาณค้นหา (โดยประมาณ) | ความยาก | หน้าหลักที่ใช้ |
|---------|---------------------------|---------|----------------|
| รับซื้อโน๊ตบุ๊ค | สูง | ปานกลาง | หน้าแรก, หมวด notebook |
| รับซื้อ MacBook | สูง | ปานกลาง | services/buy-macbook |
| รับซื้อ iPhone | สูงมาก | สูง | services/buy-iphone |
| รับซื้อมือถือ | สูง | ปานกลาง | หมวด mobile |
| รับซื้อโน๊ตบุ๊ค + [จังหวัด] | ปานกลาง | ต่ำ | locations/[province] |
| ราคารับซื้อ [รุ่น] | ปานกลาง | ต่ำ–ปานกลาง | prices/[slug] |

---

## 3. แนวทางเพื่อไปอันดับ 1

### 3.1 On-Page SEO
- [ ] **Title tag**: ใส่ keyword หลัก + จังหวัด (สำหรับหน้า location)
- [ ] **Meta description**: สร้างให้ต่างกันในแต่ละหน้า เน้น CTA (LINE, ประเมินฟรี)
- [ ] **H1  unique**: แต่ละหน้าต้องมี H1 ไม่ซ้ำ และสอดคล้องกับเนื้อหา
- [ ] **Content length**: หน้า location/service อย่างน้อย 300–500 คำ (มี content จาก WP แล้ว)

### 3.2 Technical SEO
- [ ] Sitemap มีทุก URL ที่ต้องการ index
- [ ] Robots.txt ไม่บล็อกหน้าสำคัญ
- [ ] Canonical URL ชัดเจน
- [ ] Core Web Vitals ผ่านเกณฑ์ (LCP, FID, CLS)

### 3.3 AEO / Featured Snippet
- [ ] เพิ่ม FAQ Schema ในทุกหน้าที่มี FAQ
- [ ] รูปแบบคำตอบ: ย่อหน้าแรก 40–60 คำ ตรงคำถาม
- [ ] Lists (ul/ol) สำหรับขั้นตอนหรือรายการสั้นๆ

### 3.4 AI / LLM Readiness
- [ ] เนื้อหาตอบคำถาม “รับซื้อที่ไหน อย่างไร ราคาเท่าไหร่” โดยตรง
- [ ] ข้อมูลติดต่อ (LINE, เบอร์) ชัดเจน
- [ ] มี Schema (Organization, LocalBusiness) เพื่อให้ AI อ้างอิงได้ถูกต้อง

---

## 4. สรุปและลำดับความสำคัญ

1. **ลำดับแรก**: ตรวจสอบว่าเนื้อหาจาก WordPress แสดงครบในหน้า location/service/price
2. **ลำดับที่สอง**: เพิ่ม FAQ Schema ในหน้าหลัก (หน้าแรก, หมวด, บริการ)
3. **ลำดับที่สาม**: ปรับ title/description ให้ต่างกันและมี keyword ตามหน้า
4. **ลำดับที่สี่**: วัด Core Web Vitals และปรับปรุงความเร็วถ้าจำเป็น

---

*อัปเดตล่าสุด: กุมภาพันธ์ 2025*
