import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// Only public pages. The signed-in app pages are noindex and left out.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`,         lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/register`, lastModified: now, changeFrequency: 'yearly',  priority: 0.8 },
    { url: `${SITE_URL}/login`,    lastModified: now, changeFrequency: 'yearly',  priority: 0.5 },
    { url: `${SITE_URL}/privacy`,  lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/terms`,    lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  ];
}
