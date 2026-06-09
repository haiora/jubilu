import { db } from './db';
import { products, productTranslations, productVariants } from '@db/schema';
import { eq } from 'drizzle-orm';
import { PRODUCTS, type Product, type ProductCategory } from './catalog';

/**
 * Hybrid shop helper:
 * - Uses static catalog for rich product data (images, gradients, descriptions)
 * - Enriches with real database stock and variant info
 */
export async function getShopProducts(category?: ProductCategory): Promise<Product[]> {
  const base = category ? PRODUCTS.filter((p) => p.category === category) : [...PRODUCTS];

  try {
    const dbProducts = await db.select().from(products);
    const translations = await db.select().from(productTranslations);
    const variants = await db.select().from(productVariants);

    return base.map((p) => {
      const dbP = dbProducts.find((d: any) => d.slug === p.slug);
      if (!dbP) return p;

      const tr = translations.filter((t: any) => t.productId === dbP.id);
      const vs = variants.filter((v: any) => v.productId === dbP.id);
      const totalStock = vs.reduce((sum: number, v: any) => sum + v.stock, 0);

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
    const [dbP] = await db.select().from(products).where(eq(products.slug, slug));
    if (!dbP) return base;

    const vs = await db.select().from(productVariants).where(eq(productVariants.productId, dbP.id));
    const totalStock = vs.reduce((sum: number, v: any) => sum + v.stock, 0);

    return {
      ...base,
      price: vs[0]?.price ?? base.price,
      stock: totalStock,
      sku: vs[0]?.sku ?? base.sku,
      featured: dbP.featured,
      customizable: dbP.customizable,
    };
  } catch {
    return base;
  }
}
