'use client';

import { useTransition } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';

const LOCALES = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'he', label: 'עב' },
  { code: 'es', label: 'ES' }
];

export function AdminLanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setLocale(next: string) {
    if (next === locale) return;
    startTransition(async () => {
      await fetch('/api/admin/locale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: next })
      });
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1 rounded-xl bg-primary-foreground/10 p-1" aria-busy={isPending}>
      <Globe className="mx-1 h-4 w-4 text-primary-foreground/60" />
      {LOCALES.map((l) => (
        <button
          key={l.code}
          onClick={() => setLocale(l.code)}
          className={
            'rounded-lg px-2 py-1 text-xs font-medium transition-colors ' +
            (l.code === locale
              ? 'bg-gold text-gold-foreground'
              : 'text-primary-foreground/70 hover:text-primary-foreground')
          }
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
