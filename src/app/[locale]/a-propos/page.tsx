import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { HeartHandshake, Sparkles, Gem } from 'lucide-react';
import { PageHero } from '@/components/site/page-hero';
import { routing } from '@/i18n/routing';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'pages.about' });
  return { title: t('title'), description: t('subtitle') };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function AboutPage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations('pages.about');
  const paragraphs = t.raw('paragraphs') as string[];
  const values = t.raw('values') as { title: string; text: string }[];
  const icons = [HeartHandshake, Gem, Sparkles];

  return (
    <>
      <PageHero badge={t('badge')} title={t('title')} subtitle={t('subtitle')} />

      <section className="container py-16">
        <div className="container-prose space-y-6">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-lg leading-relaxed text-foreground/90">{p}</p>
          ))}
          <p className="verse mt-8 text-center text-xl text-secondary">{t('verse')}</p>
        </div>
        
        <div className="relative mx-auto mt-16 aspect-[21/9] max-w-5xl overflow-hidden rounded-3xl border border-border">
          <Image src="/images/mission-planting.png" alt={t('title')} fill className="object-cover" />
        </div>
      </section>

      <section className="bg-accent/40 py-16">
        <div className="container">
          <h2 className="text-center text-3xl font-semibold">{t('valuesTitle')}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {values.map((v, i) => {
              const Icon = icons[i] ?? Sparkles;
              return (
                <div key={i} className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
                  <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-semibold">{v.title}</h3>
                  <p className="mt-2 text-muted-foreground">{v.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}