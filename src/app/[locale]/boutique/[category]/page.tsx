import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/site/page-hero';
import { ProductCard } from '@/components/shop/product-card';
import { getProductsByCategory, type ProductCategory } from '@/lib/catalog';
import { getStockBySku, effectiveStock } from '@/lib/stock';
import { type Locale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

const CATEGORY_KEY: Record<ProductCategory, 'wines' | 'parchments'> = {
  'vin-blanc': 'wines',
  'vin-rouge': 'wines',
  'vin-rose': 'wines',
  parchemins: 'parchments'
};

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
  const stockBySku = await getStockBySku();

  return (
    <>
      <PageHero badge={shop('badge')} title={home(`${key}.title`)} subtitle={home(`${key}.text`)} />
      <section className="container py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} locale={locale as Locale} stock={effectiveStock(p, stockBySku)} />
          ))}
        </div>
      </section>
    </>
  );
}
