export const dynamic = 'force-dynamic';

import { Euro, ShoppingCart, Users, MailOpen, TrendingUp } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { getAdminLocale } from '@/lib/admin-i18n';
import { db } from '@/lib/db';
import { orders, contacts, campaigns, orderItems } from '../../../../db/schema';
import { sql, eq, desc } from 'drizzle-orm';
import { ORDER_STATUS_COLORS, type OrderStatus } from '@/lib/demo-data';

function formatEUR(cents: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

const STATUSES: OrderStatus[] = ['pending', 'paid', 'prepared', 'shipped', 'delivered', 'cancelled'];

export default async function DashboardPage() {
  const t = await getTranslations({ locale: getAdminLocale(), namespace: 'admin' });

  // Fetch real data from DB
  const [allOrders, allContacts, allCampaigns] = await Promise.all([
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(50),
    db.select().from(contacts),
    db.select().from(campaigns).where(eq(campaigns.status, 'sent')),
  ]);

  // Compute stats
  const revenue = allOrders
    .filter(o => o.status !== 'cancelled' && o.status !== 'pending')
    .reduce((s, o) => s + o.total, 0);

  const byStatus = allOrders.reduce((acc, o) => {
    acc[o.status as OrderStatus] = (acc[o.status as OrderStatus] ?? 0) + 1;
    return acc;
  }, {} as Record<OrderStatus, number>);

  const avgCart = allOrders.length
    ? Math.round(allOrders.reduce((s, o) => s + o.total, 0) / allOrders.length)
    : 0;

  const newContacts = allContacts.filter(c => c.createdAt >= '2026-01-01').length;

  const sentStats = allCampaigns.map(c => {
    const s = c.stats ? JSON.parse(c.stats) : {};
    return { name: c.name, sent: s.sent ?? 0, opened: s.opened ?? 0 };
  });

  const totalSent = sentStats.reduce((s, c) => s + c.sent, 0);
  const totalOpened = sentStats.reduce((s, c) => s + c.opened, 0);
  const openRate = totalSent ? Math.round((totalOpened / totalSent) * 100) : 0;

  const recent = allOrders.slice(0, 5);

  // Fetch contact names for recent orders
  const contactMap = Object.fromEntries(allContacts.map(c => [c.id, `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim()]));

  const cards = [
    { label: t('dashboard.revenue'), value: formatEUR(revenue), icon: Euro, hint: t('dashboard.revenueHint') },
    { label: t('dashboard.orders'), value: String(allOrders.length), icon: ShoppingCart, hint: t('dashboard.avgCartHint', { v: formatEUR(avgCart) }) },
    { label: t('dashboard.contacts'), value: String(allContacts.length), icon: Users, hint: t('dashboard.newContactsHint', { n: newContacts }) },
    { label: t('dashboard.openRate'), value: `${openRate}%`, icon: MailOpen, hint: t('dashboard.emailsSentHint', { n: totalSent }) }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{c.label}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-primary">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-3 font-serif text-2xl font-semibold">{c.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{c.hint}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-semibold">{t('dashboard.byStatus')}</h2>
          <div className="mt-4 space-y-2">
            {STATUSES.map((s) => (
              <div key={s} className="flex items-center justify-between">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${ORDER_STATUS_COLORS[s]}`}>
                  {t(`status.${s}`)}
                </span>
                <span className="text-sm font-medium">{byStatus[s] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold"><TrendingUp className="h-4 w-4 text-secondary" /> {t('dashboard.campaignPerf')}</h2>
          <div className="mt-4 space-y-3">
            {sentStats.length === 0 && (
              <p className="text-sm text-muted-foreground">{t('campaigns.noSent')}</p>
            )}
            {sentStats.map((c, i) => {
              const rate = c.sent ? Math.round((c.opened / c.sent) * 100) : 0;
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm">
                    <span className="truncate">{c.name}</span>
                    <span className="font-medium">{rate}%</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-gold transition-all" style={{ width: `${rate}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-semibold">{t('dashboard.recentOrders')}</h2>
        <div className="mt-4 overflow-x-auto">
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">{t('orders.empty')}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-start text-xs uppercase text-muted-foreground">
                  <th className="py-2 text-start">{t('dashboard.colNumber')}</th>
                  <th className="py-2 text-start">{t('dashboard.colCustomer')}</th>
                  <th className="py-2 text-start">{t('dashboard.colStatus')}</th>
                  <th className="py-2 text-end">{t('dashboard.colTotal')}</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id} className="border-b border-border/60 hover:bg-accent/20">
                    <td className="py-3 font-mono text-xs">{o.number}</td>
                    <td className="py-3">{contactMap[o.contactId ?? ''] ?? '—'}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ORDER_STATUS_COLORS[o.status as OrderStatus] ?? 'bg-muted text-muted-foreground'}`}>
                        {t(`status.${o.status}`)}
                      </span>
                    </td>
                    <td className="py-3 text-end font-medium">{formatEUR(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
