export const runtime = 'edge';

export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { ScrollText, Package } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { getAdminLocale } from '@/lib/admin-i18n';
import { getSession, can } from '@/lib/auth';
import { db } from '@/lib/db';
import { orders, contacts, orderItems } from '../../../../../db/schema';
import { desc, eq } from 'drizzle-orm';
import { ORDER_STATUS_COLORS, type OrderStatus } from '@/lib/demo-data';
import OrderStatusSelect from '@/components/admin/order-status-select';

function formatEUR(cents: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

const STATUSES: OrderStatus[] = ['pending', 'paid', 'prepared', 'shipped', 'delivered', 'cancelled'];

export default async function OrdersPage() {
  const session = getSession();
  if (!can(session, 'orders')) redirect('/admin');
  const locale = getAdminLocale();
  const t = await getTranslations({ locale, namespace: 'admin' });

  const [allOrders, allContacts, allItems] = await Promise.all([
    db.select().from(orders).orderBy(desc(orders.createdAt)),
    db.select().from(contacts),
    db.select().from(orderItems),
  ]);

  const statusOptions = STATUSES.map(s => ({ value: s, label: t(`status.${s}`) }));

  const contactMap = Object.fromEntries(
    allContacts.map(c => [c.id, { name: `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim(), country: c.country }])
  );
  const itemsByOrder = allItems.reduce((acc, item) => {
    if (!acc[item.orderId]) acc[item.orderId] = [];
    acc[item.orderId].push(item);
    return acc;
  }, {} as Record<string, typeof allItems>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold">{t('orders.title')}</h1>
        <p className="text-muted-foreground">{t('orders.subtitle', { n: allOrders.length })}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">{t('common.all')}</span>
        {STATUSES.map((s) => (
          <span key={s} className={`rounded-full px-3 py-1 text-xs font-medium ${ORDER_STATUS_COLORS[s]}`}>
            {t(`status.${s}`)}
          </span>
        ))}
      </div>

      {allOrders.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card py-16 text-center">
          <Package className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p className="text-muted-foreground">{t('orders.empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allOrders.map((o) => {
            const contact = contactMap[o.contactId ?? ''];
            const items = itemsByOrder[o.id] ?? [];
            return (
              <div key={o.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold">{o.number}</span>
                      <OrderStatusSelect orderId={o.id} current={o.status} options={statusOptions} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {contact?.name ?? '—'} · {contact?.country ?? '—'} · {new Date(o.createdAt).toLocaleDateString(locale)}
                    </p>
                  </div>
                  <div className="text-end">
                    <span className="text-lg font-semibold text-primary">{formatEUR(o.total)}</span>
                    {o.shipping > 0 && (
                      <p className="text-xs text-muted-foreground">{t('orders.shippingIncluded', { v: formatEUR(o.shipping) })}</p>
                    )}
                  </div>
                </div>

                {items.length > 0 && (
                  <ul className="mt-3 space-y-1 border-t border-border/60 pt-3 text-sm">
                    {items.map((it) => (
                      <li key={it.id} className="flex items-center gap-2 text-muted-foreground">
                        <span>{it.qty} × {it.nameSnapshot}</span>
                        {it.customText && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs text-primary">
                            <ScrollText className="h-3 w-3" /> « {it.customText} »
                          </span>
                        )}
                        {it.productionStatus && (
                          <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs">
                            {t(`production.${it.productionStatus}`)}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}