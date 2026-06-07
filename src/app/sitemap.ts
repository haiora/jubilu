import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.jubilee-israel.org';

const PATHS = [
  '',
  '/a-propos',
  '/mission',
  '/boutique',
  '/boutique/vin-blanc',
  '/boutique/vin-rouge',
  '/boutique/vin-rose',
  '/boutique/parchemins',
  '/temoignages',
  '/actualites',
  '/contact',
  '/faq',
  '/mentions-legales',
  '/confidentialite',
  '/cgv',
  '/cookies'
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const path of PATHS) {
    const languages: Record<string, string> = {};
    for (const locale of routing.locales) {
      languages[locale] = `${BASE_URL}/${locale}${path}`;
    }
    for (const locale of routing.locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority: path === '' ? 1 : 0.7,
        alternates: { languages }
      });
    }
  }

  return entries;
}
