'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/components/shop/cart-context';
import { Button } from '@/components/ui/button';

export function AddToCart({
  slug,
  customizable
}: {
  slug: string;
  customizable: boolean;
}) {
  const t = useTranslations('cart');
  const tc = useTranslations('common');
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [customText, setCustomText] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  function onAdd() {
    if (customizable && customText.trim().length === 0) {
      setError(t('customTextRequired'));
      return;
    }
    setError('');
    add(slug, qty, customizable ? customText.trim() : undefined);
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  }

  return (
    <div className="space-y-4">
      {customizable && (
        <div>
          <label className="mb-1 block text-sm font-medium">{t('customTextLabel')}</label>
          <textarea
            rows={3}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder={t('customTextPlaceholder')}
            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none ring-gold focus:ring-2"
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-input">
          <button type="button" aria-label="-" onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-10 w-10 text-lg">−</button>
          <span className="w-8 text-center">{qty}</span>
          <button type="button" aria-label="+" onClick={() => setQty((q) => q + 1)} className="h-10 w-10 text-lg">+</button>
        </div>
        <Button onClick={onAdd} variant="gold" size="lg" className="flex-1">
          {done ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
          {done ? t('addedToCart') : tc('addToCart')}
        </Button>
      </div>
    </div>
  );
}
