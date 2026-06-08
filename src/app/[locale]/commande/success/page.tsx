export const runtime = 'edge';

import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CheckCircle2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface SuccessPageProps {
  params: { locale: string };
  searchParams: { order?: string };
}

export default async function SuccessPage({
  params: { locale },
  searchParams
}: SuccessPageProps) {
  setRequestLocale(locale);
  const t = await getTranslations('checkout');
  const orderNumber = searchParams.order || 'JBL-XXXXXX';

  return (
    <section className="container py-16">
      <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/10 text-gold animate-pulse">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h1 className="mt-6 font-serif text-3xl font-bold text-foreground">{t('success')}</h1>
        <div className="mt-3 inline-block rounded-lg bg-accent px-4 py-1.5 font-mono text-sm font-semibold text-primary">
          {orderNumber}
        </div>
        <p className="mt-5 text-muted-foreground leading-relaxed">{t('successText')}</p>
        <Button asChild variant="gold" className="mt-8 rounded-xl px-8 py-6 text-base shadow-sm hover:shadow-md">
          <Link href="/boutique">{t('backToShop')}</Link>
        </Button>
      </div>
    </section>
  );
}