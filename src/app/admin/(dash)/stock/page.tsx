'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Minus, Plus } from 'lucide-react';
import { getAdminProducts, updateAdminStock } from '@/lib/api-client';

interface Variant {
  id: string;
  sku: string;
  name: string | null;
  stock: number;
}

interface AdminProduct {
  id: string;
  slug: string;
  translations: { locale: string; name: string }[];
  variants: Variant[];
}

export default function StockAdminPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getAdminProducts()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const adjust = async (variantId: string, delta: number) => {
    await updateAdminStock(variantId, delta);
    load();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
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
          <h1 className="text-lg font-semibold">Stock</h1>
        </div>
      </header>

      <main className="container py-8">
        <div className="overflow-x-auto rounded-xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-accent/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Produit</th>
                <th className="px-4 py-3 text-left font-medium">Variante</th>
                <th className="px-4 py-3 text-right font-medium">Stock</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.flatMap((p) =>
                (p.variants || []).map((v: any) => (
                  <tr key={v.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">
                      {p.translations?.find((t: any) => t.locale === 'fr')?.name ?? p.slug}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{v.name ?? v.sku}</td>
                    <td className="px-4 py-3 text-right font-semibold">{v.stock}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adjust(v.id, -1)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-white hover:bg-accent"
                          aria-label="Diminuer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => adjust(v.id, 1)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-white hover:bg-accent"
                          aria-label="Augmenter"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
