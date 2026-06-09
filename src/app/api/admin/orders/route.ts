import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, contacts, orderItems } from "@db/schema";
import { desc, eq } from 'drizzle-orm';
import { getSession, can } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = getSession();
  if (!can(session, 'orders')) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  try {
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));

    const enriched = [];
    for (const o of allOrders) {
      const [contact] = o.contactId
        ? await db.select().from(contacts).where(eq(contacts.id, o.contactId))
        : [null];
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, o.id));
      enriched.push({
        ...o,
        contact: contact ? {
          id: contact.id,
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
        } : null,
        items: items.map((i: any) => ({
          id: i.id,
          nameSnapshot: i.nameSnapshot,
          unitPrice: i.unitPrice,
          qty: i.qty,
          customText: i.customText,
        })),
      });
    }

    return NextResponse.json(enriched);
  } catch (err: any) {
    console.error('[Admin Orders GET]', err);
    return NextResponse.json({ error: err.message ?? 'Erreur interne.' }, { status: 500 });
  }
}
