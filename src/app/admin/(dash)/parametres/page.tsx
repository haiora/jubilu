export const runtime = 'edge';

export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { CheckCircle2, XCircle, ShieldCheck, History, Key, Database, Mail, CreditCard } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { getAdminLocale } from '@/lib/admin-i18n';
import { getSession, can, ROLE_PERMISSIONS, type Role, type Permission } from '@/lib/auth';
import { db } from '@/lib/db';
import { auditLogs, users } from '../../../../../db/schema';
import { desc } from 'drizzle-orm';

const ALL_PERMISSIONS: Permission[] = ['dashboard', 'orders', 'stock', 'products', 'crm', 'clients', 'campaigns', 'settings'];

export default async function SettingsPage() {
  const session = getSession();
  if (!can(session, 'settings')) redirect('/admin');
  const t = await getTranslations({ locale: getAdminLocale(), namespace: 'admin' });

  const [recentLogs, adminUsers] = await Promise.all([
    db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(10).catch(() => []),
    db.select({ id: users.id, email: users.email, name: users.name, active: users.active, createdAt: users.createdAt }).from(users).limit(20).catch(() => []),
  ]);

  const integrations = [
    { name: 'Resend (emails)', ok: Boolean(process.env.RESEND_API_KEY), icon: Mail, hint: process.env.RESEND_API_KEY ? t('settings.configured') : t('settings.addKeyHint', { k: 'RESEND_API_KEY' }) },
    { name: 'Stripe (paiement)', ok: Boolean(process.env.STRIPE_SECRET_KEY), icon: CreditCard, hint: process.env.STRIPE_SECRET_KEY ? t('settings.configured') : t('settings.addKeyHint', { k: 'STRIPE_SECRET_KEY' }) },
    { name: 'Cloudflare D1 (base de données)', ok: true, icon: Database, hint: t('settings.localDbActive') },
  ];

  const roles = Object.keys(ROLE_PERMISSIONS) as Role[];
  const permissions = ALL_PERMISSIONS;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      {/* Integrations */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="flex items-center gap-2 font-semibold"><Key className="h-4 w-4" /> {t('settings.integrations')}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {integrations.map((i) => {
            const Icon = i.icon;
            return (
              <div key={i.name} className="flex items-start gap-3 rounded-xl border border-border/60 p-4">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{i.name}</p>
                    {i.ok ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" /> : <XCircle className="h-4 w-4 text-amber-500 shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{i.hint}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Roles & Permissions */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4" /> {t('settings.rolesPerms')}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                <th className="p-2 text-start">{t('settings.colRole')}</th>
                {permissions.map((p) => <th key={p} className="p-2 text-center">{t(`perms.${p}`)}</th>)}
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r} className="border-b border-border/60 hover:bg-accent/20">
                  <td className="p-2 font-medium">{t(`roles.${r}`)}</td>
                  {permissions.map((p) => (
                    <td key={p} className="p-2 text-center">
                      {ROLE_PERMISSIONS[r].includes(p)
                        ? <CheckCircle2 className="mx-auto h-4 w-4 text-green-600" />
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Admin Users */}
      {adminUsers.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-semibold">{t('settings.adminUsers')}</h2>
          <ul className="mt-4 divide-y divide-border/60">
            {adminUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${u.active ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}`}>
                    {u.active ? t('common.active') : t('common.inactive')}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Audit Logs */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="flex items-center gap-2 font-semibold"><History className="h-4 w-4" /> {t('settings.audit')}</h2>
        {recentLogs.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">{t('settings.noAudit')}</p>
        ) : (
          <ul className="mt-4 divide-y divide-border/60">
            {recentLogs.map((log) => (
              <li key={log.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span>
                  <strong>{log.userId ?? t('settings.system')}</strong> · {log.action}
                  {log.entity && <span className="text-muted-foreground"> ({log.entity})</span>}
                </span>
                <span className="font-mono text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString(getAdminLocale())}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}