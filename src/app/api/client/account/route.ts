import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts, orders, orderItems } from "@db/schema";
import { eq } from 'drizzle-orm';

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
  const contactOrders = await db.select().from(orders).where(eq(orders.contactId, contact.id));

  // Fetch all order items for these orders
  const orderData: Array<{
    id: string;
    number: string;
    status: string;
    total: number;
    createdAt: string;
    items: { name: string; qty: number; customText: string | null }[];
  }> = [];

  for (const o of contactOrders) {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, o.id));
    orderData.push({
      id: o.id,
      number: o.number,
      status: o.status,
      total: o.total,
      createdAt: o.createdAt,
      items: items.map((i: any) => ({
        name: i.nameSnapshot,
        qty: i.qty,
        customText: i.customText,
      })),
    });
  }

  // Sort orders by date desc
  orderData.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

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