import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productVariants, stockMovements, users } from '../../../../../db/schema';
import { eq, sql } from 'drizzle-orm';
import { getSession, can } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/stock
 * Body: { variantId: string, delta: number, reason?: string }
 * Adjusts a variant's stock by `delta` (can be negative) and records a movement.
 */
export async function POST(req: NextRequest) {
  const session = getSession();
  if (!can(session, 'stock')) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  try {
    const { variantId, delta, reason } = await req.json();
    const d = Number(delta);

    if (!variantId || !Number.isFinite(d) || d === 0) {
      return NextResponse.json({ error: 'Paramètres invalides.' }, { status: 400 });
    }

    const [variant] = await db.select().from(productVariants).where(eq(productVariants.id, variantId));
    if (!variant) {
      return NextResponse.json({ error: 'Variante introuvable.' }, { status: 404 });
    }

    const newStock = Math.max(0, variant.stock + Math.floor(d));
    await db.update(productVariants).set({ stock: newStock }).where(eq(productVariants.id, variantId));

    let authorId: string | null = null;
    if (session?.email) {
      const [author] = await db.select().from(users).where(eq(users.email, session.email));
      authorId = author?.id ?? null;
    }

    await db.insert(stockMovements).values({
      id: `sm_${Date.now()}`,
      variantId,
      delta: Math.floor(d),
      reason: typeof reason === 'string' && reason.trim() ? reason.trim() : 'adjustment',
      authorId,
      createdAt: new Date().toISOString(),
    }).catch(() => {});

    return NextResponse.json({ ok: true, stock: newStock });
  } catch (err: any) {
    console.error('[Stock Adjust Error]', err);
    return NextResponse.json({ error: err.message ?? 'Erreur interne.' }, { status: 500 });
  }
}
