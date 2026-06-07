import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/site/page-hero';

export async function LegalPage({
  locale,
  titleKey
}: {
  locale: string;
  titleKey: 'mentionsTitle' | 'privacyTitle' | 'termsTitle' | 'cookiesTitle';
}) {
  setRequestLocale(locale);
  const t = await getTranslations('pages.legal');

  const sectionMap = {
    mentionsTitle: 'mentions',
    privacyTitle: 'privacy',
    termsTitle: 'terms',
    cookiesTitle: 'cookies'
  } as const;

  const subKey = sectionMap[titleKey];

  return (
    <>
      <PageHero title={t(titleKey)} />
      <section className="container py-16">
        <div className="container-prose mx-auto space-y-10">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-primary">
                {t(`${subKey}.title${num}`)}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t(`${subKey}.text${num}`)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
