/** @type {import('next').NextConfig} */
const nextConfig = {
  // ให้ worker มีเวลาสร้าง static page นานขึ้น (default 60s) — ลด build fail จาก timeout ตอน WP ช้า/คืน 500
  staticPageGenerationTimeout: 120,

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
  
  // Headers for performance
  async headers() {
    return [
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
