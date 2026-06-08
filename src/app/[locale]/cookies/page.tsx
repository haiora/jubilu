import { LegalPage } from '@/components/site/legal-page';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default function Page({ params: { locale } }: { params: { locale: string } }) {
  return <LegalPage locale={locale} titleKey="cookiesTitle" />;
}