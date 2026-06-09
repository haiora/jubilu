'use client';

import { useEffect, useState } from 'react';
import { Package, Users, ShoppingBag, TrendingUp, LogOut, Heart } from 'lucide-react';
import { getStats, getOrders, getContacts } from '@/lib/admin-store';
import type { AdminOrder, AdminContact } from '@/lib/admin-store';

export default function AdminDashboard() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [stats, setStats] = useState({ orders: 0, clients: 0, products: 4, revenue: 0, donationsCount: 0, donationsTotal: 0 });
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [recentClients, setRecentClients] = useState<AdminContact[]>([]);

  useEffect(() => {
    const u = typeof window !== 'undefined' ? localStorage.getItem('admin_user') : null;
    if (u) setUser(JSON.parse(u));
    setStats(getStats());
    setRecentOrders(getOrders().slice(-5).reverse());
    setRecentClients(getContacts().slice(-5).reverse());
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('admin_token');
      window.localStorage.removeItem('admin_user');
      window.location.href = '/admin/login/';
    }
  };

  const formatEUR = (cents: number) => `${(cents / 100).toFixed(2)} €`;

  const statusLabel: Record<string, string> = {
    pending: 'En attente', paid: 'Payée', prepared: 'En préparation',
    shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée'
  };
  const statusClass: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700', paid: 'bg-blue-100 text-blue-700',
    prepared: 'bg-indigo-100 text-indigo-700', shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700'
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-border bg-white">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-lg font-semibold">Tableau de bord</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email ?? 'Admin'}</span>
            <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600">
              <LogOut className="h-4 w-4" /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard icon={ShoppingBag} label="Commandes" value={stats.orders} />
          <StatCard icon={Users} label="Clients / Contacts" value={stats.clients} />
          <StatCard icon={Package} label="Produits" value={stats.products} />
          <StatCard icon={TrendingUp} label="Chiffre d'affaires" value={formatEUR(stats.revenue)} />
          <StatCard icon={Heart} label="Dons" value={stats.donationsCount} />
          <StatCard icon={TrendingUp} label="Montant dons" value={formatEUR(stats.donationsTotal)} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-white p-6">
            <h2 className="mb-4 font-semibold">Commandes récentes</h2>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune commande pour le moment.</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between rounded-lg bg-accent/30 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{o.number}</p>
                      <p className="text-xs text-muted-foreground">{o.contact?.email ?? '—'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatEUR(o.total)}</p>
                      <span className={`inline-block rounded px-2 py-0.5 text-xs ${statusClass[o.status] ?? statusClass.pending}`}>{statusLabel[o.status] ?? o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-xl border border-border bg-white p-6">
            <h2 className="mb-4 font-semibold">Derniers contacts</h2>
            {recentClients.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun contact pour le moment.</p>
            ) : (
              <div className="space-y-3">
                {recentClients.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg bg-accent/30 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{c.ordersCount} commande(s)</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <nav className="mt-8 flex flex-wrap gap-3">
          <a href="/admin/commandes/" className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90">Commandes</a>
          <a href="/admin/clients/" className="rounded-lg bg-secondary px-4 py-2 text-sm text-secondary-foreground hover:bg-secondary/90">Clients</a>
          <a href="/admin/produits/" className="rounded-lg bg-secondary px-4 py-2 text-sm text-secondary-foreground hover:bg-secondary/90">Produits</a>
          <a href="/admin/stock/" className="rounded-lg bg-secondary px-4 py-2 text-sm text-secondary-foreground hover:bg-secondary/90">Stock</a>
        </nav>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-white p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
