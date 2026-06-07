import { defineRouting } from 'next-intl/routing';

export const locales = ['fr', 'en', 'he', 'es'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'fr';

export const localeLabels: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  he: 'עברית',
  es: 'Español'
};

export const rtlLocales: Locale[] = ['he'];

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always'
});
