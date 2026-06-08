'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Loader2 } from 'lucide-react';

interface Props {
  variantId: string;
  stock: number;
  lowThreshold: number;
}

export default function StockAdjust({ variantId, stock, lowThreshold }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(stock);
  const [loading, setLoading] = useState(false);

  async function adjust(delta: number) {
    if (loading) return;
    const optimistic = Math.max(0, value + delta);
    setValue(optimistic);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, delta }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setValue(data.stock);
      router.refresh();
    } catch {
      setValue(stock);
    } finally {
      setLoading(false);
    }
  }

  const isLow = value < lowThreshold;

  return (
    <span className="inline-flex items-center gap-1">
      <button
        onClick={() => adjust(-1)}
        disabled={loading || value === 0}
        className="flex h-6 w-6 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent disabled:opacity-40"
        aria-label="-1"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className={`min-w-[2.5rem] text-center font-semibold ${isLow ? 'text-amber-600' : 'text-primary'}`}>
        {loading ? <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" /> : value}
      </span>
      <button
        onClick={() => adjust(1)}
        disabled={loading}
        className="flex h-6 w-6 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent disabled:opacity-40"
        aria-label="+1"
      >
        <Plus className="h-3 w-3" />
      </button>
    </span>
  );
}
