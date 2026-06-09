import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/site/page-hero';
import { ContactForm } from '@/components/site/contact-form';
import { routing } from '@/i18n/routing';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'pages.contact' });
  return { title: t('title'), description: t('subtitle') };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function ContactPage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations('pages.contact');

  return (
    <>
      <PageHero badge={t('badge')} title={t('title')} subtitle={t('subtitle')} />
      <section className="container py-16">
        <div className="mx-auto max-w-2xl">
          <ContactForm />
        </div>
      </section>
    </>
  );
}