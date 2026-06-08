export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { Wine, ScrollText, Star, AlertTriangle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { getAdminLocale } from '@/lib/admin-i18n';
import { getSession, can } from '@/lib/auth';
import { db } from '@/lib/db';
import { products, productTranslations, productVariants } from '../../../../../db/schema';
import { eq } from 'drizzle-orm';
import NewProductButton from '@/components/admin/new-product-button';
import ProductRowActions from '@/components/admin/product-row-actions';

function formatEUR(cents: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

export default async function ProductsPage() {
  const session = getSession();
  if (!can(session, 'products')) redirect('/admin');
  const locale = getAdminLocale();
  const t = await getTranslations({ locale, namespace: 'admin' });

  const [allProducts, allTranslations, allVariants] = await Promise.all([
    db.select().from(products),
    db.select().from(productTranslations),
    db.select().from(productVariants),
  ]);

  // Build map: productId -> translation
  const translationMap: Record<string, { name: string; shortDesc: string | null }> = {};
  for (const tr of allTranslations) {
    if (tr.locale === locale || (!translationMap[tr.productId] && tr.locale === 'fr')) {
      translationMap[tr.productId] = { name: tr.name, shortDesc: tr.shortDesc };
    }
  }

  // Build map: productId -> variant (first active)
  const variantMap: Record<string, { stock: number; price: number }> = {};
  for (const v of allVariants) {
    if (!variantMap[v.productId]) {
      variantMap[v.productId] = { stock: v.stock, price: v.price };
    }
  }

  const totalStock = allVariants.reduce((s, v) => s + v.stock, 0);
  const lowStockProducts = allProducts.filter(p => (variantMap[p.id]?.stock ?? 0) < 30);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">{t('products.title')}</h1>
          <p className="text-muted-foreground">{t('products.subtitle', { n: allProducts.length })}</p>
        </div>
        <NewProductButton />
      </div>

      {lowStockProducts.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{t('products.lowStock', { n: lowStockProducts.length })}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
              <th className="p-4 text-start">{t('products.colProduct')}</th>
              <th className="p-4 text-start">{t('products.colCategory')}</th>
              <th className="p-4 text-end">{t('products.colPrice')}</th>
              <th className="p-4 text-end">{t('products.colStock')}</th>
              <th className="p-4 text-center">{t('products.colStatus')}</th>
              <th className="p-4 text-end">{t('products.colActions')}</th>
            </tr>
          </thead>
          <tbody>
            {allProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-muted-foreground">
                  <p>{t('products.empty')}</p>
                </td>
              </tr>
            ) : (
              allProducts.map((p) => {
                const Icon = p.category === 'parchment' ? ScrollText : Wine;
                const tr = translationMap[p.id];
                const variant = variantMap[p.id];
                const isLow = (variant?.stock ?? 0) < 30;
                return (
                  <tr key={p.id} className="border-b border-border/60 last:border-0 hover:bg-accent/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary shrink-0">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <span className="font-medium">{tr?.name ?? p.slug}</span>
                          {tr?.shortDesc && <p className="text-xs text-muted-foreground truncate max-w-xs">{tr.shortDesc}</p>}
                        </div>
                        {p.featured && <Star className="h-4 w-4 fill-gold text-gold shrink-0" />}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground capitalize">{p.category}</td>
                    <td className="p-4 text-end font-medium">{formatEUR(variant?.price ?? p.basePrice)}</td>
                    <td className="p-4 text-end">
                      <span className={isLow ? 'font-semibold text-amber-600' : ''}>{variant?.stock ?? 0}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${p.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}`}>
                        {p.status === 'active' ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="p-4">
                      <ProductRowActions
                        id={p.id}
                        initial={{
                          name: tr?.name ?? p.slug,
                          shortDesc: tr?.shortDesc ?? '',
                          category: p.category,
                          price: (variant?.price ?? p.basePrice) / 100,
                          stock: variant?.stock ?? 0,
                          status: p.status,
                          featured: p.featured,
                        }}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
