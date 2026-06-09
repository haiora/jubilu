import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts, orders, orderItems } from "@db/schema";
import { eq, inArray } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';

type Order = InferSelectModel<typeof orders>;
type OrderItem = InferSelectModel<typeof orderItems>;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email')?.toLowerCase().trim();

  if (!email) {
    return NextResponse.json({ error: 'Email requis.' }, { status: 400 });
  }

  // Find contact by email
  const [contact] = await db.select().from(contacts).where(eq(contacts.email, email));

  if (!contact) {
    return NextResponse.json({ error: 'Aucun compte trouvé pour cet email. Vérifiez l\'email utilisé lors de vos commandes.' }, { status: 404 });
  }

  // Fetch all orders for this contact
  const contactOrders: Order[] = await db.select().from(orders).where(eq(orders.contactId, contact.id));

  // Batch fetch all items in one query
  const orderIds = contactOrders.map((o) => o.id);
  const allItems: OrderItem[] = orderIds.length
    ? await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds))
    : [];

  const itemsByOrder = new Map<string, OrderItem[]>();
  for (const item of allItems) {
    const list = itemsByOrder.get(item.orderId) ?? [];
    list.push(item);
    itemsByOrder.set(item.orderId, list);
  }

  const orderData = contactOrders
    .map((o) => ({
      id: o.id,
      number: o.number,
      status: o.status,
      total: o.total,
      createdAt: o.createdAt,
      items: (itemsByOrder.get(o.id) ?? []).map((i) => ({
        name: i.nameSnapshot,
        qty: i.qty,
        customText: i.customText,
      })),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return NextResponse.json({
    contact: {
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      status: contact.status,
      ordersCount: contact.ordersCount,
      totalSpent: contact.totalSpent,
      createdAt: contact.createdAt,
    },
    orders: orderData,
  });
}