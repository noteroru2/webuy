/** ข้อความ EmptyState เมื่อ hub ล้ม vs เมื่อจริงๆ ยังไม่มีรายการ */
export function hubEmptyCopy(
  hubFetchFailed: boolean,
  normal: { title: string; description: string }
): { title: string; description: string } {
  if (hubFetchFailed) {
    return {
      title: "โหลดข้อมูลไม่สำเร็จ",
      description:
        "เชื่อมต่อ WordPress ไม่ได้ชั่วคราว ลองรีเฟรชหรือติดต่อ LINE @webuy — ถ้ายังไม่หาย ให้ตรวจ error ที่เซิร์ฟเวอร์ CMS",
    };
  }
  return normal;
}
