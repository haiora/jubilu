'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface Props {
  orderId: string;
  current: string;
  options: Option[];
}

export default function OrderStatusSelect({ orderId, current, options }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(current);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    const prev = value;
    setValue(next);
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch('/api/admin/orders/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: next }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      router.refresh();
    } catch {
      setValue(prev);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <select
        value={value}
        onChange={onChange}
        disabled={loading}
        className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium outline-none ring-gold focus:ring-2 disabled:opacity-60"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
      {saved && !loading && <Check className="h-3.5 w-3.5 text-green-600" />}
    </div>
  );
}
