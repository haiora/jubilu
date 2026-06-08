import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { POSTS } from '@/lib/blog';
import { PRODUCTS } from '@/lib/catalog';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.jubilee-israel.org';

const PATHS = [
  { path: '', priority: 1.0, freq: 'weekly' },
  { path: '/a-propos', priority: 0.8, freq: 'monthly' },
  { path: '/mission', priority: 0.9, freq: 'monthly' },
  { path: '/boutique', priority: 0.9, freq: 'weekly' },
  { path: '/boutique/vin-blanc', priority: 0.8, freq: 'weekly' },
  { path: '/boutique/vin-rouge', priority: 0.8, freq: 'weekly' },
  { path: '/boutique/vin-rose', priority: 0.8, freq: 'weekly' },
  { path: '/boutique/parchemins', priority: 0.8, freq: 'weekly' },
  { path: '/temoignages', priority: 0.7, freq: 'monthly' },
  { path: '/actualites', priority: 0.8, freq: 'weekly' },
  { path: '/contact', priority: 0.7, freq: 'monthly' },
  { path: '/faq', priority: 0.6, freq: 'monthly' },
  { path: '/mentions-legales', priority: 0.3, freq: 'yearly' },
  { path: '/confidentialite', priority: 0.3, freq: 'yearly' },
  { path: '/cgv', priority: 0.3, freq: 'yearly' },
  { path: '/cookies', priority: 0.3, freq: 'yearly' }
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Static pages
  for (const { path, priority, freq } of PATHS) {
    const languages: Record<string, string> = {};
    for (const locale of routing.locales) {
      languages[locale] = `${BASE_URL}/${locale}${path}`;
    }
    for (const locale of routing.locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: freq as any,
        priority,
        alternates: { languages }
      });
    }
  }

  // Blog articles
  for (const post of POSTS) {
    const languages: Record<string, string> = {};
    for (const locale of routing.locales) {
      languages[locale] = `${BASE_URL}/${locale}/actualites/${post.slug}`;
    }
    for (const locale of routing.locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/actualites/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'yearly',
        priority: 0.6,
        alternates: { languages }
      });
    }
  }

  // Products
  for (const product of PRODUCTS) {
    const languages: Record<string, string> = {};
    for (const locale of routing.locales) {
      languages[locale] = `${BASE_URL}/${locale}/boutique/${product.category}/${product.slug}`;
    }
    for (const locale of routing.locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/boutique/${product.category}/${product.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: { languages }
      });
    }
  }

  return entries;
}
