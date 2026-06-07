'use client';

import { useTranslations } from 'next-intl';
import { Home } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const t = useTranslations('common');
  return (
    <section className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-serif text-7xl font-semibold text-gold">404</p>
      <div className="ornament my-6" aria-hidden>✦</div>
      <h1 className="text-3xl font-semibold">{t('notFoundTitle')}</h1>
      <p className="mt-3 max-w-md text-muted-foreground">{t('notFoundText')}</p>
      <Button asChild variant="gold" size="lg" className="mt-8">
        <Link href="/"><Home className="h-4 w-4" /> {t('backHome')}</Link>
      </Button>
    </section>
  );
}
