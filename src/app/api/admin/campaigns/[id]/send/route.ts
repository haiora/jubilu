import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaigns, contacts, emailLogs } from "@db/schema";
import { eq, and } from 'drizzle-orm';
import { getSession, can } from '@/lib/auth';
import { unsubscribeUrl } from '@/lib/email';
import { Resend } from 'resend';

const UNSUB_LABEL: Record<string, string> = { fr: 'Se désabonner', en: 'Unsubscribe', es: 'Darse de baja', he: 'הסרה מרשימת התפוצה' };

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * GET /api/admin/campaigns/[id]/send
 * Sends a draft campaign to all consenting contacts, then redirects back to the
 * campaigns dashboard. Triggered by the "Envoyer maintenant" link.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!can(session, 'campaigns')) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  const dashboardUrl = new URL('/admin/campagnes', req.url);

  try {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, params.id));
    if (!campaign) {
      dashboardUrl.searchParams.set('error', 'not_found');
      return NextResponse.redirect(dashboardUrl);
    }

    if (campaign.status === 'sent') {
      dashboardUrl.searchParams.set('error', 'already_sent');
      return NextResponse.redirect(dashboardUrl);
    }

    const eligible = await db
      .select()
      .from(contacts)
      .where(and(eq(contacts.emailConsent, true)));

    let sent = 0;
    let failed = 0;
    const now = new Date().toISOString();

    for (const contact of eligible) {
      try {
        if (resend) {
          const loc = contact.locale ?? campaign.locale ?? 'fr';
          const greeting = `<p>Bonjour ${contact.firstName ?? 'Ami'},</p>`;
          const body = campaign.body ? `<div style="margin-top:16px;">${campaign.body}</div>` : '';
          const unsub = `<p style="margin-top:24px;font-size:12px;color:#8a8170;text-align:center;"><a href="${unsubscribeUrl(contact.email, loc)}" style="color:#8a8170;">${UNSUB_LABEL[loc] ?? UNSUB_LABEL.fr}</a></p>`;
          const html = greeting + body + unsub;
          const result = await resend.emails.send({
            from: process.env.EMAIL_FROM ?? "Jubilé d'Israël <noreply@jubilee-israel.org>",
            to: contact.email,
            subject: campaign.subject,
            html,
          });
          await db.insert(emailLogs).values({
            id: `log_${Date.now()}_${contact.id}`,
            campaignId: campaign.id,
            contactId: contact.id,
            type: 'campaign',
            resendId: result.data?.id ?? null,
            status: 'sent',
            createdAt: new Date().toISOString(),
          }).catch(() => {});
        }
        sent++;
      } catch {
        failed++;
      }
    }

    await db.update(campaigns)
      .set({
        status: 'sent',
        sentAt: now,
        stats: JSON.stringify({ sent, delivered: sent, opened: 0, clicked: 0, unsubscribed: 0, bounced: failed }),
      })
      .where(eq(campaigns.id, campaign.id));

    dashboardUrl.searchParams.set('sent', String(sent));
    return NextResponse.redirect(dashboardUrl);
  } catch (err: any) {
    console.error('[Campaign Send Error]', err);
    dashboardUrl.searchParams.set('error', 'send_failed');
    return NextResponse.redirect(dashboardUrl);
  }
}
