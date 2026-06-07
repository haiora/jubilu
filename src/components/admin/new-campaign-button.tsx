'use client';

import { useState } from 'react';
import { Plus, X, Send, Loader2 } from 'lucide-react';

interface Props {
  label: string;
  contactCount: number;
}

export default function NewCampaignButton({ label, contactCount }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [locale, setLocale] = useState('fr');
  const [sendNow, setSendNow] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, subject, body, locale, sendNow }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur');
      setSuccess(true);
      setTimeout(() => { setOpen(false); setSuccess(false); location.reload(); }, 1500);
    } catch (err: any) {
      setError(err.message ?? 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-medium text-gold-foreground hover:opacity-90 transition-opacity"
      >
        <Plus className="h-4 w-4" /> {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="font-serif text-xl font-semibold">Nouvelle campagne email</h2>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 hover:bg-accent">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-sm font-medium">Nom de la campagne</label>
                <input
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                  placeholder="Ex: Newsletter de Juillet"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Sujet de l&apos;email</label>
                <input
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                  placeholder="Ex: 🕊️ Des nouvelles de Jérusalem"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Contenu (HTML ou texte)</label>
                <textarea
                  required
                  rows={6}
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold resize-none"
                  placeholder="<p>Bonjour,</p><p>Voici nos nouvelles...</p>"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Langue</label>
                  <select
                    value={locale}
                    onChange={e => setLocale(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="he">עברית</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border p-3 hover:bg-accent">
                    <input
                      type="checkbox"
                      checked={sendNow}
                      onChange={e => setSendNow(e.target.checked)}
                      className="h-4 w-4 accent-gold"
                    />
                    <span className="text-sm">Envoyer immédiatement</span>
                  </label>
                </div>
              </div>

              <div className="rounded-xl bg-accent/50 px-4 py-2.5 text-sm text-muted-foreground">
                📧 Cette campagne sera envoyée à <strong className="text-primary">{contactCount} contacts</strong> avec consentement.
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm hover:bg-accent"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading || success}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gold px-4 py-2.5 text-sm font-medium text-gold-foreground disabled:opacity-60 hover:opacity-90"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Traitement…</>
                  ) : success ? (
                    '✓ Créée !'
                  ) : (
                    <><Send className="h-4 w-4" /> {sendNow ? 'Créer & envoyer' : 'Enregistrer brouillon'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
