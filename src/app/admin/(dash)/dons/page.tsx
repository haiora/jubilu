'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Heart, Mail, Phone, Calendar, Loader2 } from 'lucide-react';

interface Donor {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  locale: string;
  createdAt: string;
}

export default function DonationsPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/donations/')
      .then((r) => {
        if (!r.ok) throw new Error('Erreur ' + r.status);
        return r.json();
      })
      .then((data) => setDonors(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Chargement des donateurs…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-border bg-white">
        <div className="container flex items-center gap-4 py-4">
          <a href="/admin/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Retour
          </a>
          <h1 className="text-lg font-semibold">Donateurs ({donors.length})</h1>
        </div>
      </header>

      <main className="container py-8">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {donors.length === 0 ? (
          <div className="rounded-xl border border-border bg-white p-12 text-center text-muted-foreground">
            Aucun donateur enregistré pour le moment.
          </div>
        ) : (
          <div className="grid gap-4">
            {donors.map((d) => (
              <div key={d.id} className="rounded-xl border border-border bg-white p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {d.firstName} {d.lastName}
                      </h3>
                      <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                        Donateur
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" /> {d.email}
                      </p>
                      {d.phone && (
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" /> {d.phone}
                        </p>
                      )}
                      {d.country && <p className="text-sm text-muted-foreground">{d.country}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" /> Depuis {new Date(d.createdAt).toLocaleDateString()}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground uppercase">{d.locale}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
