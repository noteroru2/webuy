import { notFound } from "next/navigation";

/** หน้า district ใช้เฉพาะ WP — ตอนนี้ WP มีแค่ระดับจังหวัด จึง 404 ทุก URL แบบ province/district */
export function generateStaticParams() {
  return [];
}

export default async function Page() {
  notFound();
}
