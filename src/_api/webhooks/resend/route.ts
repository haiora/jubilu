import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emailLogs, resendWebhookEvents, campaigns } from '../../../../../db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/webhooks/resend
 * Handles Resend delivery events (delivered / opened / clicked / bounced).
 * Updates the matching email_logs row and recomputes the campaign stats.
 *
 * Resend signs webhooks via Svix headers. If RESEND_WEBHOOK_SECRET is set we
 * verify it; otherwise we accept the payload (useful in dev).
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // Optional Svix signature verification.
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (secret) {
    const ok = await verifySvix(req, rawBody, secret);
    if (!ok) {
      return NextResponse.json({ error: 'Signature invalide.' }, { status: 401 });
    }
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 });
  }

  const type: string = event?.type ?? '';
  const resendId: string | undefined = event?.data?.email_id ?? event?.data?.id;
  const now = new Date().toISOString();

  try {
    // Find the related email log (if any) by Resend id.
    let logId: string | null = null;
    if (resendId) {
      const [log] = await db.select().from(emailLogs).where(eq(emailLogs.resendId, resendId));
      if (log) {
        logId = log.id;
        const patch: Partial<typeof emailLogs.$inferInsert> = {};
        switch (type) {
          case 'email.delivered': patch.status = 'delivered'; break;
          case 'email.opened': patch.openedAt = now; patch.status = 'opened'; break;
          case 'email.clicked': patch.clickedAt = now; patch.status = 'clicked'; break;
          case 'email.bounced': patch.bouncedAt = now; patch.status = 'bounced'; break;
          case 'email.complained': patch.status = 'complained'; break;
        }
        if (Object.keys(patch).length > 0) {
          await db.update(emailLogs).set(patch).where(eq(emailLogs.id, log.id));
        }
        if (log.campaignId) {
          await recomputeCampaignStats(log.campaignId);
        }
      }
    }

    // Persist the raw event for audit/debug.
    await db.insert(resendWebhookEvents).values({
      id: `rwh_${Date.now()}`,
      type: type || 'unknown',
      emailLogId: logId,
      payload: rawBody,
      processedAt: now,
      createdAt: now,
    }).catch(() => {});

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[Resend Webhook] Erreur:', err);
    return NextResponse.json({ error: 'processing_failed' }, { status: 500 });
  }
}

async function recomputeCampaignStats(campaignId: string) {
  const logs = await db.select().from(emailLogs).where(eq(emailLogs.campaignId, campaignId));
  const stats = {
    sent: logs.length,
    delivered: logs.filter(l => l.status === 'delivered' || l.openedAt || l.clickedAt).length,
    opened: logs.filter(l => l.openedAt).length,
    clicked: logs.filter(l => l.clickedAt).length,
    unsubscribed: 0,
    bounced: logs.filter(l => l.bouncedAt).length,
  };
  await db.update(campaigns).set({ stats: JSON.stringify(stats) }).where(eq(campaigns.id, campaignId));
}

/**
 * Minimal Svix signature verification (HMAC-SHA256 over `${id}.${timestamp}.${body}`).
 */
async function verifySvix(req: NextRequest, body: string, secret: string): Promise<boolean> {
  try {
    const id = req.headers.get('svix-id');
    const timestamp = req.headers.get('svix-timestamp');
    const signature = req.headers.get('svix-signature');
    if (!id || !timestamp || !signature) return false;

    const secretBytes = Uint8Array.from(atob(secret.replace(/^whsec_/, '')), c => c.charCodeAt(0));
    const key = await crypto.subtle.importKey(
      'raw',
      secretBytes,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signedContent = `${id}.${timestamp}.${body}`;
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedContent));
    const sigBytes = new Uint8Array(sig);
    let binary = '';
    for (let i = 0; i < sigBytes.length; i++) binary += String.fromCharCode(sigBytes[i]);
    const expected = btoa(binary);

    // Header format: "v1,<sig> v1,<sig2> ..."
    return signature.split(' ').some(part => part.split(',')[1] === expected);
  } catch {
    return false;
  }
}
