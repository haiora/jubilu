export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { AlertTriangle, Wine, ScrollText, TrendingDown, Package } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { getAdminLocale } from '@/lib/admin-i18n';
import { getSession, can } from '@/lib/auth';
import { db } from '@/lib/db';
import { products, productTranslations, productVariants } from '../../../../../db/schema';
import StockAdjust from '@/components/admin/stock-adjust';

const LOW_STOCK = 30;

export default async function StockPage() {
  const session = getSession();
  if (!can(session, 'stock')) redirect('/admin');
  const locale = getAdminLocale();
  const t = await getTranslations({ locale, namespace: 'admin' });

  const [allProducts, allTranslations, allVariants] = await Promise.all([
    db.select().from(products),
    db.select().from(productTranslations),
    db.select().from(productVariants),
  ]);

  const translationMap: Record<string, string> = {};
  for (const tr of allTranslations) {
    if (tr.locale === locale || (!translationMap[tr.productId] && tr.locale === 'fr')) {
      translationMap[tr.productId] = tr.name;
    }
  }

  // Group variants by product
  const variantsByProduct: Record<string, typeof allVariants> = {};
  for (const v of allVariants) {
    if (!variantsByProduct[v.productId]) variantsByProduct[v.productId] = [];
    variantsByProduct[v.productId].push(v);
  }

  const rows = allProducts.map(p => {
    const vars = variantsByProduct[p.id] ?? [];
    const totalStock = vars.reduce((s, v) => s + v.stock, 0);
    return { ...p, name: translationMap[p.id] ?? p.slug, totalStock, variants: vars };
  });

  const lowRows = rows.filter(r => r.totalStock < LOW_STOCK);
  const grandTotal = rows.reduce((s, r) => s + r.totalStock, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold">{t('stock.title')}</h1>
        <p className="text-muted-foreground">{t('stock.subtitle')}</p>
      </div>

      {/* Summary */}
      <div className="flex gap-4">
        <div className="rounded-xl border border-border bg-card px-5 py-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('stock.totalLabel')}</p>
          <p className="font-serif text-2xl font-semibold">{grandTotal}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-3">
          <p className="text-xs text-amber-700 uppercase tracking-wide">{t('stock.alertRefs')}</p>
          <p className="font-serif text-2xl font-semibold text-amber-700">{lowRows.length}</p>
        </div>
      </div>

      {lowRows.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{t('stock.alert', { n: lowRows.length, s: LOW_STOCK })}</p>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
          <Package className="mx-auto mb-3 h-10 w-10 opacity-20" />
          <p className="text-muted-foreground">{t('stock.empty')}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((p) => {
            const Icon = p.category === 'parchment' ? ScrollText : Wine;
            const maxStock = 150;
            const pct = Math.min(100, Math.round((p.totalStock / maxStock) * 100));
            const isLow = p.totalStock < LOW_STOCK;
            return (
              <div key={p.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary shrink-0">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-medium leading-tight">{p.name}</span>
                </div>

                {p.variants.length > 0 && p.variants.map(v => (
                  <div key={v.id} className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{v.name ?? t('common.standard')}</span>
                    <StockAdjust variantId={v.id} stock={v.stock} lowThreshold={LOW_STOCK} />
                  </div>
                ))}

                <div className="mt-4 flex items-end justify-between">
                  <span className={`font-serif text-2xl font-semibold ${isLow ? 'text-amber-600' : ''}`}>
                    {p.totalStock}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    {isLow && <TrendingDown className="h-3 w-3 text-amber-600" />}
                    {t('common.units')}
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted">
                  <div
                    className={`h-2 rounded-full transition-all ${isLow ? 'bg-amber-500' : 'bg-secondary'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
