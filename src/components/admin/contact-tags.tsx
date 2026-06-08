'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Loader2 } from 'lucide-react';

interface Props {
  contactId: string;
  initialTags: string[];
  addLabel: string;
  emptyLabel: string;
}

export default function ContactTags({ contactId, initialTags, addLabel, emptyLabel }: Props) {
  const router = useRouter();
  const [tags, setTags] = useState<string[]>(initialTags);
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function addTag(e: React.FormEvent) {
    e.preventDefault();
    const name = value.trim();
    if (!name) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/crm/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur');
      if (!tags.some(t => t.toLowerCase() === name.toLowerCase())) {
        setTags([...tags, data.tag.name]);
      }
      setValue('');
      setAdding(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  async function removeTag(name: string) {
    setTags(tags.filter(t => t !== name));
    await fetch('/api/admin/crm/tags', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactId, name }),
    }).catch(() => {});
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs text-primary">
          {tag}
          <button onClick={() => removeTag(tag)} className="rounded-full p-0.5 hover:bg-black/10" aria-label="Retirer">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      {tags.length === 0 && !adding && <span className="text-xs italic text-muted-foreground">{emptyLabel}</span>}

      {adding ? (
        <form onSubmit={addTag} className="inline-flex items-center gap-1">
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Nom du tag"
            className="w-28 rounded-full border border-input bg-card px-3 py-1 text-xs outline-none ring-gold focus:ring-2"
          />
          <button type="submit" disabled={loading} className="rounded-full bg-gold p-1 text-gold-foreground disabled:opacity-50">
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
          </button>
          <button type="button" onClick={() => { setAdding(false); setValue(''); }} className="rounded-full p-1 hover:bg-accent">
            <X className="h-3 w-3" />
          </button>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent"
        >
          {addLabel}
        </button>
      )}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
