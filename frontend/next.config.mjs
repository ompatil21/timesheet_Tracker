/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';

const securityHeaders = [
  // Force HTTPS: browsers that have visited once will refuse plain http for 2 years.
  // Production only, so localhost over http keeps working.
  ...(isProd
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
    : []),
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig = {
  poweredByHeader: false,
  compress: true,
  images: { formats: ['image/avif', 'image/webp'] },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
