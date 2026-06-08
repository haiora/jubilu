'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, Clock, CheckCircle } from 'lucide-react';

const ORDERS = [
  {
    id: 'JBL-240615-001',
    client: 'Jean Dupont',
    email: 'jean.dupont@example.fr',
    date: '15/06/2024',
    total: 2490,
    status: 'payée',
    items: [{ name: 'Vin rouge Galilée', qty: 1, price: 2490 }]
  },
  {
    id: 'JBL-240620-002',
    client: 'Marie Cohen',
    email: 'marie.cohen@example.com',
    date: '20/06/2024',
    total: 8900,
    status: 'en préparation',
    items: [{ name: 'Parchemin personnalisé – Jérusalem', qty: 1, price: 8900 }]
  }
];

export default function OrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.replace('/admin/login/');
      return;
    }
    const u = localStorage.getItem('admin_user');
    if (u) setUser(JSON.parse(u));
  }, [router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-border bg-white">
        <div className="container flex items-center gap-4 py-4">
          <a href="/admin/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Retour
          </a>
          <h1 className="text-lg font-semibold">Commandes</h1>
        </div>
      </header>

      <main className="container py-8">
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-accent/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium">N°</th>
                <th className="px-4 py-3 text-left font-medium">Client</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Articles</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 text-left font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {ORDERS.map((order) => (
                <tr key={order.id} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs">{order.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.client}</p>
                    <p className="text-xs text-muted-foreground">{order.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{order.date}</td>
                  <td className="px-4 py-3">
                    {order.items.map((item, i) => (
                      <p key={i} className="text-xs">{item.qty}x {item.name}</p>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{(order.total / 100).toFixed(2)} €</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: React.ElementType; className: string }> = {
    'payée': { icon: CheckCircle, className: 'bg-green-100 text-green-700' },
    'en préparation': { icon: Package, className: 'bg-blue-100 text-blue-700' },
    'en attente': { icon: Clock, className: 'bg-amber-100 text-amber-700' }
  };
  const c = config[status] || config['en attente'];
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs ${c.className}`}>
      <Icon className="h-3 w-3" /> {status}
    </span>
  );
}
