'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';

export interface CartItem {
  slug: string;
  qty: number;
  customText?: string;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  add: (slug: string, qty?: number, customText?: string) => void;
  setQty: (index: number, qty: number) => void;
  remove: (index: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'jubilee_cart_v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add = useCallback((slug: string, qty = 1, customText?: string) => {
    setItems((prev) => {
      // Les produits personnalisés (parchemins) restent des lignes distinctes.
      if (!customText) {
        const idx = prev.findIndex((i) => i.slug === slug && !i.customText);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], qty: next[idx].qty + qty };
          return next;
        }
      }
      return [...prev, { slug, qty, customText }];
    });
  }, []);

  const setQty = useCallback((index: number, qty: number) => {
    setItems((prev) => prev.map((i, idx) => (idx === index ? { ...i, qty: Math.max(1, qty) } : i)));
  }, []);

  const remove = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, count, add, setQty, remove, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
