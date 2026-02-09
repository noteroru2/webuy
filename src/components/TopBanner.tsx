"use client";
import { useState, useEffect } from "react";
import { BUSINESS_INFO } from "@/lib/constants";

export function TopBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check if user already dismissed
    const dismissed = localStorage.getItem("topBannerDismissed");
    if (dismissed === "true") {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("topBannerDismissed", "true");
  };

  if (!isMounted || !isVisible) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 animate-slideIn">
      {/* Animated background pattern (pure CSS) */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M0 0h20v20H0V0zm20 20h20v20H20V20z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Floating circles (pure CSS) */}
      <div className="absolute top-1/2 left-10 h-20 w-20 rounded-full bg-white/10 blur-xl animate-float" />
      <div className="absolute top-1/2 right-20 h-32 w-32 rounded-full bg-white/10 blur-2xl animate-float" style={{ animationDelay: '1s' }} />

      <div className="wrap relative">
        <div className="flex items-center justify-between gap-4 py-3 sm:py-4">
          <div className="flex flex-1 items-center gap-3 sm:gap-6">
            {/* LINE Icon (inline SVG - no image load) */}
            <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-lg">
              <svg className="h-7 w-7 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 text-white">
                <span className="text-lg sm:text-xl font-extrabold">💬 แอดไลน์เลย!</span>
                <span className="hidden sm:inline-block rounded-full bg-white/20 backdrop-blur px-3 py-1 text-xs font-bold animate-pulse">
                  ตอบภายใน 5 นาที
                </span>
              </div>
              <div className="text-xs sm:text-sm text-white/90 mt-0.5">
                <span className="font-bold text-base sm:text-lg">LINE: {BUSINESS_INFO.line}</span> 
                <span className="hidden sm:inline"> • ประเมินราคาฟรี • รับซื้อถึงที่ • จ่ายทันที</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* CTA Button */}
            <a
              href={BUSINESS_INFO.lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-emerald-600 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              <span className="hidden sm:inline">เพิ่มเพื่อน</span>
              <span className="sm:hidden">แอด</span>
            </a>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur text-white hover:bg-white/30 transition-colors"
              aria-label="ปิดแบนเนอร์"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
