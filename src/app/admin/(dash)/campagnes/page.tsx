export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { Mail, Plus, Send, Clock, FileEdit, MailOpen, MousePointerClick, Users, AlertCircle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { getAdminLocale } from '@/lib/admin-i18n';
import { getSession, can } from '@/lib/auth';
import { db } from '@/lib/db';
import { campaigns, contacts } from '../../../../../db/schema';
import { desc } from 'drizzle-orm';
import NewCampaignButton from '@/components/admin/new-campaign-button';

type CampaignStatus = 'sent' | 'scheduled' | 'draft';

const STATUS: Record<CampaignStatus, { cls: string; icon: React.ElementType; labelKey: string }> = {
  sent:      { cls: 'bg-green-100 text-green-800', icon: Send, labelKey: 'campaigns.sent' },
  scheduled: { cls: 'bg-blue-100 text-blue-800',  icon: Clock, labelKey: 'campaigns.scheduled' },
  draft:     { cls: 'bg-muted text-muted-foreground', icon: FileEdit, labelKey: 'campaigns.draft' }
};

function pct(n: number, d: number) { return d ? Math.round((n / d) * 100) : 0; }

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="text-center">
      <Icon className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
      <p className="font-serif text-xl font-semibold text-primary">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export default async function CampaignsPage() {
  const session = getSession();
  if (!can(session, 'campaigns')) redirect('/admin');
  const locale = getAdminLocale();
  const t = await getTranslations({ locale, namespace: 'admin' });

  const [allCampaigns, totalContacts] = await Promise.all([
    db.select().from(campaigns).orderBy(desc(campaigns.createdAt)),
    db.select().from(contacts),
  ]);

  const consentCount = totalContacts.filter(c => c.emailConsent).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold">{t('campaigns.title')}</h1>
          <p className="text-muted-foreground">{t('campaigns.subtitle')}</p>
        </div>
        <NewCampaignButton label={t('campaigns.new')} contactCount={consentCount} />
      </div>

      {/* Audience info */}
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-3 text-sm">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">
          {t('campaigns.audience')} : <strong className="text-primary">{consentCount}</strong> {t('campaigns.withConsent')}
          <span className="ml-2 text-muted-foreground">/ {totalContacts.length} total</span>
        </span>
      </div>

      {allCampaigns.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
          <Mail className="mx-auto mb-3 h-10 w-10 opacity-20" />
          <p className="text-muted-foreground">{t('campaigns.empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allCampaigns.map((c) => {
            const st = STATUS[c.status as CampaignStatus] ?? STATUS.draft;
            const StIcon = st.icon;
            const stLabel = t(st.labelKey);
            const stats = c.stats ? JSON.parse(c.stats) : {};
            return (
              <div key={c.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary shrink-0">
                      <Mail className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="font-semibold">{c.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        « {c.subject} »
                        {c.locale && <> · <span className="uppercase">{c.locale}</span></>}
                        {c.sentAt && <> · {new Date(c.sentAt).toLocaleDateString(locale)}</>}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${st.cls}`}>
                    <StIcon className="h-3.5 w-3.5" /> {stLabel}
                  </span>
                </div>

                {c.status === 'sent' && stats.sent > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border/60 pt-4 sm:grid-cols-5">
                    <Stat label={t('campaigns.mSent')} value={(stats.sent ?? 0).toLocaleString(locale)} icon={Send} />
                    <Stat label={t('campaigns.mDelivered')} value={`${pct(stats.delivered, stats.sent)}%`} icon={Mail} />
                    <Stat label={t('campaigns.mOpened')} value={`${pct(stats.opened, stats.sent)}%`} icon={MailOpen} />
                    <Stat label={t('campaigns.mClicked')} value={`${pct(stats.clicked, stats.sent)}%`} icon={MousePointerClick} />
                    <Stat label={t('campaigns.mUnsub')} value={String(stats.unsubscribed ?? 0)} icon={AlertCircle} />
                  </div>
                )}
                {c.status === 'draft' && (
                  <div className="mt-3 flex gap-2 border-t border-border/60 pt-3">
                    <span className="text-xs text-muted-foreground">{t('campaigns.draftHint')}</span>
                    <a href={`/api/admin/campaigns/${c.id}/send`} className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-xs font-medium text-gold-foreground hover:opacity-90">
                      <Send className="h-3 w-3" /> {t('campaigns.sendNow')}
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
