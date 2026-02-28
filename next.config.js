/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel build: หน้ารอ WP ไม่เกิน 120s ต่อหน้า — ใช้ร่วมกับ wp.ts (timeout 8s + fallback บน Vercel)
  staticPageGenerationTimeout: 180,

  // Performance optimizations
  reactStrictMode: true,
  
  // Optimize images (ถ้ามีรูปจาก external domains)
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Compress and optimize
  compress: true,
  
  // Production optimizations
  swcMinify: true,
  
  // Headers for performance + GSC sitemap
  async headers() {
    return [
      {
        source: '/sitemap.xml',
        headers: [
          { key: 'Content-Type', value: 'application/xml; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=3600' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
