/**
 * ฟังก์ชันช่วยสำหรับหมวดสินค้า - ดึงจาก devicecategories ใน Hub โดยตรง
 */
export function getCategoriesFromHub(data: any): { slug: string; name: string; count: number }[] {
  const nodes = data?.devicecategories?.nodes ?? [];
  return nodes
    .filter((n: any) => Boolean(n?.slug))
    .map((n: any) => ({
      slug: String(n.slug).trim(),
      name: String(n?.title || n?.name || n.slug).trim(),
      count: 0,
    }))
    .sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name));
}
