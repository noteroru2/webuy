"use client";
import Link from "next/link";
import { useState } from "react";
import { BUSINESS_INFO } from "@/lib/constants";

export function SiteHeader({ brand = "WEBUY HUB" }: { brand?: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="wrap flex h-16 items-center justify-between">
        {/* LOGO / BRAND */}
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-white grid place-items-center font-extrabold shadow-sm">
            W
          </div>
          <div className="leading-tight">
            <div className="text-sm font-extrabold tracking-tight sm:text-base">
              {brand}
            </div>
            <div className="text-[11px] text-slate-500">
              ประเมินไว • นัดรับถึงที่ • จ่ายทันที
            </div>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            className="text-sm font-semibold text-slate-600 transition hover:text-slate-900"
            href="/"
          >
            หน้าแรก
          </Link>
          <Link
            className="text-sm font-semibold text-slate-600 transition hover:text-slate-900"
            href="/categories"
          >
            หมวดสินค้า
          </Link>
          <Link
            className="text-sm font-semibold text-slate-600 transition hover:text-slate-900"
            href="/locations"
          >
            พื้นที่บริการ
          </Link>
          <Link
            className="text-sm font-semibold text-slate-600 transition hover:text-slate-900"
            href="#contact"
          >
            ติดต่อเรา
          </Link>
        </nav>

        {/* CTA + MOBILE MENU BUTTON */}
        <div className="flex items-center gap-2">
          {/* Desktop CTA - LINE Emphasized */}
          <a
            className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:shadow-lg hover:scale-105"
            href={BUSINESS_INFO.lineUrl}
            target="_blank"
            rel="noreferrer"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
            </svg>
            <span className="text-base">LINE: {BUSINESS_INFO.line}</span>
          </a>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="เปิดเมนู"
          >
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <nav className="wrap flex flex-col py-4">
            <Link
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 rounded-lg"
              href="/"
            >
              <span>🏠</span>
              หน้าแรก
            </Link>
            <Link
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 rounded-lg"
              href="/categories"
            >
              <span>📦</span>
              หมวดสินค้า
            </Link>
            <Link
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 rounded-lg"
              href="/locations"
            >
              <span>📍</span>
              พื้นที่บริการ
            </Link>
            <a
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 rounded-lg"
              href="#contact"
            >
              <span>📞</span>
              ติดต่อเรา
            </a>
            <a
              className="mt-4 mx-4 inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 text-base font-bold text-white shadow-lg hover:shadow-xl transition-all"
              href={BUSINESS_INFO.lineUrl}
              target="_blank"
              rel="noreferrer"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              <span className="text-lg">💬 LINE: {BUSINESS_INFO.line}</span>
            </a>
          </nav>
        </div>
      )}

      {/* accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600" />
    </header>
  );
}
