import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Logo } from './logo';
import { NewsletterForm } from './newsletter-form';

export function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_hsl(var(--gold)/0.08),transparent_70%)]" />
      <div className="container relative grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <div className="rounded-xl bg-background/95 p-3 inline-block shadow-sm">
            <Logo />
          </div>
          <p className="text-sm text-primary-foreground/80 leading-relaxed">{t('tagline')}</p>
          <p className="verse text-sm text-gold/90">{t('verse')}</p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-gold">
            {t('explore')}
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/a-propos" className="text-primary-foreground/80 hover:text-gold transition-colors">{nav('about')}</Link></li>
            <li><Link href="/mission" className="text-primary-foreground/80 hover:text-gold transition-colors">{nav('mission')}</Link></li>
            <li><Link href="/temoignages" className="text-primary-foreground/80 hover:text-gold transition-colors">{nav('testimonials')}</Link></li>
            <li><Link href="/actualites" className="text-primary-foreground/80 hover:text-gold transition-colors">{nav('news')}</Link></li>
            <li><Link href="/contact" className="text-primary-foreground/80 hover:text-gold transition-colors">{nav('contact')}</Link></li>
            <li><Link href="/don" className="text-primary-foreground/80 hover:text-gold transition-colors">{nav('donate')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-gold">
            {t('shop')}
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/boutique/vin-blanc" className="text-primary-foreground/80 hover:text-gold transition-colors">{nav('wines')}</Link></li>
            <li><Link href="/boutique/parchemins" className="text-primary-foreground/80 hover:text-gold transition-colors">{nav('parchments')}</Link></li>
            <li><Link href="/faq" className="text-primary-foreground/80 hover:text-gold transition-colors">{nav('faq')}</Link></li>
            <li><Link href="/cgv" className="text-primary-foreground/80 hover:text-gold transition-colors">{t('terms')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-gold">
            {t('newsletterTitle')}
          </h3>
          <p className="mb-3 text-sm text-primary-foreground/80">{t('newsletterText')}</p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="container relative flex flex-col items-center justify-between gap-3 py-6 text-xs text-primary-foreground/60 md:flex-row">
          <p>© {year} Jubilé. {t('rights')}</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/mentions-legales" className="hover:text-gold transition-colors">{t('legal')}</Link>
            <Link href="/confidentialite" className="hover:text-gold transition-colors">{t('privacy')}</Link>
            <Link href="/cgv" className="hover:text-gold transition-colors">{t('terms')}</Link>
            <Link href="/cookies" className="hover:text-gold transition-colors">{t('cookies')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
