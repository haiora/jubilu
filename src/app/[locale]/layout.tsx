import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import { routing, rtlLocales, type Locale } from '@/i18n/routing';
import { Header } from '@/components/site/header';
import { Footer } from '@/components/site/footer';
import { CartProvider } from '@/components/shop/cart-context';
import { CookieConsent } from '@/components/site/cookie-consent';
import { ScrollToTop } from '@/components/site/scroll-to-top';
import { Toaster } from '@/components/ui/toaster';
import '../globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap'
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'meta' });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.jubilee-israel.org';
  const ogLocale: Record<string, string> = { fr: 'fr_FR', en: 'en_US', he: 'he_IL', es: 'es_ES' };
  return {
    metadataBase: new URL(siteUrl),
    title: { default: t('title'), template: '%s · Jubilé' },
    description: t('description'),
    icons: {
      icon: '/icons/favicon.svg',
      apple: '/icons/favicon.svg'
    },
    manifest: '/icons/manifest.json',
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${siteUrl}/${params.locale}`,
      siteName: 'Jubilé',
      locale: ogLocale[params.locale] ?? 'fr_FR',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description')
    },
    alternates: {
      canonical: `${siteUrl}/${params.locale}`,
      languages: {
        fr: `${siteUrl}/fr`,
        en: `${siteUrl}/en`,
        es: `${siteUrl}/es`,
        he: `${siteUrl}/he`
      }
    }
  };
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = rtlLocales.includes(locale as Locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className={`${inter.variable} ${cormorant.variable}`}>
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider messages={messages}>
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <CookieConsent />
            <Footer />
            <ScrollToTop />
            <Toaster />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
