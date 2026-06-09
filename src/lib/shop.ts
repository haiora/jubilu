import { db } from './db';
import { products, productVariants } from '@db/schema';
import { eq, inArray } from 'drizzle-orm';
import { PRODUCTS, type Product, type ProductCategory } from './catalog';
import type { InferSelectModel } from 'drizzle-orm';

type DbProduct = InferSelectModel<typeof products>;
type DbVariant = InferSelectModel<typeof productVariants>;

/**
 * Hybrid shop helper:
 * - Uses static catalog for rich product data (images, gradients, descriptions)
 * - Enriches with real database stock and variant info
 */
export async function getShopProducts(category?: ProductCategory): Promise<Product[]> {
  const base = category ? PRODUCTS.filter((p) => p.category === category) : [...PRODUCTS];
  const slugs = base.map((p) => p.slug);
  if (slugs.length === 0) return [];

  try {
    // Parallel DB queries filtered by relevant slugs
    const [dbProducts, variants] = await Promise.all([
      db.select().from(products).where(inArray(products.slug, slugs)),
      db.select().from(productVariants),
    ]);

    const dbMap = new Map((dbProducts as DbProduct[]).map((d) => [d.slug, d]));

    return base.map((p) => {
      const dbP = dbMap.get(p.slug);
      if (!dbP) return p;

      const vs = (variants as DbVariant[]).filter((v) => v.productId === dbP.id);
      const totalStock = vs.reduce((sum, v) => sum + v.stock, 0);

      return {
        ...p,
        price: vs[0]?.price ?? p.price,
        stock: totalStock,
        sku: vs[0]?.sku ?? p.sku,
        featured: dbP.featured,
        customizable: dbP.customizable,
      };
    });
  } catch {
    return base;
  }
}

export async function getShopProduct(slug: string): Promise<Product | null> {
  const base = PRODUCTS.find((p) => p.slug === slug);
  if (!base) return null;

  try {
    const [[dbP], variants] = await Promise.all([
      db.select().from(products).where(eq(products.slug, slug)),
      db.select().from(productVariants).where(eq(productVariants.sku, base.sku ?? '')),
    ]);
    if (!dbP) return base;

    const totalStock = (variants as DbVariant[]).reduce((sum, v) => sum + v.stock, 0);

    return {
      ...base,
      price: variants[0]?.price ?? base.price,
      stock: totalStock,
      sku: variants[0]?.sku ?? base.sku,
      featured: dbP.featured,
      customizable: dbP.customizable,
    };
  } catch {
    return base;
  }
}
