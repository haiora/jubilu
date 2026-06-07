import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  ArrowRight,
  Wine,
  ScrollText,
  HeartHandshake,
  Quote,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default async function HomePage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const activeLocale = (['fr', 'en', 'es', 'he'].includes(locale) ? locale : 'fr') as 'fr' | 'en' | 'es' | 'he';

  const stats = [
    { value: '12+', key: 'projects' },
    { value: '8 500+', key: 'supporters' },
    { value: '30', key: 'countries' },
    { value: '10', key: 'years' }
  ] as const;

  const testimonials = [
    { 
      name: 'Marie L.', 
      country: '🇫🇷', 
      translations: {
        fr: 'Un parchemin reçu de Jérusalem, un trésor pour notre famille.',
        en: 'A parchment received from Jerusalem, a treasure for our family.',
        es: 'Un pergamino recibido de Jerusalén, un tesoro para nuestra familia.',
        he: 'מגילה שהתקבله מירושלים, אוצר למשפחתנו.'
      }
    },
    { 
      name: 'David R.', 
      country: '🇺🇸', 
      translations: {
        fr: 'Soutenir Jubilé, c\'est participer à une histoire qui nous dépasse.',
        en: 'Supporting Jubilee means participating in a history that goes beyond us.',
        es: 'Apoyar a Jubileo es participar en una historia que nos supera.',
        he: 'תמיכה ביוּבּל פירושה להשתתף בהיסטוריה שגדולה מאיתנו.'
      }
    },
    { 
      name: 'Sara M.', 
      country: '🇪🇸', 
      translations: {
        fr: 'Les vins sont magnifiques, et la mission encore plus.',
        en: 'The wines are magnificent, and the mission even more so.',
        es: 'Los vinos son magníficos, y la misión aún más.',
        he: 'היינות נפלאים, והשליחות עוד יותר.'
      }
    }
  ];

  return (
    <>
      {/* HERO LUXURY */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-foreground text-primary-foreground">
        {/* Background Layer with Parallax effect */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/hero-jerusalem.png" 
            alt="Jérusalem" 
            fill 
            className="object-cover opacity-30 mix-blend-overlay"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground via-transparent to-foreground/50" />
        </div>

        <div className="container relative z-10 grid gap-12 py-24 lg:grid-cols-2 lg:items-center">
          <div className="animate-fade-up space-y-8 max-w-2xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-gold/30 bg-gold/10 px-5 py-2 text-sm text-gold backdrop-blur-md">
              <Sparkles className="h-4 w-4" />
              <span className="tracking-wide uppercase text-xs font-semibold">{t('hero.badge')}</span>
            </div>
            
            <h1 className="text-5xl font-semibold leading-[1.1] md:text-6xl lg:text-7xl drop-shadow-2xl">
              {t('hero.title')}
            </h1>
            
            <p className="text-xl text-primary-foreground/80 font-light leading-relaxed">
              {t('hero.subtitle')}
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Button asChild size="lg" variant="gold" className="h-14 px-8 text-base shadow-[0_0_40px_-10px_hsl(var(--gold))] hover:shadow-[0_0_60px_-10px_hsl(var(--gold))] transition-all">
                <Link href="/mission">
                  {t('hero.ctaPrimary')} <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base border-white/20 text-white hover:bg-white/10 glass">
                <Link href="/boutique">{t('hero.ctaSecondary')}</Link>
              </Button>
            </div>
          </div>

          {/* Decorative Floating Element */}
          <div className="relative hidden lg:block animate-float">
            <div className="relative aspect-[3/4] w-[400px] ml-auto overflow-hidden rounded-[2rem] border border-gold/30 glass shadow-2xl">
              <Image 
                src="/images/parchment-1.png" 
                alt="Parchemin" 
                fill 
                className="object-cover opacity-90 scale-105 hover:scale-110 transition-transform duration-1000" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
                <p className="verse text-2xl text-gold drop-shadow-md text-balance leading-snug">
                  {t('jerusalem.verse')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO ELEGANTE */}
      <section className="relative py-32 bg-background overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gold/5 blur-[100px] rounded-full" />
        <div className="container relative">
          <div className="mx-auto max-w-4xl text-center">
            <div className="ornament mb-10" aria-hidden>✦</div>
            <h2 className="text-4xl font-semibold md:text-5xl lg:text-6xl text-foreground leading-tight">
              {t('intro.title')}
            </h2>
            <p className="mt-8 text-xl text-muted-foreground leading-relaxed">
              {t('intro.text')}
            </p>
            <p className="verse mt-12 text-2xl text-gold">{t('intro.verse')}</p>
          </div>
        </div>
      </section>

      {/* BOUTIQUE DE LUXE */}
      <section className="py-24 bg-foreground text-primary-foreground relative">
        <div className="container">
          <div className="text-center mb-16">
            <p className="eyebrow mb-4">L&apos;Excellence d&apos;Israël</p>
            <h2 className="text-4xl md:text-5xl font-semibold">Nos Collections</h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2">
            <ProductBlock
              imageSrc="/images/wine-red-1.png"
              icon={<Wine className="h-8 w-8" />}
              title={t('wines.title')}
              text={t('wines.text')}
              cta={t('wines.cta')}
              href="/boutique/vin-rouge"
              gradient="from-red-900/30 to-black/40"
            />
            <ProductBlock
              imageSrc="/images/parchment-2.png"
              icon={<ScrollText className="h-8 w-8" />}
              title={t('parchments.title')}
              text={t('parchments.text')}
              cta={t('parchments.cta')}
              href="/boutique/parchemins"
              gradient="from-gold/20 to-black/40"
            />
          </div>
        </div>
      </section>

      {/* MISSION & IMPACT */}
      <section className="py-32 bg-background relative">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-8">
              <p className="eyebrow">Notre Mission</p>
              <h2 className="text-4xl md:text-5xl font-semibold leading-tight">
                {t('mission.title')}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('mission.text')}
              </p>
              <Button asChild variant="outline" size="lg" className="h-12 px-6 rounded-full border-gold text-gold hover:bg-gold hover:text-gold-foreground transition-all">
                <Link href="/mission">{t('mission.cta')} <ChevronRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {stats.map((s, i) => (
                <div key={s.key} className={`card-elevated p-8 text-center ${i % 2 === 1 ? 'lg:translate-y-8' : ''}`}>
                  <div className="font-serif text-5xl font-semibold text-gold mb-2">{s.value}</div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {t(`impact.stats.${s.key}`)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TEMOIGNAGES */}
      <section className="py-32 bg-accent/30">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-4xl font-semibold md:text-5xl">{t('testimonials.title')}</h2>
            <p className="mt-6 text-lg text-muted-foreground">{t('testimonials.text')}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((item) => (
              <figure key={item.name} className="card-elevated bg-card/60 p-8">
                <Quote className="h-8 w-8 text-gold/50 mb-6" />
                <blockquote className="text-lg text-foreground/90 italic leading-relaxed">&ldquo;{item.translations[activeLocale]}&rdquo;</blockquote>
                <figcaption className="mt-8 flex items-center gap-3">
                  <span className="text-2xl">{item.country}</span>
                  <span className="font-semibold text-foreground">{item.name}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL PARALLAX */}
      <section className="relative py-40 overflow-hidden text-center text-primary-foreground">
        <Image src="/images/mission-planting.png" alt="Mission" fill className="object-cover opacity-40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-foreground/80 backdrop-blur-sm" />
        
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl glass rounded-3xl p-12 lg:p-20 border-white/10">
            <h2 className="text-4xl font-semibold md:text-5xl lg:text-6xl mb-6">{t('finalCta.title')}</h2>
            <p className="text-xl text-primary-foreground/80 font-light mb-10">
              {t('finalCta.text')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" variant="gold" className="h-14 px-8 text-lg shadow-[0_0_30px_-10px_hsl(var(--gold))]">
                <Link href="/mission">{t('finalCta.ctaPrimary')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ProductBlock({
  imageSrc,
  icon,
  title,
  text,
  cta,
  href,
  gradient
}: {
  imageSrc?: string;
  icon: React.ReactNode;
  title: string;
  text: string;
  cta: string;
  href: string;
  gradient: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/20 glass transition-all hover:border-gold/50">
      <div className="relative h-80 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-t ${gradient} z-10 transition-opacity group-hover:opacity-80`} />
        {imageSrc ? (
          <Image 
            src={imageSrc} 
            alt={title} 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        ) : null}
        <div className="absolute top-6 left-6 z-20 flex h-16 w-16 items-center justify-center rounded-2xl glass text-gold shadow-lg">
          {icon}
        </div>
      </div>
      <div className="p-10 relative z-20 -mt-10 bg-foreground/80 backdrop-blur-xl border-t border-white/10">
        <h3 className="text-3xl font-semibold text-white">{title}</h3>
        <p className="mt-4 text-white/70 leading-relaxed text-lg">{text}</p>
        <Link 
          href={href}
          className="mt-8 inline-flex items-center gap-3 text-gold font-medium uppercase tracking-wider text-sm hover:gap-5 transition-all"
        >
          {cta} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
