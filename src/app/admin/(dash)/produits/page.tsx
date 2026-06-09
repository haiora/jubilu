'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Wine, Scroll } from 'lucide-react';
import { getAdminProducts } from '@/lib/api-client';
import { AdminLoading } from '@/components/admin/admin-loading';

type LocaleKey = 'fr' | 'en' | 'he' | 'es';

interface Translation {
  locale: string;
  name: string;
  shortDesc: string | null;
  longDesc: string | null;
}

interface Variant {
  id: string;
  sku: string;
  name: string | null;
  price: number;
  stock: number;
  active: boolean;
}

interface AdminProduct {
  id: string;
  slug: string;
  category: string;
  status: string;
  featured: boolean;
  customizable: boolean;
  basePrice: number;
  translations: Translation[];
  variants: Variant[];
}

const catLabels: Record<string, string> = {
  wine: 'Vins',
  parchment: 'Parchemins'
};

export default function ProductsAdminPage() {
  const [locale, setLocale] = useState<LocaleKey>('fr');
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminProducts()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const map: Record<string, AdminProduct[]> = {};
    products.forEach((p) => {
      const cat = catLabels[p.category] ?? p.category;
      if (!map[cat]) map[cat] = [];
      map[cat].push(p);
    });
    return map;
  }, [products]);

  const formatEUR = (cents: number) => `${(cents / 100).toFixed(2)} €`;
  const tr = (p: AdminProduct, loc: LocaleKey) =>
    p.translations?.find((t: Translation) => t.locale === loc) ||
    p.translations?.find((t: Translation) => t.locale === 'fr');

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <AdminLoading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-border bg-white">
        <div className="container flex items-center gap-4 py-4">
          <a href="/admin/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Retour
          </a>
          <h1 className="text-lg font-semibold">Produits ({products.length})</h1>
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
                {items.map((p) => {
                  const t = tr(p, locale);
                  const stock = p.variants?.[0]?.stock ?? 0;
                  return (
                    <div key={p.id} className="rounded-xl border border-border bg-white p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{t?.name ?? p.slug}</h3>
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{t?.shortDesc ?? ''}</p>
                        </div>
                        {p.category === 'wine' ? (
                          <Wine className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Scroll className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm">
                        <span className="font-medium text-primary">{formatEUR(p.basePrice)}</span>
                        <span className="text-xs text-muted-foreground">Stock: {stock}</span>
                      </div>
                      {p.variants?.[0]?.sku && <p className="mt-2 text-[10px] text-muted-foreground">SKU: {p.variants[0].sku}</p>}
                      {p.customizable && (
                        <span className="mt-2 inline-block rounded bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700">Personnalisable</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
