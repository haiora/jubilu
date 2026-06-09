import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaigns, contacts, emailLogs } from "@db/schema";
import { eq, and } from 'drizzle-orm';
import { Resend } from 'resend';
import { unsubscribeUrl } from '@/lib/email';
import { getSession, can } from '@/lib/auth';

const UNSUB_LABEL: Record<string, string> = { fr: 'Se désabonner', en: 'Unsubscribe', es: 'Darse de baja', he: 'הסרה מרשימת התפוצה' };
function unsubFooter(email: string, loc: string): string {
  return `<p style="margin-top:24px;font-size:12px;color:#8a8170;text-align:center;"><a href="${unsubscribeUrl(email, loc)}" style="color:#8a8170;">${UNSUB_LABEL[loc] ?? UNSUB_LABEL.fr}</a></p>`;
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  try {
    const { name, subject, body, locale, sendNow } = await req.json();

    if (!name || !subject || !body) {
      return NextResponse.json({ error: 'Champs requis manquants (name, subject, body).' }, { status: 400 });
    }

    const id = `camp_${Date.now()}`;
    const now = new Date().toISOString();

    // Create campaign in DB
    await db.insert(campaigns).values({
      id,
      name,
      subject,
      status: sendNow ? 'sent' : 'draft',
      locale: locale ?? 'fr',
      sentAt: sendNow ? now : null,
      stats: sendNow ? JSON.stringify({ sent: 0, delivered: 0, opened: 0, clicked: 0, unsubscribed: 0, bounced: 0 }) : null,
      createdAt: now,
    });

    let sent = 0;
    let failed = 0;

    if (sendNow && resend) {
      // Fetch contacts with email consent
      const eligible = await db
        .select()
        .from(contacts)
        .where(and(eq(contacts.emailConsent, true)));

      for (const contact of eligible) {
        try {
          const personalizedBody = body
            .replace(/{{firstName}}/g, contact.firstName ?? 'Ami')
            .replace(/{{lastName}}/g, contact.lastName ?? '')
            + unsubFooter(contact.email, contact.locale ?? locale ?? 'fr');

          const result = await resend.emails.send({
            from: process.env.EMAIL_FROM ?? 'Jubilé d\'Israël <noreply@jubilee-israel.org>',
            to: contact.email,
            subject,
            html: personalizedBody,
          });

          // Log success
          await db.insert(emailLogs).values({
            id: `log_${Date.now()}_${contact.id}`,
            campaignId: id,
            contactId: contact.id,
            type: 'campaign',
            resendId: result.data?.id ?? null,
            status: 'sent',
            createdAt: new Date().toISOString(),
          }).catch(() => {});

          sent++;
        } catch (err) {
          failed++;
        }
      }

      // Update campaign stats
      await db.update(campaigns)
        .set({ stats: JSON.stringify({ sent, delivered: sent, opened: 0, clicked: 0, unsubscribed: 0, bounced: failed }) })
        .where(eq(campaigns.id, id));
    }

    return NextResponse.json({
      ok: true,
      id,
      message: sendNow
        ? `Campagne créée et envoyée à ${sent} contacts (${failed} erreurs).`
        : 'Brouillon enregistré.',
    });
  } catch (err: any) {
    console.error('[Campaign API Error]', err);
    return NextResponse.json({ error: err.message ?? 'Erreur interne.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = getSession();
  if (!can(session, 'campaigns')) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }
  const all = await db.select().from(campaigns);
  return NextResponse.json(all);
}