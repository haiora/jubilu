import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Quote } from 'lucide-react';
import { PageHero } from '@/components/site/page-hero';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const TESTIMONIALS = [
  {
    name: 'Marie L.',
    country: '🇫🇷',
    translations: {
      fr: 'Un parchemin reçu de Jérusalem, un trésor pour notre famille. La qualité et le soin sont remarquables.',
      en: 'A parchment received from Jerusalem, a treasure for our family. The quality and care are remarkable.',
      es: 'Un pergamino recibido de Jerusalén, un tesoro para nuestra familia. La calidad y el cuidado son notables.',
      he: 'מגילה שהתקבله מירושלים, אוצר למשפחתנו. האיכות וההקפדה יוצאות מן הכלל.'
    }
  },
  {
    name: 'David R.',
    country: '🇺🇸',
    translations: {
      fr: "Soutenir Jubilé, c'est participer à une histoire qui nous dépasse. Une mission qui a du sens.",
      en: 'Supporting Jubilee means participating in a history that goes beyond us. A mission that makes sense.',
      es: 'Apoyar a Jubileo es participar en una historia que nos supera. Una misión que tiene sentido.',
      he: 'תמיכה ביוּבּל פירושה להשתתף בהיסטוריה שגדולה מאיתנו. שליחות בעלת משמעות.'
    }
  },
  {
    name: 'Sara M.',
    country: '🇪🇸',
    translations: {
      fr: 'Les vins sont magnifiques, et la mission encore plus. Je recommande de tout cœur.',
      en: 'The wines are magnificent, and the mission even more so. I recommend from the bottom of my heart.',
      es: 'Los vinos son magníficos, y la misión aún más. Lo recomiendo de todo corazón.',
      he: 'היינות נפלאים, והשליחות עוד יותר. ממליצה מכל הלב.'
    }
  },
  {
    name: 'Yossi B.',
    country: '🇮🇱',
    translations: {
      fr: 'Un pont sincère entre les peuples. Merci pour votre engagement pour Jérusalem.',
      en: 'A sincere bridge between peoples. Thank you for your commitment to Jerusalem.',
      es: 'Un puente sincero entre los pueblos. Gracias por su compromiso con Jerusalén.',
      he: 'גשר כנה בין העמים. תודה על המחויבות שלכם לירושלים.'
    }
  },
  {
    name: 'Anna K.',
    country: '🇩🇪',
    translations: {
      fr: "Chaque commande est une bénédiction. L'équipe est attentionnée et fidèle à ses valeurs.",
      en: 'Every order is a blessing. The team is caring and faithful to its values.',
      es: 'Cada pedido es una bendición. El equipo es atento y fiel a sus valores.',
      he: 'כל הזמנה היא ברכה. הצוות קשוב ונאמן לערכיו.'
    }
  },
  {
    name: 'Paulo S.',
    country: '🇧🇷',
    translations: {
      fr: "Recevoir un objet écrit à la main depuis la Ville sainte est une émotion unique.",
      en: 'Receiving a handwritten item from the Holy City is a unique emotion.',
      es: 'Recibir un objeto escrito a mano desde la Ciudad Santa es una emoción única.',
      he: 'לקבל פריט שנכתב בכתב יד מהעיר הקדושה זו התרגשות ייחודית.'
    }
  }
];

export default async function TestimonialsPage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations('pages.testimonials');
  const activeLocale = (['fr', 'en', 'es', 'he'].includes(locale) ? locale : 'fr') as 'fr' | 'en' | 'es' | 'he';

  return (
    <>
      <PageHero badge={t('badge')} title={t('title')} subtitle={t('subtitle')} />
      <section className="container py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <figure key={item.name} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <Quote className="h-6 w-6 text-gold" />
              <blockquote className="mt-4 text-foreground/90">{item.translations[activeLocale]}</blockquote>
              <figcaption className="mt-4 text-sm font-medium text-muted-foreground">
                {item.country} {item.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}