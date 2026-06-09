'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Send, Mail, Loader2, Users, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { getAdminCampaigns, createCampaign } from '@/lib/api-client';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: 'draft' | 'sent';
  locale: string;
  sentAt: string | null;
  stats: string | null;
  createdAt: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', subject: '', body: '', locale: 'fr', sendNow: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    setLoading(true);
    getAdminCampaigns()
      .then((data) => setCampaigns(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');
    try {
      const res = await createCampaign(form);
      setSuccess(res.message);
      setForm({ name: '', subject: '', body: '', locale: 'fr', sendNow: false });
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création.');
    } finally {
      setCreating(false);
    }
  };

  const parseStats = (stats: string | null) => {
    if (!stats) return null;
    try { return JSON.parse(stats); } catch { return null; }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-border bg-white">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <a href="/admin/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> Retour
            </a>
            <h1 className="text-lg font-semibold">Campagnes email ({campaigns.length})</h1>
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            {showForm ? 'Annuler' : 'Nouvelle campagne'}
          </button>
        </div>
      </header>

      <main className="container py-8">
        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle className="h-4 w-4" /> {success}
          </div>
        )}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4" /> {error}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleCreate} className="mb-8 rounded-2xl border border-border bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-semibold">Nouvelle campagne</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Nom interne</label>
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="Newsletter Juin 2026" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Langue</label>
                <select value={form.locale} onChange={(e) => setForm((f) => ({ ...f, locale: e.target.value }))} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="he">עברית</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Objet</label>
              <input required value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="Des nouvelles de Jérusalem" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Contenu HTML</label>
              <textarea required rows={6} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 font-mono" placeholder="<p>Bonjour {{firstName}},...</p>" />
              <p className="mt-1 text-xs text-muted-foreground">Variables : {'{{firstName}}'}, {'{{lastName}}'}. Lien de désabonnement ajouté automatiquement.</p>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="sendNow" checked={form.sendNow} onChange={(e) => setForm((f) => ({ ...f, sendNow: e.target.checked }))} className="h-4 w-4 rounded border-border accent-primary" />
              <label htmlFor="sendNow" className="text-sm">Envoyer immédiatement aux contacts abonnés</label>
            </div>
            <button type="submit" disabled={creating} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {creating ? 'Envoi…' : form.sendNow ? 'Créer et envoyer' : 'Enregistrer le brouillon'}
            </button>
          </form>
        )}

        {campaigns.length === 0 ? (
          <div className="rounded-xl border border-border bg-white p-12 text-center text-muted-foreground">
            Aucune campagne pour le moment.
          </div>
        ) : (
          <div className="grid gap-4">
            {campaigns.map((c) => {
              const stats = parseStats(c.stats);
              return (
                <div key={c.id} className="rounded-xl border border-border bg-white p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{c.name}</h3>
                        <span className={`rounded px-2 py-0.5 text-xs font-medium ${c.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {c.status === 'sent' ? 'Envoyée' : 'Brouillon'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" /> {c.subject}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()} · {c.locale.toUpperCase()}</p>
                    </div>
                    {stats && (
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground" title="Envoyés">
                          <Send className="h-3.5 w-3.5" /> {stats.sent ?? 0}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground" title="Livrés">
                          <CheckCircle className="h-3.5 w-3.5" /> {stats.delivered ?? 0}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground" title="Ouvertures">
                          <Clock className="h-3.5 w-3.5" /> {stats.opened ?? 0}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground" title="Contacts">
                          <Users className="h-3.5 w-3.5" /> {stats.sent ?? 0}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
