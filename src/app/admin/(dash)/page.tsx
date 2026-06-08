'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Users, ShoppingBag, TrendingUp, LogOut } from 'lucide-react';

const MOCK_STATS = {
  orders: 2,
  clients: 2,
  products: 4,
  revenue: 11390 // en centimes
};

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.replace('/admin/login/');
      return;
    }
    const u = localStorage.getItem('admin_user');
    if (u) setUser(JSON.parse(u));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.replace('/admin/login/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-border bg-white">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-lg font-semibold">Tableau de bord</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600">
              <LogOut className="h-4 w-4" /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={ShoppingBag} label="Commandes" value={MOCK_STATS.orders} />
          <StatCard icon={Users} label="Clients" value={MOCK_STATS.clients} />
          <StatCard icon={Package} label="Produits" value={MOCK_STATS.products} />
          <StatCard icon={TrendingUp} label="Chiffre d'affaires" value={`${(MOCK_STATS.revenue / 100).toFixed(2)} €`} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-white p-6">
            <h2 className="mb-4 font-semibold">Commandes récentes</h2>
            <RecentOrders />
          </div>
          <div className="rounded-xl border border-border bg-white p-6">
            <h2 className="mb-4 font-semibold">Derniers clients</h2>
            <RecentClients />
          </div>
        </div>

        <nav className="mt-8 flex gap-4">
          <a href="/admin/commandes/" className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90">Voir les commandes</a>
          <a href="/admin/clients/" className="rounded-lg bg-secondary px-4 py-2 text-sm text-secondary-foreground hover:bg-secondary/90">Voir les clients</a>
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

function RecentOrders() {
  const orders = [
    { id: 'JBL-240615-001', client: 'Jean Dupont', total: 24.90, status: 'payée' },
    { id: 'JBL-240620-002', client: 'Marie Cohen', total: 89.00, status: 'en préparation' }
  ];

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.id} className="flex items-center justify-between rounded-lg bg-accent/30 px-4 py-3">
          <div>
            <p className="text-sm font-medium">{o.id}</p>
            <p className="text-xs text-muted-foreground">{o.client}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">{o.total.toFixed(2)} €</p>
            <span className={`inline-block rounded px-2 py-0.5 text-xs ${o.status === 'payée' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{o.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentClients() {
  const clients = [
    { name: 'Jean Dupont', email: 'jean.dupont@example.fr', orders: 1 },
    { name: 'Marie Cohen', email: 'marie.cohen@example.com', orders: 1 }
  ];

  return (
    <div className="space-y-3">
      {clients.map((c) => (
        <div key={c.email} className="flex items-center justify-between rounded-lg bg-accent/30 px-4 py-3">
          <div>
            <p className="text-sm font-medium">{c.name}</p>
            <p className="text-xs text-muted-foreground">{c.email}</p>
          </div>
          <span className="text-sm text-muted-foreground">{c.orders} commande(s)</span>
        </div>
      ))}
    </div>
  );
}
