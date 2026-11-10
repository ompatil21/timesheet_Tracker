// Public origin of the site, used for canonical URLs, the sitemap and social
// previews. Set NEXT_PUBLIC_SITE_URL to override; on Vercel the production
// domain is provided automatically.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')
).replace(/\/$/, '');

export const SITE_NAME = 'Time Tracker';
export const SITE_DESCRIPTION =
  "Log hours as you work, check your payslip against what you actually tracked, and spot pay discrepancies before they cost you.";
