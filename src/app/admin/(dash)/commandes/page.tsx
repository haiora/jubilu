'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { getAdminOrders, updateOrderStatus } from '@/lib/api-client';

const statusConfig: Record<string, { icon: React.ElementType; className: string; label: string }> = {
  pending: { icon: Clock, className: 'bg-amber-100 text-amber-700', label: 'En attente' },
  paid: { icon: CheckCircle, className: 'bg-blue-100 text-blue-700', label: 'Payée' },
  prepared: { icon: Package, className: 'bg-indigo-100 text-indigo-700', label: 'En préparation' },
  shipped: { icon: Truck, className: 'bg-purple-100 text-purple-700', label: 'Expédiée' },
  delivered: { icon: CheckCircle, className: 'bg-green-100 text-green-700', label: 'Livrée' },
  cancelled: { icon: XCircle, className: 'bg-red-100 text-red-700', label: 'Annulée' }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    getAdminOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const formatEUR = (cents: number) => `${(cents / 100).toFixed(2)} €`;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString();

  const changeStatus = async (id: string, status: string) => {
    await updateOrderStatus(id, status);
    load();
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
        <div className="container flex items-center gap-4 py-4">
          <a href="/admin/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Retour
          </a>
          <h1 className="text-lg font-semibold">Commandes ({orders.length})</h1>
        </div>
      </header>

      <main className="container py-8">
        {orders.length === 0 ? (
          <div className="rounded-xl border border-border bg-white p-12 text-center text-muted-foreground">
            Aucune commande pour le moment.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-white">
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
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-border">
                    <td className="px-4 py-3 font-mono text-xs">{order.number}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.contact?.firstName || order.contact?.lastName ? `${order.contact.firstName ?? ''} ${order.contact.lastName ?? ''}`.trim() : '—'}</p>
                      <p className="text-xs text-muted-foreground">{order.contact?.email ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{fmtDate(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      {(order.items || []).map((item: any, i: number) => (
                        <p key={i} className="text-xs">{item.qty}x {item.nameSnapshot}</p>
                      ))}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{formatEUR(order.total)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                      <select
                        value={order.status}
                        onChange={(e) => changeStatus(order.id, e.target.value)}
                        className="mt-1 block w-full rounded-md border border-border bg-white px-2 py-1 text-xs outline-none"
                      >
                        {Object.entries(statusConfig).map(([key, cfg]) => (
                          <option key={key} value={key}>{cfg.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const c = statusConfig[status] || statusConfig.pending;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs ${c.className}`}>
      <Icon className="h-3 w-3" /> {c.label}
    </span>
  );
}
