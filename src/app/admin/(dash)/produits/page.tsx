'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, Package, Wine, Scroll } from 'lucide-react';
import { PRODUCTS, formatPrice } from '@/lib/catalog';
import type { Product } from '@/lib/catalog';

type LocaleKey = 'fr' | 'en' | 'he' | 'es';

const categories: Record<string, string> = {
  'vin-rouge': 'Vins rouges',
  'vin-blanc': 'Vins blancs',
  'vin-rose': 'Vins rosés',
  parchemins: 'Parchemins'
};

export default function ProductsAdminPage() {
  const [locale, setLocale] = useState<LocaleKey>('fr');

  const grouped = useMemo(() => {
    const map: Record<string, Product[]> = {};
    PRODUCTS.forEach((p) => {
      const cat = categories[p.category] ?? p.category;
      if (!map[cat]) map[cat] = [];
      map[cat].push(p);
    });
    return map;
  }, []);

  const formatEUR = (cents: number) => formatPrice(cents, 'fr', 'EUR');

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-border bg-white">
        <div className="container flex items-center gap-4 py-4">
          <a href="/admin/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Retour
          </a>
          <h1 className="text-lg font-semibold">Produits ({PRODUCTS.length})</h1>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-6 flex items-center gap-2">
          {(['fr', 'en', 'he', 'es'] as LocaleKey[]).map((l) => (
            <button
              key={l}
              onClick={() => setLocale(l)}
              className={`rounded-md px-3 py-1 text-xs font-medium ${locale === l ? 'bg-primary text-white' : 'bg-white border border-border text-muted-foreground hover:text-primary'}`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="space-y-8">
          {Object.entries(grouped).map(([cat, items]) => (
            <section key={cat}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{cat}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                  <div key={p.slug} className="rounded-xl border border-border bg-white p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{p.translations[locale].name}</h3>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.translations[locale].short}</p>
                      </div>
                      {p.icon === 'wine' ? (
                        <Wine className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Scroll className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="font-medium text-primary">{formatEUR(p.price)}</span>
                      <span className="text-xs text-muted-foreground">Stock: {p.stock}</span>
                    </div>
                    {p.sku && <p className="mt-2 text-[10px] text-muted-foreground">SKU: {p.sku}</p>}
                    {p.customizable && (
                      <span className="mt-2 inline-block rounded bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700">Personnalisable</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
