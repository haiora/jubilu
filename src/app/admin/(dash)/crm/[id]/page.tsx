export const runtime = 'edge';

export const dynamic = 'force-dynamic';

import { redirect, notFound } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Globe, Tag, StickyNote, ShoppingBag } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { getAdminLocale } from '@/lib/admin-i18n';
import { getSession, can } from '@/lib/auth';
import { db } from '@/lib/db';
import { contacts, orders, contactNotes, contactTags, tags as tagsTable } from '../../../../../../db/schema';
import { eq, desc } from 'drizzle-orm';
import AddNoteForm from '@/components/admin/add-note-form';
import ContactTags from '@/components/admin/contact-tags';

function formatEUR(cents: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-800',
  paid:      'bg-blue-100 text-blue-800',
  prepared:  'bg-indigo-100 text-indigo-800',
  shipped:   'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default async function ContactDetailPage({ params }: { params: { id: string } }) {
  const session = getSession();
  if (!can(session, 'crm')) redirect('/admin');
  const locale = getAdminLocale();
  const t = await getTranslations({ locale, namespace: 'admin' });

  const [contact] = await db.select().from(contacts).where(eq(contacts.id, params.id));
  if (!contact) notFound();

  const [contactOrders, rawNotes, tagRows] = await Promise.all([
    db.select().from(orders).where(eq(orders.contactId, contact.id)).orderBy(desc(orders.createdAt)),
    db.select().from(contactNotes).where(eq(contactNotes.contactId, contact.id)).orderBy(desc(contactNotes.createdAt)),
    db
      .select({ name: tagsTable.name })
      .from(contactTags)
      .innerJoin(tagsTable, eq(contactTags.tagId, tagsTable.id))
      .where(eq(contactTags.contactId, contact.id))
  ]);

  const tags: string[] = tagRows.map(row => row.name);
  const notes = rawNotes.map(n => n.body);

  return (
    <div className="space-y-6">
      <a href="/admin/crm" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t('contact.back')}
      </a>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold">{contact.firstName} {contact.lastName}</h1>
          <p className="text-muted-foreground">
            {t('contact.clientSince', { 
              d: new Date(contact.createdAt).toLocaleDateString(locale), 
              s: contact.source ?? 'inconnu'
            })}
          </p>
        </div>
        <a
          href={`mailto:${contact.email}`}
          className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-medium text-gold-foreground transition-opacity hover:opacity-90"
        >
          <Mail className="h-4 w-4" /> {t('contact.sendEmail')}
        </a>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">{t('contact.details')}</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" /> 
                <span className={contact.emailConsent ? 'text-primary' : 'text-muted-foreground line-through'}>
                  {contact.email}
                </span>
                {!contact.emailConsent && <span className="text-xs text-red-500 ml-1">(Désabonné)</span>}
              </li>
              {contact.phone && <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {contact.phone}</li>}
              <li className="flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground" /> {contact.country ?? 'Inconnu'} · {contact.locale.toUpperCase()}</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 font-semibold"><Tag className="h-4 w-4" /> {t('contact.tags')}</h2>
            <ContactTags
              contactId={contact.id}
              initialTags={tags}
              addLabel={t('contact.add')}
              emptyLabel="Aucun tag"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
              <p className="font-serif text-2xl font-semibold text-primary">{contact.ordersCount}</p>
              <p className="text-xs text-muted-foreground">{t('contact.ordersCount')}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
              <p className="font-serif text-2xl font-semibold text-primary">{formatEUR(contact.totalSpent)}</p>
              <p className="text-xs text-muted-foreground">{t('contact.totalSpent')}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 font-semibold"><ShoppingBag className="h-4 w-4" /> {t('contact.history')}</h2>
            {contactOrders.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <ShoppingBag className="mx-auto mb-2 h-8 w-8 opacity-20" />
                <p className="text-sm">{t('contact.noOrders')}</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {contactOrders.map((o) => (
                  <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 p-3 text-sm hover:bg-accent/30 transition-colors">
                    <div>
                      <span className="font-mono text-xs font-semibold">{o.number}</span>
                      <span className="ms-3 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString(locale)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ORDER_STATUS_COLORS[o.status]}`}>{t(`status.${o.status}`)}</span>
                      <span className="font-medium text-primary">{formatEUR(o.total)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 font-semibold"><StickyNote className="h-4 w-4" /> {t('contact.notes')}</h2>
            {notes.length > 0 ? (
              <ul className="space-y-2">
                {notes.map((n: string, i: number) => (
                  <li key={i} className="rounded-xl bg-muted/50 p-3 text-sm">{n}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic mb-2">{t('contact.noNotes')}</p>
            )}
            <AddNoteForm contactId={contact.id} placeholder={t('contact.addNote')} />
          </div>
        </div>
      </div>
    </div>
  );
}