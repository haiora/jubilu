'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Pencil, Trash2, X, Loader2, Check } from 'lucide-react';

interface Props {
  id: string;
  initial: {
    name: string;
    shortDesc: string;
    category: string;
    price: number; // euros
    stock: number;
    status: string;
    featured: boolean;
  };
}

export default function ProductRowActions({ id, initial }: Props) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState(initial.name);
  const [shortDesc, setShortDesc] = useState(initial.shortDesc);
  const [category, setCategory] = useState(initial.category);
  const [price, setPrice] = useState(String(initial.price));
  const [stock, setStock] = useState(String(initial.stock));
  const [status, setStatus] = useState(initial.status === 'active' ? 'active' : 'draft');
  const [featured, setFeatured] = useState(initial.featured);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, shortDesc, category, price: Number(price), stock: Number(stock), status, featured, locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t('productForm.errRequired'));
      setSaved(true);
      setTimeout(() => { setOpen(false); setSaved(false); router.refresh(); }, 1000);
    } catch (err: any) {
      setError(err.message ?? 'Error');
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!window.confirm(t('productForm.deleteConfirm'))) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setDeleting(false);
    }
  }

  const field = 'w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold';

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={() => setOpen(true)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-primary"
        aria-label={t('productForm.edit')}
        title={t('productForm.edit')}
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={remove}
        disabled={deleting}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
        aria-label={t('productForm.delete')}
        title={t('productForm.delete')}
      >
        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm text-start">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="font-serif text-xl font-semibold">{t('productForm.editTitle')}</h2>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 hover:bg-accent"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={save} className="space-y-4 p-5">
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
                <button type="submit" disabled={loading || saved} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gold px-4 py-2.5 text-sm font-medium text-gold-foreground disabled:opacity-60 hover:opacity-90">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> {t('productForm.saving')}</>
                    : saved ? <><Check className="h-4 w-4" /> {t('productForm.saved')}</>
                    : t('productForm.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
