import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, contacts, orderItems } from "@db/schema";
import { desc, eq, inArray } from 'drizzle-orm';
import { getSession, can } from '@/lib/auth';
import type { InferSelectModel } from 'drizzle-orm';

type Order = InferSelectModel<typeof orders>;
type OrderItem = InferSelectModel<typeof orderItems>;
type Contact = InferSelectModel<typeof contacts>;

export async function GET(req: NextRequest) {
  const session = getSession();
  if (!can(session, 'orders')) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  try {
    const allOrders: Order[] = await db.select().from(orders).orderBy(desc(orders.createdAt));
    const contactIds = Array.from(new Set(allOrders.map((o) => o.contactId).filter((id): id is string => id !== null && id !== undefined)));
    const orderIds = allOrders.map((o) => o.id);

    // Batch fetch all contacts and items in 2 queries instead of N+1
    const allContacts: Contact[] = contactIds.length
      ? await db.select().from(contacts).where(inArray(contacts.id, contactIds))
      : [];
    const allItems: OrderItem[] = orderIds.length
      ? await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds))
      : [];

    const contactMap = new Map(allContacts.map((c) => [c.id, c]));
    const itemsByOrder = new Map<string, OrderItem[]>();
    for (const item of allItems) {
      const list = itemsByOrder.get(item.orderId) ?? [];
      list.push(item);
      itemsByOrder.set(item.orderId, list);
    }

    const enriched = allOrders.map((o) => {
      const contact = o.contactId ? contactMap.get(o.contactId) : null;
      const items = itemsByOrder.get(o.id) ?? [];
      return {
        ...o,
        contact: contact ? {
          id: contact.id,
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
        } : null,
        items: items.map((i) => ({
          id: i.id,
          nameSnapshot: i.nameSnapshot,
          unitPrice: i.unitPrice,
          qty: i.qty,
          customText: i.customText,
        })),
      };
    });

    return NextResponse.json(enriched);
  } catch (err: any) {
    console.error('[Admin Orders GET]', err);
    return NextResponse.json({ error: err.message ?? 'Erreur interne.' }, { status: 500 });
  }
}
