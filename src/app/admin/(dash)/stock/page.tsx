'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Package, Minus, Plus } from 'lucide-react';
import { PRODUCTS } from '@/lib/catalog';

const STOCK_KEY = 'jubilee_stock';

function getStockOverrides(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STOCK_KEY) || '{}');
  } catch {
    return {};
  }
}

function setStockOverride(sku: string, value: number) {
  const overrides = getStockOverrides();
  overrides[sku] = value;
  localStorage.setItem(STOCK_KEY, JSON.stringify(overrides));
}

export default function StockAdminPage() {
  const [overrides, setOverrides] = useState<Record<string, number>>({});

  useEffect(() => {
    setOverrides(getStockOverrides());
  }, []);

  const getEffectiveStock = (sku: string, defaultStock: number) => {
    if (overrides[sku] !== undefined) return overrides[sku];
    return defaultStock;
  };

  const adjust = (sku: string, defaultStock: number, delta: number) => {
    const current = getEffectiveStock(sku, defaultStock);
    const next = Math.max(0, current + delta);
    setStockOverride(sku, next);
    setOverrides(getStockOverrides());
  };

  const setValue = (sku: string, value: number) => {
    const next = Math.max(0, value);
    setStockOverride(sku, next);
    setOverrides(getStockOverrides());
  };

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
                <th className="px-4 py-3 text-left font-medium">SKU</th>
                <th className="px-4 py-3 text-right font-medium">Stock catalogue</th>
                <th className="px-4 py-3 text-right font-medium">Stock ajusté</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.map((p) => {
                const effective = getEffectiveStock(p.sku || p.slug, p.stock);
                return (
                  <tr key={p.slug} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{p.translations.fr.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.sku || p.slug}</td>
                    <td className="px-4 py-3 text-right">{p.stock}</td>
                    <td className="px-4 py-3 text-right font-semibold">{effective}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adjust(p.sku || p.slug, p.stock, -1)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-white hover:bg-accent"
                          aria-label="Diminuer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <input
                          type="number"
                          min={0}
                          value={effective}
                          onChange={(e) => setValue(p.sku || p.slug, Number(e.target.value))}
                          className="h-7 w-16 rounded-md border border-border bg-white px-2 text-right text-xs outline-none"
                        />
                        <button
                          onClick={() => adjust(p.sku || p.slug, p.stock, 1)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-white hover:bg-accent"
                          aria-label="Augmenter"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
