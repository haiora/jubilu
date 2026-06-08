'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Plus, X, Loader2, Check } from 'lucide-react';

export default function NewProductButton() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [category, setCategory] = useState('wine');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [status, setStatus] = useState('draft');
  const [featured, setFeatured] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, shortDesc, category,
          price: Number(price),
          stock: Number(stock),
          status, featured, locale,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t('productForm.errRequired'));
      setSuccess(true);
      setTimeout(() => { setOpen(false); setSuccess(false); router.refresh(); }, 1200);
    } catch (err: any) {
      setError(err.message ?? 'Error');
    } finally {
      setLoading(false);
    }
  }

  const field = 'w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold';

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-medium text-gold-foreground hover:opacity-90 transition-opacity"
      >
        <Plus className="h-4 w-4" /> {t('products.new')}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="font-serif text-xl font-semibold">{t('productForm.title')}</h2>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 hover:bg-accent">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-sm font-medium">{t('productForm.name')}</label>
                <input required value={name} onChange={e => setName(e.target.value)} className={field} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">{t('productForm.shortDesc')}</label>
                <input value={shortDesc} onChange={e => setShortDesc(e.target.value)} className={field} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">{t('productForm.category')}</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className={field}>
                    <option value="wine">{t('productForm.wine')}</option>
                    <option value="parchment">{t('productForm.parchment')}</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">{t('productForm.status')}</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className={field}>
                    <option value="draft">{t('productForm.statusDraft')}</option>
                    <option value="active">{t('productForm.statusActive')}</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">{t('productForm.price')}</label>
                  <input required type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className={field} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">{t('productForm.stock')}</label>
                  <input type="number" min="0" step="1" value={stock} onChange={e => setStock(e.target.value)} className={field} />
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border p-3 hover:bg-accent">
                <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="h-4 w-4 accent-gold" />
                <span className="text-sm">{t('productForm.featured')}</span>
              </label>

              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</div>}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm hover:bg-accent">
                  {t('common.cancel')}
                </button>
                <button type="submit" disabled={loading || success} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gold px-4 py-2.5 text-sm font-medium text-gold-foreground disabled:opacity-60 hover:opacity-90">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> {t('productForm.submitting')}</>
                    : success ? <><Check className="h-4 w-4" /> {t('productForm.success')}</>
                    : <><Plus className="h-4 w-4" /> {t('productForm.submit')}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
