'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Cookie } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

const KEY = 'jbl_cookie_consent';

export function CookieConsent() {
  const t = useTranslations('common');
  const tf = useTranslations('footer');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) setVisible(true);
  }, []);

  function choose(value: 'accepted' | 'declined') {
    localStorage.setItem(KEY, value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-2xl sm:flex-row sm:items-center">
        <Cookie className="h-6 w-6 shrink-0 text-gold" />
        <p className="flex-1 text-sm text-muted-foreground">
          {t('cookieText')}{' '}
          <Link href="/cookies" className="underline hover:text-primary">{tf('cookies')}</Link>
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => choose('declined')}>{t('cookieDecline')}</Button>
          <Button size="sm" variant="gold" onClick={() => choose('accepted')}>{t('cookieAccept')}</Button>
        </div>
      </div>
    </div>
  );
}
