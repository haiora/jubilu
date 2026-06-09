import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { Wine, ScrollText, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { AddToCart } from '@/components/shop/add-to-cart';
import { PRODUCTS, getProduct, formatPrice } from '@/lib/catalog';
import { getShopProduct } from '@/lib/shop';
import { type Locale } from '@/i18n/routing';

export function generateStaticParams() {
  return ['fr', 'en', 'he', 'es'].flatMap((locale) =>
    PRODUCTS.map((product) => ({
      locale,
      category: product.category,
      slug: product.slug
    }))
  );
}

export async function generateMetadata({
  params: { locale, slug }
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const product = getProduct(slug);
  if (!product) return {};
  const tr = product.translations[locale as Locale];
  return { title: tr.name, description: tr.short };
}

export default async function ProductPage({
  params: { locale, slug }
}: {
  params: { locale: string; category: string; slug: string };
}) {
  setRequestLocale(locale);
  const product = await getShopProduct(slug);
  if (!product) notFound();

  const tr = product.translations[locale as Locale];
  const nav = await getTranslations('nav');
  const Icon = product.icon === 'scroll' ? ScrollText : Wine;

  return (
    <section className="container py-12">
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/boutique" className="hover:text-primary">{nav('shop')}</Link>
        <ChevronRight className="h-4 w-4 rtl:rotate-180" />
        <Link href={`/boutique/${product.category}`} className="hover:text-primary">
          {product.icon === 'scroll' ? nav('parchments') : nav('wines')}
        </Link>
        <ChevronRight className="h-4 w-4 rtl:rotate-180" />
        <span className="text-foreground">{tr.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-border bg-gradient-to-br ${product.gradient}`}>
          {product.image ? (
            <Image src={product.image} alt={tr.name} fill className="object-cover" />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-background/80 text-primary shadow-sm">
              <Icon className="h-14 w-14" />
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <h1 className="text-3xl font-semibold md:text-4xl">{tr.name}</h1>
          <p className="mt-3 text-xl font-semibold text-primary">{formatPrice(product.price, locale as Locale)}</p>
          <p className="mt-6 leading-relaxed text-foreground/90">{tr.long}</p>

          <div className="mt-8">
            <AddToCart slug={product.slug} customizable={product.customizable} stock={product.stock} />
          </div>
        </div>
      </div>
    </section>
  );
}