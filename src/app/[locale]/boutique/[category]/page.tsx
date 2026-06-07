import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/site/page-hero';
import { ProductCard } from '@/components/shop/product-card';
import { getProductsByCategory, CATEGORY_ORDER, type ProductCategory } from '@/lib/catalog';
import { routing, type Locale } from '@/i18n/routing';

const CATEGORY_KEY: Record<ProductCategory, 'wines' | 'parchments'> = {
  'vin-blanc': 'wines',
  'vin-rouge': 'wines',
  'vin-rose': 'wines',
  parchemins: 'parchments'
};

export function generateStaticParams() {
  const params: { locale: string; category: string }[] = [];
  for (const locale of routing.locales) {
    for (const category of CATEGORY_ORDER) {
      params.push({ locale, category });
    }
  }
  return params;
}

export default async function CategoryPage({
  params: { locale, category }
}: {
  params: { locale: string; category: string };
}) {
  setRequestLocale(locale);
  const key = CATEGORY_KEY[category as ProductCategory];
  if (!key) notFound();

  const home = await getTranslations('home');
  const shop = await getTranslations('pages.shop');
  const products = getProductsByCategory(category as ProductCategory);

  return (
    <>
      <PageHero badge={shop('badge')} title={home(`${key}.title`)} subtitle={home(`${key}.text`)} />
      <section className="container py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} locale={locale as Locale} />
          ))}
        </div>
      </section>
    </>
  );
}
