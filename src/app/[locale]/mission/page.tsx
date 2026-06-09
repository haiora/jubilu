import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { Landmark, MapPin, Droplets } from 'lucide-react';
import { PageHero } from '@/components/site/page-hero';
import { routing } from '@/i18n/routing';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'pages.mission' });
  return { title: t('title'), description: t('subtitle') };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function MissionPage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations('pages.mission');
  const projects = t.raw('projects') as { title: string; text: string }[];
  const icons = [Landmark, MapPin, Droplets];

  return (
    <>
      <PageHero badge={t('badge')} title={t('title')} subtitle={t('subtitle')} />

      <section className="container py-16">
        <p className="container-prose text-center text-lg text-muted-foreground">{t('intro')}</p>

        <div className="relative mt-12 aspect-[21/9] overflow-hidden rounded-3xl border border-border">
          <Image src="/images/mission-planting.png" alt={t('title')} fill className="object-cover" />
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {projects.map((p, i) => {
            const Icon = icons[i] ?? Landmark;
            return (
              <article key={i} className="flex flex-col rounded-2xl border border-border bg-card p-8 shadow-sm">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary">
                  <Icon className="h-7 w-7" />
                </div>
                <h2 className="text-xl font-semibold">{p.title}</h2>
                <p className="mt-3 text-muted-foreground">{p.text}</p>
              </article>
            );
          })}
        </div>

        <p className="verse mt-12 text-center text-xl text-secondary">{t('verse')}</p>
      </section>
    </>
  );
}