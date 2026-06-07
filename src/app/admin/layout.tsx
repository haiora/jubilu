export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getAdminLocale, loadAdminMessages, isRtl } from '@/lib/admin-i18n';
import '../globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-serif',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Administration · Jubilé',
  robots: { index: false, follow: false }
};

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const locale = getAdminLocale();
  const messages = await loadAdminMessages(locale);
  const dir = isRtl(locale) ? 'rtl' : 'ltr';
  return (
    <html lang={locale} dir={dir} className={`${inter.variable} ${cormorant.variable}`}>
      <body className="bg-muted/40 text-foreground antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
