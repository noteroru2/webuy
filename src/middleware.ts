import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware — ไม่รันบน sitemap.xml และ robots.txt
 * เพื่อให้ Google Search Console ดึงไฟล์ SEO ได้ (แก้ "Couldn't fetch sitemap")
 */
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * ไม่ match: _next, favicon, robots, sitemap*.xml
     * เพื่อไม่ให้ middleware ไปกระทบการดึง sitemap/robots โดย Googlebot
     */
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap[^/]*\\.xml).*)",
  ],
};
