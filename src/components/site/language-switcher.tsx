'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { Globe, Check } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, localeLabels, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function onSelect(next: Locale) {
    setOpen(false);
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm hover:bg-accent"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase">{locale}</span>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute end-0 z-50 mt-2 w-40 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
        >
          {locales.map((l) => (
            <li key={l}>
              <button
                type="button"
                onClick={() => onSelect(l)}
                className={cn(
                  'flex w-full items-center justify-between px-4 py-2.5 text-sm hover:bg-accent',
                  l === locale && 'font-medium text-primary'
                )}
              >
                {localeLabels[l]}
                {l === locale && <Check className="h-4 w-4" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
