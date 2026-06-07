import { cookies } from 'next/headers';

export const ADMIN_LOCALES = ['fr', 'en', 'he', 'es'] as const;
export type AdminLocale = (typeof ADMIN_LOCALES)[number];

export const ADMIN_LOCALE_COOKIE = 'admin_locale';
export const ADMIN_LOCALE_LABELS: Record<AdminLocale, string> = {
  fr: 'Français',
  en: 'English',
  he: 'עברית',
  es: 'Español'
};

export function isRtl(locale: AdminLocale): boolean {
  return locale === 'he';
}

export function getAdminLocale(): AdminLocale {
  const value = cookies().get(ADMIN_LOCALE_COOKIE)?.value as AdminLocale | undefined;
  return value && ADMIN_LOCALES.includes(value) ? value : 'fr';
}

export async function loadAdminMessages(locale: AdminLocale) {
  return (await import(`../../messages/${locale}.json`)).default;
}
