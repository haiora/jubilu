import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, productTranslations, productVariants, auditLogs } from "@db/schema";
import { eq } from 'drizzle-orm';
import { getSession, can } from '@/lib/auth';
import type { InferSelectModel } from 'drizzle-orm';

type DbProduct = InferSelectModel<typeof products>;
type DbTranslation = InferSelectModel<typeof productTranslations>;
type DbVariant = InferSelectModel<typeof productVariants>;

const VALID_CATEGORIES = ['wine', 'parchment'];
const VALID_STATUS = ['active', 'draft'];

export async function GET(req: NextRequest) {
  const session = getSession();
  if (!can(session, 'products')) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  try {
    const allProducts = await db.select().from(products);
    const translations = await db.select().from(productTranslations);
    const variants = await db.select().from(productVariants);

    const enriched = allProducts.map((p: DbProduct) => ({
      ...p,
      translations: translations.filter((t: DbTranslation) => t.productId === p.id),
      variants: variants.filter((v: DbVariant) => v.productId === p.id),
    }));

    return NextResponse.json(enriched);
  } catch (err: any) {
    console.error('[Admin Products GET]', err);
    return NextResponse.json({ error: err.message ?? 'Erreur interne.' }, { status: 500 });
  }
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/**
 * POST /api/admin/products
 * Body: { name, shortDesc?, category, price (EUR), stock, status?, featured?, locale? }
 * Creates a product with a default variant and a translation for the given locale.
 */
export async function POST(req: NextRequest) {
  const session = getSession();
  if (!can(session, 'products')) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const shortDesc = typeof body.shortDesc === 'string' ? body.shortDesc.trim() : '';
    const category = VALID_CATEGORIES.includes(body.category) ? body.category : 'wine';
    const status = VALID_STATUS.includes(body.status) ? body.status : 'draft';
    const featured = Boolean(body.featured);
    const locale = ['fr', 'en', 'he', 'es'].includes(body.locale) ? body.locale : 'fr';

    const priceEur = Number(body.price);
    const stock = Number.isFinite(Number(body.stock)) ? Math.max(0, Math.floor(Number(body.stock))) : 0;

    if (!name || !Number.isFinite(priceEur) || priceEur <= 0) {
      return NextResponse.json({ error: 'Nom et prix valides requis.' }, { status: 400 });
    }

    const priceCents = Math.round(priceEur * 100);
    const now = new Date().toISOString();
    const id = `p_${Date.now()}`;

    // Ensure a unique slug.
    let slug = slugify(name) || `produit-${Date.now()}`;
    const existing = await db.select().from(products).where(eq(products.slug, slug));
    if (existing.length > 0) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

    await db.insert(products).values({
      id,
      slug,
      category,
      status,
      featured,
      customizable: category === 'parchment',
      basePrice: priceCents,
      currency: 'EUR',
      createdAt: now,
    });

    await db.insert(productTranslations).values({
      productId: id,
      locale,
      name,
      shortDesc: shortDesc || null,
      longDesc: null,
    });

    // Always seed a French translation too (fallback used across the app).
    if (locale !== 'fr') {
      await db.insert(productTranslations).values({
        productId: id,
        locale: 'fr',
        name,
        shortDesc: shortDesc || null,
        longDesc: null,
      }).catch(() => {});
    }

    await db.insert(productVariants).values({
      id: `v_${Date.now()}`,
      productId: id,
      sku: `${slug}-default`,
      name: null,
      price: priceCents,
      stock,
      active: true,
    });

    await db.insert(auditLogs).values({
      id: `audit_${Date.now()}`,
      userId: session?.email ?? null,
      action: 'product.create',
      entity: 'product',
      entityId: id,
      meta: JSON.stringify({ slug, name, priceCents, category }),
      ip: req.headers.get('x-forwarded-for') ?? null,
      createdAt: now,
    }).catch(() => {});

    return NextResponse.json({ ok: true, id, slug });
  } catch (err: any) {
    console.error('[Product Create Error]', err);
    return NextResponse.json({ error: err.message ?? 'Erreur interne.' }, { status: 500 });
  }
}