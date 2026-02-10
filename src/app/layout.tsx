// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { TopBanner } from "@/components/TopBanner";
import { LineBanner } from "@/components/LineBanner";
import { FloatingLineButton } from "@/components/FloatingLineButton";
import { baseMetadata } from "@/lib/seo";
import { BUSINESS_INFO } from "@/lib/constants";

export const metadata: Metadata = baseMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://line.me" />
        <link rel="dns-prefetch" href="https://line.me" />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <TopBanner />
        <SiteHeader brand="WEBUY HUB" />
        <LineBanner />

        <main className="wrap page">{children}</main>

        <FloatingLineButton />

        {/* CONTACT SECTION */}
        <section id="contact" className="border-t border-slate-200 bg-gradient-to-b from-white to-slate-50 py-12">
          <div className="wrap">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="h2">ติดต่อเรา</h2>
              <p className="muted mt-2 text-sm">
                พร้อมให้บริการประเมินราคา • นัดรับถึงที่ • จ่ายเงินทันที
              </p>

              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                {/* LINE - HIGHLIGHTED */}
                <a
                  href={BUSINESS_INFO.lineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card overflow-hidden relative transition hover:shadow-xl group border-2 border-emerald-400"
                >
                  {/* Badge "แนะนำ" */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="inline-block rounded-full bg-emerald-500 px-2 py-1 text-[10px] font-bold text-white shadow-lg animate-pulse">
                      แนะนำ
                    </span>
                  </div>
                  
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 opacity-70" />
                  
                  <div className="relative p-6 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                      <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                      </svg>
                    </div>
                    <div className="mt-4 text-base font-extrabold text-slate-900">💬 LINE Official</div>
                    <div className="mt-2 text-2xl text-emerald-600 font-extrabold">{BUSINESS_INFO.line}</div>
                    <div className="mt-2 inline-block rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
                      ตอบภายใน 5 นาที
                    </div>
                  </div>
                </a>

                {/* PHONE */}
                <a
                  href={BUSINESS_INFO.phoneHref}
                  className="card p-6 text-center transition hover:shadow-md group"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-sm font-extrabold">โทรสอบถาม</div>
                  <div className="mt-1 text-base text-blue-600 font-bold">{BUSINESS_INFO.phone}</div>
                  <div className="mt-2 text-xs text-slate-600">{BUSINESS_INFO.hours}</div>
                </a>

                {/* LOCATION */}
                <div className="card p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-sm font-extrabold">{BUSINESS_INFO.name}</div>
                  <div className="mt-1 text-sm text-orange-600 font-semibold">{BUSINESS_INFO.address.province}</div>
                  <div className="mt-2 text-xs text-slate-600">นัดรับถึงที่ทั่วประเทศ</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-slate-200 bg-white">
          <div className="wrap py-12">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {/* BRAND */}
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-white grid place-items-center text-sm font-extrabold">
                    W
                  </div>
                  <div className="font-extrabold">WEBUY HUB</div>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  รับซื้ออุปกรณ์ไอทีถึงบ้าน<br />
                  ประเมินไว • นัดรับถึงที่ • จ่ายทันที
                </p>
              </div>

              {/* QUICK LINKS */}
              <div>
                <div className="text-sm font-extrabold">ลิงก์ด่วน</div>
                <ul className="mt-3 space-y-2 text-sm">
                  <li><a href="/" className="text-slate-600 hover:text-slate-900">หน้าแรก</a></li>
                  <li><a href="/categories" className="text-slate-600 hover:text-slate-900">สินค้าที่รับซื้อ</a></li>
                  <li><a href="/locations" className="text-slate-600 hover:text-slate-900">พื้นที่พร้อมให้บริการ</a></li>
                  <li><a href="/categories/notebook" className="text-slate-600 hover:text-slate-900">รับซื้อโน๊ตบุ๊ค</a></li>
                </ul>
              </div>

              {/* SERVICES */}
              <div>
                <div className="text-sm font-extrabold">บริการ</div>
                <ul className="mt-3 space-y-2 text-sm">
                  <li><span className="text-slate-600">รับซื้อ Notebook</span></li>
                  <li><span className="text-slate-600">รับซื้อ MacBook</span></li>
                  <li><span className="text-slate-600">รับซื้อ PC</span></li>
                  <li><span className="text-slate-600">รับซื้ออุปกรณ์ไอที</span></li>
                </ul>
              </div>

              {/* CONTACT */}
              <div>
                <div className="text-sm font-extrabold">ติดต่อเรา</div>
                <ul className="mt-3 space-y-3 text-sm">
                  <li>
                    <a 
                      href={BUSINESS_INFO.lineUrl} 
                      target="_blank" 
                      rel="noopener" 
                      className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold group"
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform">💬</span>
                      <span>LINE: <span className="text-lg">{BUSINESS_INFO.line}</span></span>
                    </a>
                  </li>
                  <li className="flex items-center gap-2 text-slate-600">
                    <span>📞</span>
                    <a href={BUSINESS_INFO.phoneHref} className="hover:text-slate-900">{BUSINESS_INFO.phone}</a>
                  </li>
                  <li className="flex items-center gap-2 text-slate-600">
                    <span>🕐</span>
                    <span>{BUSINESS_INFO.hours}</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-600 text-xs">
                    <span>📍</span>
                    <span className="leading-relaxed">{BUSINESS_INFO.address.full}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* BOTTOM */}
            <div className="mt-12 flex flex-col gap-4 border-t border-slate-200 pt-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div>© {new Date().getFullYear()} {BUSINESS_INFO.legalName}</div>
                <div className="text-xs mt-1">{BUSINESS_INFO.name} - รับซื้ออุปกรณ์ไอที</div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <a href="#" className="hover:text-slate-900">นโยบายความเป็นส่วนตัว</a>
                <a href="#" className="hover:text-slate-900">เงื่อนไขการใช้งาน</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
