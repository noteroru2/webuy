"use client";
import { useState, useEffect } from "react";
import { BUSINESS_INFO } from "@/lib/constants";

export function FloatingLineButton() {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Hide on very small screens when scrolling
      if (window.innerWidth < 640) {
        setIsVisible(window.scrollY < 100);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    window.addEventListener("resize", toggleVisibility);
    
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
      window.removeEventListener("resize", toggleVisibility);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <a
      href={BUSINESS_INFO.lineUrl}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 left-6 z-50 flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3 text-white shadow-2xl transition-all hover:scale-105 hover:shadow-emerald-500/50 animate-float"
      aria-label={`แชท LINE ${BUSINESS_INFO.line}`}
    >
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
      </svg>
      <span 
        className={`font-bold text-sm whitespace-nowrap transition-all overflow-hidden ${
          isHovered ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0 sm:max-w-[200px] sm:opacity-100'
        }`}
      >
        LINE: {BUSINESS_INFO.line}
      </span>
      <span className="absolute -top-1 -right-1 flex h-5 w-5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-5 w-5 bg-white items-center justify-center text-xs text-emerald-600 font-bold">!</span>
      </span>
    </a>
  );
}
