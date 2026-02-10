"use client";
import { BUSINESS_INFO } from "@/lib/constants";

export function LineBanner() {
  return (
    <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 border-y-4 border-emerald-700 shadow-lg">
      <div className="wrap py-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          {/* LINE Icon */}
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-white shadow-xl flex items-center justify-center">
              <svg className="h-8 w-8 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
            </div>
            <div className="text-left">
              <div className="text-white text-sm font-bold uppercase tracking-wide">
                💬 ติดต่อเราทาง LINE
              </div>
              <div className="text-white text-3xl sm:text-4xl font-black tracking-tight">
                @webuy
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block h-12 w-px bg-white/40" />

          {/* CTA Button */}
          <a
            href={BUSINESS_INFO.lineUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-lg font-black text-emerald-600 shadow-2xl transition-all hover:scale-105 hover:shadow-emerald-900/50 active:scale-95"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
            </svg>
            <span className="text-xl">แชทเลย</span>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Sub-text */}
        <div className="mt-3 text-center">
          <p className="text-white text-sm font-semibold">
            ⚡ ส่งรูปมาประเมินราคา • 📍 นัดรับถึงที่ • 💰 จ่ายเงินสดทันที
          </p>
        </div>
      </div>
    </div>
  );
}
