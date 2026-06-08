'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Send } from 'lucide-react';

interface Props {
  contactId: string;
  placeholder: string;
}

export default function AddNoteForm({ contactId, placeholder }: Props) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/crm/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur');
      setBody('');
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      <textarea
        rows={2}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        className="w-full resize-none rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none ring-gold focus:ring-2"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !body.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-medium text-gold-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Ajouter
        </button>
      </div>
    </form>
  );
}
