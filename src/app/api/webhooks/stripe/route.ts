import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { contacts, orders, orderItems, productVariants } from "@db/schema";
import { eq, sql } from 'drizzle-orm';
import { sendEmail, getOrderConfirmationEmail } from '@/lib/email';
import { formatPrice } from '@/lib/catalog';
import type { Locale } from '@/i18n/routing';
import type { InferSelectModel } from 'drizzle-orm';

type OrderItem = InferSelectModel<typeof orderItems>;

export const dynamic = 'force-dynamic';
// Stripe needs the raw body to verify the signature; disable Next body parsing.
export const runtime = 'nodejs';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' as any }) : null;

/**
 * POST /api/webhooks/stripe
 * Receives Stripe events. On `checkout.session.completed`, marks the matching
 * order as paid, promotes the contact to "client", updates aggregates, decrements
 * stock and sends the order-confirmation email.
 */
export async function POST(req: NextRequest) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe non configuré.' }, { status: 503 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Signature manquante.' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error('[Stripe Webhook] Signature invalide:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await fulfillOrder(session);
    }
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[Stripe Webhook] Traitement échoué:', err);
    return NextResponse.json({ error: 'processing_failed' }, { status: 500 });
  }
}

async function fulfillOrder(session: Stripe.Checkout.Session) {
  const orderNumber = session.metadata?.orderNumber;
  if (!orderNumber) {
    console.warn('[Stripe Webhook] orderNumber absent des metadata.');
    return;
  }

  const [order] = await db.select().from(orders).where(eq(orders.number, orderNumber));
  if (!order) {
    console.warn(`[Stripe Webhook] Commande ${orderNumber} introuvable.`);
    return;
  }

  // Idempotence : ne pas retraiter une commande déjà payée.
  if (order.status === 'paid' || order.status === 'shipped' || order.status === 'delivered') {
    return;
  }

  // 1. Marquer la commande payée.
  await db.update(orders).set({ status: 'paid' }).where(eq(orders.id, order.id));

  // 2. Promouvoir le contact et mettre à jour les agrégats.
  if (order.contactId) {
    await db
      .update(contacts)
      .set({
        status: 'client',
        ordersCount: sql`${contacts.ordersCount} + 1`,
        totalSpent: sql`${contacts.totalSpent} + ${order.total}`,
      })
      .where(eq(contacts.id, order.contactId));
  }

  // 3. Décrémenter le stock pour les variantes liées.
  const items: OrderItem[] = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  for (const item of items) {
    if (item.variantId) {
      await db
        .update(productVariants)
        .set({ stock: sql`MAX(0, ${productVariants.stock} - ${item.qty})` })
        .where(eq(productVariants.id, item.variantId));
    }
  }

  // 4. Email de confirmation.
  if (order.contactId) {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, order.contactId));
    if (contact?.email) {
      const locale = (order.locale ?? 'fr') as Locale;
      const itemsHtml = items
        .map(
          (it) => `<li style="padding: 8px 0; border-bottom: 1px solid #eee;">
            <strong>${it.qty} × ${it.nameSnapshot}</strong>
            <span style="float: right;">${formatPrice(it.unitPrice * it.qty, locale)}</span>
            ${it.customText ? `<br/><em style="color: #666; font-size: 13px;">« ${it.customText} »</em>` : ''}
          </li>`
        )
        .join('');

      const email = getOrderConfirmationEmail(
        locale,
        contact.firstName || 'Ami',
        order.number,
        itemsHtml,
        formatPrice(order.total, locale)
      );

      await sendEmail({ to: contact.email, subject: email.subject, html: email.html }).catch((e) =>
        console.warn('[Stripe Webhook] Email confirmation échoué:', e)
      );
    }
  }
}
