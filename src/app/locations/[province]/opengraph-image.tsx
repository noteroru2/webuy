import { fetchGql, siteUrl } from "@/lib/wp";
import { findProvince } from "@/lib/locations";
import { Q_LOCATION_BY_SLUG } from "@/lib/queries";
import { renderOgImage, clampText } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function isPublish(status: any) {
  return String(status || "").toLowerCase() === "publish";
}

export default async function Image({ params }: { params: { province: string } }) {
  const slug = String(params?.province ?? "").trim();
  const url = `${siteUrl()}/locations/${slug}`;
  let title = "พื้นที่บริการ";
  let subtitle = "รับซื้อโน๊ตบุ๊คและอุปกรณ์ไอทีทั่วประเทศ • ประเมินไว • นัดรับถึงที่";

  const rec = findProvince(slug);
  if (rec) {
    title = `รับซื้อโน๊ตบุ๊ค ${rec.province}`;
    subtitle = `พื้นที่บริการรับซื้อในจังหวัด${rec.province} • ประเมินไว • นัดรับถึงที่`;
  } else {
    const data = await fetchGql<any>(Q_LOCATION_BY_SLUG, { slug }, { revalidate: 3600 });
    const loc = data?.locationpage;
    if (loc && isPublish(loc?.status)) {
      title = loc.title || title;
      const area = [loc.province, loc.district].filter(Boolean).join(" ");
      subtitle = area ? `พื้นที่บริการ ${area} • ประเมินไว • นัดรับถึงที่` : subtitle;
    }
  }

  return renderOgImage(clampText(title, 70), clampText(subtitle, 180), {
    label: "พื้นที่บริการ",
    chips: ["รับซื้อโน๊ตบุ๊ค", "จังหวัด", "นัดรับถึงที่"],
    footerLeft: url,
    footerRight: "ประเมินไว • นัดรับถึงที่ • จ่ายทันที",
  });
}
