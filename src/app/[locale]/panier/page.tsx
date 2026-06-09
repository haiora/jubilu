'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Trash2, ScrollText, Wine, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useCart } from '@/components/shop/cart-context';
import { Button } from '@/components/ui/button';
import { getShopProducts } from '@/lib/api-client';
import { formatPrice } from '@/lib/catalog';
import { CartItemSkeleton } from '@/components/site/skeleton';
import type { Locale } from '@/i18n/routing';

interface ShopProduct {
  slug: string;
  price: number;
  icon: string;
  gradient: string;
  customizable: boolean;
  translations: Record<string, { name: string; shortDesc: string; longDesc: string }>;
}

export default function CartPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations('cart');
  const { items, setQty, remove } = useCart();
  const [products, setProducts] = useState<ShopProduct[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShopProducts()
      .then((data) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const productMap = useMemo(() => {
    const map: Record<string, ShopProduct> = {};
    if (products) {
      for (const p of products) map[p.slug] = p;
    }
    return map;
  }, [products]);

  const lines = useMemo(() => {
    return items
      .map((item, index) => ({ item, index, product: productMap[item.slug] }))
      .filter((l) => l.product);
  }, [items, productMap]);

  const total = lines.reduce((sum, l) => sum + (l.product!.price * l.item.qty), 0);

  if (loading) {
    return (
      <section className="container py-12">
        <h1 className="text-3xl font-semibold md:text-4xl">{t('title')}</h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <CartItemSkeleton />
            <CartItemSkeleton />
          </div>
          <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="h-5 w-24 animate-pulse rounded-xl bg-accent" />
            <div className="mt-4 space-y-2">
              <div className="h-4 w-full animate-pulse rounded-lg bg-accent" />
              <div className="h-4 w-2/3 animate-pulse rounded-lg bg-accent" />
            </div>
            <div className="mt-4 h-12 w-full animate-pulse rounded-xl bg-accent" />
          </aside>
        </div>
      </section>
    );
  }

  return (
    <section className="container py-12">
      <h1 className="text-3xl font-semibold md:text-4xl">{t('title')}</h1>

      {lines.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-border bg-card p-12 text-center animate-fade-up">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/50">
            <Wine className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg text-muted-foreground">{t('empty')}</p>
          <Button asChild variant="gold" className="mt-6 rounded-xl px-8">
            <Link href="/boutique">{t('emptyCta')}</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {lines.map(({ item, index, product }) => {
              const tr = product!.translations[locale];
              const Icon = product!.icon === 'scroll' ? ScrollText : Wine;
              return (
                <div key={index} className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                  <div className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${product!.gradient}`}>
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold">{tr.name}</h3>
                      <button onClick={() => remove(index)} aria-label={t('remove')} className="rounded-md p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {item.customText && (
                      <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground bg-accent/40 px-2.5 py-1 rounded-md w-fit">
                        <ScrollText className="h-3.5 w-3.5 text-gold" />
                        <span className="italic">« {item.customText} »</span>
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-full border border-input bg-background">
                        <button onClick={() => setQty(index, item.qty - 1)} className="h-9 w-9 rounded-full hover:bg-accent transition-colors" aria-label="-">−</button>
                        <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                        <button onClick={() => setQty(index, item.qty + 1)} className="h-9 w-9 rounded-full hover:bg-accent transition-colors" aria-label="+">+</button>
                      </div>
                      <span className="font-semibold text-primary">{formatPrice(product!.price * item.qty, locale)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">{t('summary')}</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {lines.map(({ item, product }) => (
                <li key={item.slug} className="flex justify-between text-muted-foreground">
                  <span>{product!.translations[locale].name} × {item.qty}</span>
                  <span className="font-medium text-foreground">{formatPrice(product!.price * item.qty, locale)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-lg font-semibold">
              <span>{t('total')}</span>
              <span className="text-primary">{formatPrice(total, locale)}</span>
            </div>
            <Button asChild variant="gold" size="lg" className="mt-6 w-full rounded-xl shadow-[0_0_20px_-5px_hsl(var(--gold))]">
              <Link href="/commande">{t('checkout')} <ArrowRight className="h-4 w-4 rtl:rotate-180" /></Link>
            </Button>
            <Button asChild variant="ghost" className="mt-2 w-full rounded-xl">
              <Link href="/boutique">{t('continue')}</Link>
            </Button>
          </aside>
        </div>
      )}
    </section>
  );
}
