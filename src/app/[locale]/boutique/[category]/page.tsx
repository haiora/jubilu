import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/site/page-hero';
import { ProductCard } from '@/components/shop/product-card';
import { type ProductCategory } from '@/lib/catalog';
import { getShopProducts } from '@/lib/shop';
import { type Locale } from '@/i18n/routing';

const CATEGORY_KEY: Record<ProductCategory, 'wines' | 'parchments'> = {
  'vin-blanc': 'wines',
  'vin-rouge': 'wines',
  'vin-rose': 'wines',
  parchemins: 'parchments'
};

export async function generateMetadata({ params: { locale, category } }: { params: { locale: string; category: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'pages.shop' });
  const home = await getTranslations({ locale, namespace: 'home' });
  const key = CATEGORY_KEY[category as ProductCategory];
  const title = key ? home(`${key}.title`) : t('title');
  return { title, description: t('subtitle') };
}

export function generateStaticParams() {
  return ['fr', 'en', 'he', 'es'].flatMap((locale) =>
    ['vin-rouge', 'vin-blanc', 'vin-rose', 'parchemins'].map((category) => ({
      locale,
      category
    }))
  );
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
  const dbProducts = await getShopProducts(category as ProductCategory);

  return (
    <>
      <PageHero badge={shop('badge')} title={home(`${key}.title`)} subtitle={home(`${key}.text`)} />
      <section className="container py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dbProducts.map((p) => (
            <ProductCard key={p.slug} product={p} locale={locale as Locale} stock={p.stock} />
          ))}
        </div>
      </section>
    </>
  );
}