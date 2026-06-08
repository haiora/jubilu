export const runtime = 'edge';

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, MailX } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

type State = 'processing' | 'done' | 'error';

export default function UnsubscribePage() {
  return (
    <Suspense fallback={null}>
      <UnsubscribeInner />
    </Suspense>
  );
}

function UnsubscribeInner() {
  const t = useTranslations('unsubscribe');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [state, setState] = useState<State>('processing');

  useEffect(() => {
    if (!token) {
      setState('error');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/newsletter/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        if (!cancelled) setState(res.ok ? 'done' : 'error');
      } catch {
        if (!cancelled) setState('error');
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <section className="container py-20">
      <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-primary">
          <MailX className="h-8 w-8" />
        </div>
        <h1 className="font-serif text-2xl font-semibold">{t('title')}</h1>

        {state === 'processing' && (
          <p className="mt-4 flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> {t('processing')}
          </p>
        )}

        {state === 'done' && (
          <>
            <p className="mt-4 flex items-center gap-2 font-medium text-green-700">
              <CheckCircle2 className="h-5 w-5" /> {t('done')}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{t('doneText')}</p>
          </>
        )}

        {state === 'error' && (
          <p className="mt-4 flex items-center gap-2 font-medium text-red-600">
            <XCircle className="h-5 w-5" /> {t('error')}
          </p>
        )}

        <Button asChild variant="gold" className="mt-8">
          <Link href="/">{t('backHome')}</Link>
        </Button>
      </div>
    </section>
  );
}