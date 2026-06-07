'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NewsletterForm() {
  const t = useTranslations('footer');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale })
      });
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <p className="flex items-center gap-2 rounded-full bg-background/95 px-4 py-3 text-sm text-primary">
        <Check className="h-4 w-4 text-secondary" /> {t('newsletterButton')} ✓
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('newsletterPlaceholder')}
        className="h-11 flex-1 rounded-full bg-background px-4 text-sm text-foreground outline-none ring-gold focus:ring-2"
      />
      <Button type="submit" variant="gold" disabled={submitting}>{t('newsletterButton')}</Button>
    </form>
  );
}
