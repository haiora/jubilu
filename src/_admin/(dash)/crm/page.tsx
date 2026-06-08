import { redirect } from 'next/navigation';
import { Download, Check, X, UserPlus } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { getAdminLocale } from '@/lib/admin-i18n';
import { getSession, can } from '@/lib/auth';
import { db } from '@/lib/db';
import { contacts } from '../../../../../db/schema';
import { desc } from 'drizzle-orm';
import ImportContactsButton from '@/components/admin/import-contacts-button';

function formatEUR(cents: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

const STATUS_COLORS: Record<string, string> = {
  client: 'bg-green-100 text-green-800',
  lead: 'bg-amber-100 text-amber-800',
  donateur: 'bg-blue-100 text-blue-800'
};

export default async function CrmPage() {
  const session = getSession();
  if (!can(session, 'crm')) redirect('/admin');
  const t = await getTranslations({ locale: getAdminLocale(), namespace: 'admin' });

  const allContacts = await db.select().from(contacts).orderBy(desc(contacts.createdAt));

  const stats = {
    total: allContacts.length,
    clients: allContacts.filter(c => c.status === 'client').length,
    leads: allContacts.filter(c => c.status === 'lead').length,
    donateurs: allContacts.filter(c => c.status === 'donateur').length,
    withConsent: allContacts.filter(c => c.emailConsent).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold">{t('crm.title')}</h1>
          <p className="text-muted-foreground">{t('crm.subtitle', { n: allContacts.length })}</p>
        </div>
        <div className="flex gap-2">
          <ImportContactsButton label={t('common.import')} />
          <a href="/api/admin/crm/export" className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-medium text-gold-foreground hover:opacity-90">
            <Download className="h-4 w-4" /> {t('common.export')}
          </a>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: t('crm.totalLabel'), value: stats.total },
          { label: t('contactStatus.client'), value: stats.clients, cls: 'text-green-700' },
          { label: t('contactStatus.lead'), value: stats.leads, cls: 'text-amber-700' },
          { label: t('contactStatus.donateur'), value: stats.donateurs, cls: 'text-blue-700' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card px-4 py-3">
            <p className={`font-serif text-2xl font-semibold ${s.cls ?? ''}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
              <th className="p-4 text-start">{t('crm.colContact')}</th>
              <th className="p-4 text-start">{t('crm.colCountry')}</th>
              <th className="p-4 text-start">{t('crm.colStatus')}</th>
              <th className="p-4 text-center">{t('crm.colConsent')}</th>
              <th className="p-4 text-end">{t('crm.colTotal')}</th>
              <th className="p-4 text-end">{t('crm.colOrders')}</th>
            </tr>
          </thead>
          <tbody>
            {allContacts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-muted-foreground">
                  <UserPlus className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  <p>{t('crm.emptyState')}</p>
                </td>
              </tr>
            ) : (
              allContacts.map((c) => (
                <tr key={c.id} className="border-b border-border/60 last:border-0 hover:bg-accent/30 transition-colors">
                  <td className="p-4">
                    <a href={`/admin/crm/${c.id}`} className="block">
                      <span className="font-medium text-primary hover:underline">{c.firstName} {c.lastName}</span>
                      <span className="block text-xs text-muted-foreground">{c.email}</span>
                    </a>
                  </td>
                  <td className="p-4 text-muted-foreground">{c.country ?? '—'}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[c.status] ?? 'bg-muted text-muted-foreground'}`}>
                      {t(`contactStatus.${c.status}`)}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {c.emailConsent
                      ? <Check className="mx-auto h-4 w-4 text-green-600" />
                      : <X className="mx-auto h-4 w-4 text-red-500" />}
                  </td>
                  <td className="p-4 text-end font-medium">{formatEUR(c.totalSpent)}</td>
                  <td className="p-4 text-end text-muted-foreground">{c.ordersCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}