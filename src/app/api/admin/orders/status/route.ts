import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, auditLogs } from '../../../../../../db/schema';
import { eq } from 'drizzle-orm';
import { getSession, can } from '@/lib/auth';

const VALID_STATUSES = ['pending', 'paid', 'prepared', 'shipped', 'delivered', 'cancelled'];

/**
 * POST /api/admin/orders/status
 * Body: { orderId: string, status: string }
 * Updates an order's status and records an audit log entry.
 */
export async function POST(req: NextRequest) {
  const session = getSession();
  if (!can(session, 'orders')) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  try {
    const { orderId, status } = await req.json();

    if (!orderId || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Paramètres invalides.' }, { status: 400 });
    }

    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });
    }

    if (order.status === status) {
      return NextResponse.json({ ok: true, status });
    }

    await db.update(orders).set({ status }).where(eq(orders.id, orderId));

    // Best-effort audit trail.
    await db.insert(auditLogs).values({
      id: `audit_${Date.now()}`,
      userId: session?.email ?? null,
      action: `order.status: ${order.status} → ${status}`,
      entity: 'order',
      entityId: order.id,
      meta: JSON.stringify({ number: order.number, from: order.status, to: status }),
      ip: req.headers.get('x-forwarded-for') ?? null,
      createdAt: new Date().toISOString(),
    }).catch(() => {});

    return NextResponse.json({ ok: true, status });
  } catch (err: any) {
    console.error('[Order Status Error]', err);
    return NextResponse.json({ error: err.message ?? 'Erreur interne.' }, { status: 500 });
  }
}