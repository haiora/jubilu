'use client';

import { useEffect, useState } from 'react';
import { Package, Users, ShoppingBag, TrendingUp, LogOut, Heart, Crown } from 'lucide-react';
import { getAdminDashboard, adminLogout } from '@/lib/api-client';

export default function AdminDashboard() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [stats, setStats] = useState({ orders: 0, clients: 0, products: 4, revenue: 0, donationsCount: 0, donationsTotal: 0 });
  const [recentOrders, setRecentOrders] = useState<{ id: string; number: string; status: string; total: number; contactId?: string; contact?: { email?: string } }[]>([]);
  const [recentClients, setRecentClients] = useState<{ id: string; firstName: string | null; lastName: string | null; email: string; ordersCount: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/me/')
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.user && setUser(d.user))
      .catch(() => {});

    getAdminDashboard()
      .then(d => {
        setStats(d.stats);
        setRecentOrders(d.recentOrders);
        setRecentClients(d.recentClients);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await adminLogout();
    window.location.href = '/admin/login/';
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
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/10 text-gold">
              <Crown className="h-5 w-5" />
            </div>
            <h1 className="text-lg font-semibold">Tableau de bord</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email ?? 'Admin'}</span>
            <button onClick={handleLogout} className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
              <LogOut className="h-4 w-4" /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard icon={ShoppingBag} label="Commandes" value={stats.orders} color="bg-blue-50 text-blue-600" />
          <StatCard icon={Users} label="Clients / Contacts" value={stats.clients} color="bg-emerald-50 text-emerald-600" />
          <StatCard icon={Package} label="Produits" value={stats.products} color="bg-amber-50 text-amber-600" />
          <StatCard icon={TrendingUp} label="Chiffre d'affaires" value={formatEUR(stats.revenue)} color="bg-purple-50 text-purple-600" />
          <StatCard icon={Heart} label="Dons" value={stats.donationsCount} color="bg-rose-50 text-rose-600" />
          <StatCard icon={TrendingUp} label="Montant dons" value={formatEUR(stats.donationsTotal)} color="bg-cyan-50 text-cyan-600" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-gold" />
              <h2 className="font-semibold">Commandes récentes</h2>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune commande pour le moment.</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between rounded-xl bg-accent/30 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{o.number}</p>
                      <p className="text-xs text-muted-foreground">{o.contact?.email ?? o.contactId ?? '—'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatEUR(o.total)}</p>
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusClass[o.status] ?? statusClass.pending}`}>{statusLabel[o.status] ?? o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-gold" />
              <h2 className="font-semibold">Derniers contacts</h2>
            </div>
            {recentClients.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun contact pour le moment.</p>
            ) : (
              <div className="space-y-3">
                {recentClients.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-xl bg-accent/30 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                    <span className="rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold">{c.ordersCount} commande(s)</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <nav className="mt-8 flex flex-wrap gap-3">
          <a href="/admin/commandes/" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary/90 transition-colors">Commandes</a>
          <a href="/admin/clients/" className="rounded-xl bg-white border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors">Clients</a>
          <a href="/admin/dons/" className="rounded-xl bg-white border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors">Donateurs</a>
          <a href="/admin/produits/" className="rounded-xl bg-white border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors">Produits</a>
          <a href="/admin/stock/" className="rounded-xl bg-white border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors">Stock</a>
          <a href="/admin/campagnes/" className="rounded-xl bg-white border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors">Campagnes email</a>
        </nav>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color?: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-white p-5 shadow-sm">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color ?? 'bg-primary/10 text-primary'}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
