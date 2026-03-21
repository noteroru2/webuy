/**
 * แสดงช่วง/ตัวเลขราคาจาก node pricemodel
 * ฟิลด์ `price` (Pods) บางเวอร์ชันทำให้ WPGraphQL error — query จึงไม่ดึง `price` ชั่วคราว
 */
export function priceRangeLabel(p: any): string {
  if (!p) return "";
  const min = p.buyPriceMin;
  const max = p.buyPriceMax;
  if (min != null && max != null) return `${min}-${max}`;
  if (p.price != null && !Number.isNaN(Number(p.price))) {
    return Number(p.price).toLocaleString("th-TH");
  }
  return "";
}

/** ข้อความสั้นสำหรับ meta description (มีคำนำหน้าเป็นภาษาไทย) */
export function priceMetaPhrase(p: any): string {
  const label = priceRangeLabel(p);
  if (!label) return "";
  return label.includes("-")
    ? `ช่วงรับซื้อประมาณ ${label} บาท`
    : `ราคาอ้างอิงประมาณ ${label} บาท`;
}

/** บรรทัดเดียวสำหรับ OG image chip */
export function ogPriceLine(p: any): string {
  const label = priceRangeLabel(p);
  return label ? `${label} บาท` : "ช่วงราคารับซื้อโดยประมาณ";
}
