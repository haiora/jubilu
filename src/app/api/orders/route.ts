import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import type { Locale } from '@/i18n/routing';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { contacts, orders, orderItems, productVariants, stockMovements } from "@db/schema";
import { eq, sql } from 'drizzle-orm';
import { getShopProduct } from '@/lib/shop';
import { formatPrice } from '@/lib/catalog';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20' as any,
    })
  : null;

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const data = payload as {
    items?: { slug: string; qty: number; customText?: string }[];
    contact?: { email?: string; firstName?: string; lastName?: string; phone?: string; address?: string; zip?: string; city?: string; country?: string };
    locale?: string;
  };

  if (!data?.items?.length) {
    return NextResponse.json({ error: 'empty_cart' }, { status: 400 });
  }
  if (!data?.contact?.email) {
    return NextResponse.json({ error: 'missing_email' }, { status: 400 });
  }

  const locale = (['fr', 'en', 'es', 'he'].includes(data.locale || '') ? data.locale : 'fr') as Locale;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const orderNumber = `JBL-${Date.now().toString(36).toUpperCase()}`;

  // 1. Validation des produits & calcul du total (prix et stock depuis la DB)
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let totalCents = 0;

  const parsedItems = [];
  for (const it of data.items) {
    const product = await getShopProduct(it.slug);
    if (!product) {
      return NextResponse.json({ error: `product_not_found_${it.slug}` }, { status: 400 });
    }

    // Vérification du stock en DB
    let variantId: string | null = null;
    if (product.sku) {
      const [variant] = await db.select().from(productVariants).where(eq(productVariants.sku, product.sku));
      if (variant) {
        variantId = variant.id;
        if (variant.stock < it.qty) {
          return NextResponse.json({ error: `out_of_stock_${it.slug}` }, { status: 400 });
        }
      } else if (product.stock < it.qty) {
        return NextResponse.json({ error: `out_of_stock_${it.slug}` }, { status: 400 });
      }
    } else if (product.stock < it.qty) {
      return NextResponse.json({ error: `out_of_stock_${it.slug}` }, { status: 400 });
    }

    const name = product.translations[locale]?.name || product.translations['fr'].name;
    const finalName = it.customText ? `${name} — « ${it.customText} »` : name;

    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: {
          name: finalName,
          images: product.image ? [`${siteUrl}${product.image}`] : [],
        },
        unit_amount: product.price,
      },
      quantity: it.qty,
    });

    totalCents += product.price * it.qty;
    parsedItems.push({
      product,
      variantId,
      nameSnapshot: finalName,
      qty: it.qty,
      customText: it.customText || null
    });
  }

  // 2. Base de données : Création du contact & de la commande
  let contactId = '';
  try {
    const email = data.contact.email.toLowerCase().trim();
    const existing = await db.select().from(contacts).where(eq(contacts.email, email)).limit(1);
    
    if (existing.length > 0) {
      contactId = existing[0].id;
    } else {
      contactId = `c_${Date.now()}`;
      await db.insert(contacts).values({
        id: contactId,
        email: email,
        firstName: data.contact.firstName || null,
        lastName: data.contact.lastName || null,
        phone: data.contact.phone || null,
        country: data.contact.country || null,
        locale: locale,
        status: 'lead', // Will become client upon payment
        createdAt: new Date().toISOString()
      });
    }

    // Créer la commande en attente (pending)
    const orderId = `o_${Date.now()}`;
    await db.insert(orders).values({
      id: orderId,
      number: orderNumber,
      contactId,
      status: stripe ? 'pending' : 'paid',
      subtotal: totalCents,
      total: totalCents,
      currency: 'EUR',
      locale,
      shippingAddress: JSON.stringify({
        address: data.contact.address,
        zip: data.contact.zip,
        city: data.contact.city,
        country: data.contact.country
      }),
      createdAt: new Date().toISOString()
    });

    for (const it of parsedItems) {
      await db.insert(orderItems).values({
        id: `oi_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        orderId,
        variantId: it.variantId,
        nameSnapshot: it.nameSnapshot,
        unitPrice: it.product.price,
        qty: it.qty,
        customText: it.customText,
        productionStatus: it.product.category === 'parchemins' ? 'to_produce' : 'ready'
      });
    }

    // Sans Stripe : la commande est marquée payée immédiatement.
    // Le stock est décrémenté et le contact mis à jour (le webhook Stripe le fait en mode production).
    if (!stripe) {
      for (const it of parsedItems) {
        if (it.variantId) {
          await db.update(productVariants)
            .set({ stock: sql`MAX(0, ${productVariants.stock} - ${it.qty})` })
            .where(eq(productVariants.id, it.variantId));
          await db.insert(stockMovements).values({
            id: `sm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            variantId: it.variantId,
            delta: -it.qty,
            reason: `order ${orderNumber}`,
            authorId: null,
            createdAt: new Date().toISOString(),
          }).catch(() => {});
        }
      }
      await db.update(contacts)
        .set({
          status: 'client',
          ordersCount: sql`${contacts.ordersCount} + 1`,
          totalSpent: sql`${contacts.totalSpent} + ${totalCents}`,
        })
        .where(eq(contacts.id, contactId));
    }
  } catch (dbErr) {
    console.error('Database insertion error:', dbErr);
    return NextResponse.json({ error: 'database_error' }, { status: 500 });
  }

  // 3. Création de la session Stripe (fallback direct si clé manquante)
  let checkoutUrl: string;
  let sessionId = `sess_${Date.now()}`;

  if (stripe) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        customer_email: data.contact.email,
        success_url: `${siteUrl}/${locale}/commande/success?session_id={CHECKOUT_SESSION_ID}&order=${orderNumber}`,
        cancel_url: `${siteUrl}/${locale}/commande?error=cancelled`,
        metadata: {
          orderNumber,
          contactId,
        },
      });

      if (session.url) {
        checkoutUrl = session.url;
        sessionId = session.id;
        
        // Update order with stripe session
        await db.update(orders).set({ stripeSessionId: sessionId }).where(eq(orders.number, orderNumber));
      } else {
        throw new Error('Stripe session URL is empty');
      }
    } catch (stripeErr) {
      console.error('Stripe session creation error:', stripeErr);
      checkoutUrl = `${siteUrl}/${locale}/commande/success?session_id=${sessionId}&order=${orderNumber}`;
    }
  } else {
    checkoutUrl = `${siteUrl}/${locale}/commande/success?session_id=${sessionId}&order=${orderNumber}`;
  }

  // 4. Envoi d'email de confirmation (transactionnel)
  const { getOrderConfirmationEmail } = await import('@/lib/email');

  const itemsHtml = parsedItems
    .map((it) => `<li style="padding: 8px 0; border-bottom: 1px solid #eee;">
      <strong>${it.qty} × ${it.product.translations[locale as Locale]?.name || it.product.slug}</strong>
      <span style="float: right;">${formatPrice(it.product.price * it.qty, locale as Locale)}</span>
      ${it.customText ? `<br/><em style="color: #666; font-size: 13px;">« ${it.customText} »</em>` : ''}
    </li>`)
    .join('');

  const formattedTotal = formatPrice(totalCents, locale as Locale);

  if (!stripe) {
    try {
      const emailContent = getOrderConfirmationEmail(
        locale, 
        data.contact.firstName || 'Ami', 
        orderNumber, 
        itemsHtml, 
        formattedTotal
      );
      
      await sendEmail({
        to: data.contact.email,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    } catch (emailErr) {
      console.warn('Failed to send confirmation email:', emailErr);
    }
  }

  return NextResponse.json({ ok: true, url: checkoutUrl, orderNumber });
}