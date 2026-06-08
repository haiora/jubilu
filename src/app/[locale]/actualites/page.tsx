export const runtime = 'edge';

import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Newspaper } from 'lucide-react';
import { PageHero } from '@/components/site/page-hero';
import { Link } from '@/i18n/navigation';
import { POSTS } from '@/lib/blog';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function NewsPage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations('pages.news');
  const activeLocale = (['fr', 'en', 'es', 'he'].includes(locale) ? locale : 'fr') as 'fr' | 'en' | 'es' | 'he';

  return (
    <>
      <PageHero badge={t('badge')} title={t('title')} subtitle={t('subtitle')} />
      <section className="container py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {POSTS.map((post) => {
            const translation = post.translations[activeLocale];
            return (
              <Link key={post.slug} href={`/actualites/${post.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
                <div className="flex h-40 items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                  <Newspaper className="h-10 w-10 text-primary/60" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">{post.date}</span>
                  <h2 className="mt-2 text-lg font-semibold leading-snug">{translation.title}</h2>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{translation.excerpt}</p>
                  <span className="mt-4 inline-block text-sm font-medium text-primary">{t('readMore')} →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}