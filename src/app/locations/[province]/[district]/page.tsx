import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchGql, siteUrl } from "@/lib/wp";
import { Q_HUB_INDEX } from "@/lib/queries";
import JsonLd from "@/components/JsonLd";
import { jsonLdBreadcrumb, jsonLdLocalBusiness, jsonLdFaqPage } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/seo";
import { locationTitle, locationDescription, locationH1, locationFaqSeed } from "@/lib/seoLocation";
import { findDistrict, listDistricts } from "@/lib/locations";

export const revalidate = 3600;

export function generateStaticParams() {
  return listDistricts().map((d) => ({
    province: d.provinceSlug,
    district: d.districtSlug!,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { province: string; district: string };
}): Promise<Metadata> {
  const rec = findDistrict(
    String(params?.province ?? "").trim(),
    String(params?.district ?? "").trim()
  );
  if (!rec) return {};
  return pageMetadata({
    title: locationTitle({ province: rec.province, district: rec.district }),
    description: locationDescription({ province: rec.province, district: rec.district }),
    pathname: `/locations/${rec.provinceSlug}/${rec.districtSlug}`,
  });
}

export default async function Page({
  params,
}: {
  params: { province: string; district: string };
}) {
  const provinceSlug = String(params?.province ?? "").trim();
  const districtSlug = String(params?.district ?? "").trim();
  const rec = findDistrict(provinceSlug, districtSlug);
  if (!rec) notFound();

  const index = await fetchGql<any>(Q_HUB_INDEX, undefined, { revalidate });
  const pageUrl = `${siteUrl()}/locations/${rec.provinceSlug}/${rec.districtSlug}`;
  const area = `${rec.district} ${rec.province}`;

  const breadcrumbJson = jsonLdBreadcrumb(pageUrl, [
    { name: "WEBUY HUB", url: `${siteUrl()}/` },
    { name: "พื้นที่บริการ", url: `${siteUrl()}/locations` },
    { name: `รับซื้อโน๊ตบุ๊ค ${rec.province}`, url: `${siteUrl()}/locations/${rec.provinceSlug}` },
    { name: `รับซื้อโน๊ตบุ๊ค ${area}`, url: pageUrl },
  ]);

  const lbJson = jsonLdLocalBusiness(
    {},
    pageUrl,
    { province: rec.province, district: rec.district },
    { enabled: true, ratingValue: 4.9, reviewCount: 128 }
  );

  const faqs = locationFaqSeed(area, true);
  const faqJson = jsonLdFaqPage(pageUrl, faqs.map((f) => ({ title: f.q, answer: f.a })));

  return (
    <div className="space-y-10">
      <JsonLd json={breadcrumbJson} />
      <JsonLd json={lbJson} />
      <JsonLd json={faqJson} />

      <nav className="pt-2 text-sm text-slate-600">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link className="link" href="/">หน้าแรก</Link></li>
          <li className="opacity-60">/</li>
          <li><Link className="link" href="/locations">พื้นที่บริการ</Link></li>
          <li className="opacity-60">/</li>
          <li><Link className="link" href={`/locations/${rec.provinceSlug}`}>{rec.province}</Link></li>
          <li className="opacity-60">/</li>
          <li className="font-semibold text-slate-900">{rec.district}</li>
        </ol>
      </nav>

      <section className="card hero card-pad space-y-4">
        <h1 className="h1">{locationH1({ province: rec.province, district: rec.district })}</h1>
        <p className="lead">{locationDescription({ province: rec.province, district: rec.district })}</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <a className="btn btn-primary" href="https://line.me/R/ti/p/@webuy" target="_blank" rel="noreferrer">แชท LINE @webuy</a>
          <Link className="btn btn-ghost" href={`/locations/${rec.provinceSlug}`}>ดูหน้า {rec.province} →</Link>
          <Link className="btn btn-ghost" href="/categories/notebook">ดูหมวดโน๊ตบุ๊ค →</Link>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="h2">คำถามที่พบบ่อย (รับซื้อโน๊ตบุ๊ค {area})</h2>
        <div className="grid gap-4">
          {faqs.map((f) => (
            <details key={f.q} className="faq">
              <summary>{f.q}</summary>
              <div className="answer">{f.a}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="card-soft p-6">
        <div className="text-base font-extrabold">อยากได้ราคาตรงสภาพจริง?</div>
        <div className="muted mt-1 text-sm">ส่งรูป + สเปค + สภาพ + อุปกรณ์ที่มี/ไม่มี ใน LINE @webuy แล้วทีมงานประเมินให้ทันที</div>
        <div className="mt-4">
          <a className="btn btn-primary" href="https://line.me/R/ti/p/@webuy" target="_blank" rel="noreferrer">ส่งรูปเพื่อประเมินใน LINE</a>
        </div>
      </section>
    </div>
  );
}
