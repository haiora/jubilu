export const runtime = 'edge';

import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Wine, ScrollText, ArrowRight } from 'lucide-react';
import { PageHero } from '@/components/site/page-hero';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import Image from 'next/image';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function ShopPage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations('pages.shop');
  const home = await getTranslations('home');

  const categories = [
    { 
      href: '/boutique/vin-rouge', 
      title: home('wines.title'), 
      text: home('wines.text'), 
      icon: Wine, 
      image: '/images/wine-red-1.png',
      gradient: 'from-red-900/40 to-black/60' 
    },
    { 
      href: '/boutique/parchemins', 
      title: home('parchments.title'), 
      text: home('parchments.text'), 
      icon: ScrollText, 
      image: '/images/parchment-2.png',
      gradient: 'from-gold/30 to-black/60' 
    }
  ];

  return (
    <>
      <PageHero badge={t('badge')} title={t('title')} subtitle={t('subtitle')} />
      
      <section className="relative py-24 bg-background overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--gold)/0.05),transparent_70%)]" />
        
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <div className="ornament mx-auto mb-6" aria-hidden>✦</div>
            <p className="container-prose text-lg text-muted-foreground">{t('comingSoon')}</p>
          </div>
          
          <div className="mt-12 grid gap-10 md:grid-cols-2 max-w-5xl mx-auto">
            {categories.map((c) => {
              const Icon = c.icon;
              return (
                <Link key={c.href} href={c.href} className="group relative overflow-hidden rounded-[2.5rem] border border-border bg-card shadow-lg transition-all hover:shadow-[0_20px_40px_-15px_hsl(var(--gold)/0.15)] hover:-translate-y-2">
                  <div className="relative h-72 overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-t ${c.gradient} z-10 transition-opacity duration-500 group-hover:opacity-80`} />
                    <Image src={c.image} alt={c.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute top-6 left-6 z-20 flex h-16 w-16 items-center justify-center rounded-2xl glass text-gold shadow-lg backdrop-blur-md">
                      <Icon className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="p-10 bg-card border-t border-border relative z-20">
                    <h2 className="text-3xl font-semibold font-serif text-foreground">{c.title}</h2>
                    <p className="mt-4 text-muted-foreground leading-relaxed">{c.text}</p>
                    <span className="mt-8 inline-flex items-center gap-3 font-medium text-gold uppercase tracking-wider text-sm group-hover:gap-5 transition-all">
                      {home('wines.cta')} <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}