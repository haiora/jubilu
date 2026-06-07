import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Logo } from './logo';
import { NewsletterForm } from './newsletter-form';

export function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border bg-primary text-primary-foreground">
      <div className="container grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <div className="rounded-xl bg-background/95 p-3 inline-block">
            <Logo />
          </div>
          <p className="text-sm text-primary-foreground/80">{t('tagline')}</p>
          <p className="verse text-sm text-gold">{t('verse')}</p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gold">
            {t('explore')}
          </h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/a-propos" className="hover:text-gold">{nav('about')}</Link></li>
            <li><Link href="/mission" className="hover:text-gold">{nav('mission')}</Link></li>
            <li><Link href="/temoignages" className="hover:text-gold">{nav('testimonials')}</Link></li>
            <li><Link href="/actualites" className="hover:text-gold">{nav('news')}</Link></li>
            <li><Link href="/contact" className="hover:text-gold">{nav('contact')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gold">
            {t('shop')}
          </h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/boutique/vin-blanc" className="hover:text-gold">{nav('wines')}</Link></li>
            <li><Link href="/boutique/parchemins" className="hover:text-gold">{nav('parchments')}</Link></li>
            <li><Link href="/faq" className="hover:text-gold">{nav('faq')}</Link></li>
            <li><Link href="/cgv" className="hover:text-gold">{t('terms')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gold">
            {t('newsletterTitle')}
          </h3>
          <p className="mb-3 text-sm text-primary-foreground/80">{t('newsletterText')}</p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 text-xs text-primary-foreground/70 md:flex-row">
          <p>© {year} Jubilé. {t('rights')}</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/mentions-legales" className="hover:text-gold">{t('legal')}</Link>
            <Link href="/confidentialite" className="hover:text-gold">{t('privacy')}</Link>
            <Link href="/cgv" className="hover:text-gold">{t('terms')}</Link>
            <Link href="/cookies" className="hover:text-gold">{t('cookies')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
