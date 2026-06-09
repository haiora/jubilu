'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Mail, Phone, ShoppingBag, Search } from 'lucide-react';
import { getContacts } from '@/lib/admin-store';
import type { AdminContact } from '@/lib/admin-store';

export default function ClientsPage() {
  const [clients, setClients] = useState<AdminContact[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setClients(getContacts());
  }, []);

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const formatEUR = (cents: number) => `${(cents / 100).toFixed(2)} €`;

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-border bg-white">
        <div className="container flex items-center gap-4 py-4">
          <a href="/admin/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Retour
          </a>
          <h1 className="text-lg font-semibold">Clients ({clients.length})</h1>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom ou email..."
              className="w-full rounded-lg border border-border bg-white py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-white p-12 text-center text-muted-foreground">
            Aucun contact trouvé.
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((client) => (
              <div key={client.id} className="rounded-xl border border-border bg-white p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{client.name}</h3>
                      <span className={`rounded px-2 py-0.5 text-xs capitalize ${client.status === 'donateur' ? 'bg-purple-100 text-purple-700' : client.status === 'client' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{client.status}</span>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" /> {client.email}
                      </p>
                      {client.phone && (
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" /> {client.phone}
                        </p>
                      )}
                      {client.address && <p className="text-sm text-muted-foreground">{client.address}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
                      <ShoppingBag className="h-4 w-4" /> {client.ordersCount} commande(s)
                    </p>
                    <p className="mt-1 text-lg font-semibold">{formatEUR(client.totalSpent)}</p>
                    <p className="text-xs text-muted-foreground">Depuis {new Date(client.createdAt).toLocaleDateString()}</p>
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
