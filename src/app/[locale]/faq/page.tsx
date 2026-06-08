import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ChevronDown } from 'lucide-react';
import { PageHero } from '@/components/site/page-hero';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function FaqPage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations('pages.faq');
  const items = t.raw('items') as { q: string; a: string }[];

  return (
    <>
      <PageHero badge={t('badge')} title={t('title')} subtitle={t('subtitle')} />
      <section className="container py-16">
        <div className="mx-auto max-w-3xl space-y-3">
          {items.map((item, i) => (
            <details key={i} className="group rounded-2xl border border-border bg-card p-5 shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {item.q}
                <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}