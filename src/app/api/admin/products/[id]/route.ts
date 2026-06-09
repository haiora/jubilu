import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  products, productTranslations, productVariants,
  mediaAssets, stockMovements, orderItems, auditLogs,
} from "@db/schema";
import { eq } from 'drizzle-orm';
import { getSession, can } from '@/lib/auth';
import type { InferSelectModel } from 'drizzle-orm';

type Translation = InferSelectModel<typeof productTranslations>;

const VALID_CATEGORIES = ['wine', 'parchment'];
const VALID_STATUS = ['active', 'draft', 'archived'];

/**
 * PUT /api/admin/products/[id]
 * Updates a product, its translation (for the given locale) and its default variant.
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!can(session, 'products')) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const [product] = await db.select().from(products).where(eq(products.id, params.id));
    if (!product) {
      return NextResponse.json({ error: 'Produit introuvable.' }, { status: 404 });
    }

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const shortDesc = typeof body.shortDesc === 'string' ? body.shortDesc.trim() : '';
    const category = VALID_CATEGORIES.includes(body.category) ? body.category : product.category;
    const status = VALID_STATUS.includes(body.status) ? body.status : product.status;
    const featured = Boolean(body.featured);
    const locale = ['fr', 'en', 'he', 'es'].includes(body.locale) ? body.locale : 'fr';
    const priceEur = Number(body.price);
    const stock = Number(body.stock);

    if (!name || !Number.isFinite(priceEur) || priceEur <= 0) {
      return NextResponse.json({ error: 'Nom et prix valides requis.' }, { status: 400 });
    }
    const priceCents = Math.round(priceEur * 100);

    await db.update(products)
      .set({ category, status, featured, customizable: category === 'parchment', basePrice: priceCents })
      .where(eq(products.id, product.id));

    // Upsert the translation for the chosen locale.
    const existingTr: Translation[] = await db.select().from(productTranslations)
      .where(eq(productTranslations.productId, product.id));
    const trForLocale = existingTr.find((t) => t.locale === locale);
    if (trForLocale) {
      await db.update(productTranslations)
        .set({ name, shortDesc: shortDesc || null })
        .where(eq(productTranslations.productId, product.id));
    } else {
      await db.insert(productTranslations).values({
        productId: product.id, locale, name, shortDesc: shortDesc || null, longDesc: null,
      });
    }

    // Update the first variant (price + stock) if present.
    const variants = await db.select().from(productVariants).where(eq(productVariants.productId, product.id));
    if (variants[0]) {
      const patch: { price: number; stock?: number } = { price: priceCents };
      if (Number.isFinite(stock)) patch.stock = Math.max(0, Math.floor(stock));
      await db.update(productVariants).set(patch).where(eq(productVariants.id, variants[0].id));
    }

    await db.insert(auditLogs).values({
      id: `audit_${Date.now()}`,
      userId: session?.email ?? null,
      action: 'product.update',
      entity: 'product',
      entityId: product.id,
      meta: JSON.stringify({ name, priceCents, status, category }),
      ip: req.headers.get('x-forwarded-for') ?? null,
      createdAt: new Date().toISOString(),
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[Product Update Error]', err);
    return NextResponse.json({ error: err.message ?? 'Erreur interne.' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/products/[id]
 * Removes the product and its dependents. Order history is preserved by nulling
 * the variant reference on existing order items (the name snapshot is kept).
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!can(session, 'products')) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  try {
    const [product] = await db.select().from(products).where(eq(products.id, params.id));
    if (!product) {
      return NextResponse.json({ error: 'Produit introuvable.' }, { status: 404 });
    }

    const variants = await db.select().from(productVariants).where(eq(productVariants.productId, product.id));

    for (const v of variants) {
      // Preserve order history: detach the variant from past order items.
      await db.update(orderItems).set({ variantId: null }).where(eq(orderItems.variantId, v.id)).catch(() => {});
      await db.delete(stockMovements).where(eq(stockMovements.variantId, v.id)).catch(() => {});
    }

    await db.delete(productVariants).where(eq(productVariants.productId, product.id)).catch(() => {});
    await db.delete(productTranslations).where(eq(productTranslations.productId, product.id)).catch(() => {});
    await db.delete(mediaAssets).where(eq(mediaAssets.productId, product.id)).catch(() => {});
    await db.delete(products).where(eq(products.id, product.id));

    await db.insert(auditLogs).values({
      id: `audit_${Date.now()}`,
      userId: session?.email ?? null,
      action: 'product.delete',
      entity: 'product',
      entityId: product.id,
      meta: JSON.stringify({ slug: product.slug }),
      ip: req.headers.get('x-forwarded-for') ?? null,
      createdAt: new Date().toISOString(),
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[Product Delete Error]', err);
    return NextResponse.json({ error: err.message ?? 'Erreur interne.' }, { status: 500 });
  }
}
