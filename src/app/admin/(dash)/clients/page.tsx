'use client';

import { ArrowLeft, Mail, Phone, ShoppingBag } from 'lucide-react';

const CLIENTS = [
  {
    id: 1,
    name: 'Jean Dupont',
    email: 'jean.dupont@example.fr',
    phone: '+33 6 12 34 56 78',
    address: '12 Rue de la Paix, 75002 Paris',
    orders: 1,
    total: 2490,
    lastOrder: '15/06/2024'
  },
  {
    id: 2,
    name: 'Marie Cohen',
    email: 'marie.cohen@example.com',
    phone: '+33 6 98 76 54 32',
    address: '45 Avenue Victor Hugo, 75116 Paris',
    orders: 1,
    total: 8900,
    lastOrder: '20/06/2024'
  }
];

export default function ClientsPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-border bg-white">
        <div className="container flex items-center gap-4 py-4">
          <a href="/admin/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Retour
          </a>
          <h1 className="text-lg font-semibold">Clients</h1>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-4">
          {CLIENTS.map((client) => (
            <div key={client.id} className="rounded-xl border border-border bg-white p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{client.name}</h3>
                  <div className="mt-2 space-y-1">
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" /> {client.email}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" /> {client.phone}
                    </p>
                    <p className="text-sm text-muted-foreground">{client.address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <ShoppingBag className="h-4 w-4" /> {client.orders} commande(s)
                  </p>
                  <p className="mt-1 text-lg font-semibold">{(client.total / 100).toFixed(2)} €</p>
                  <p className="text-xs text-muted-foreground">Dernière : {client.lastOrder}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
