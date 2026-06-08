import { db } from './db';
import { productVariants } from '../../db/schema';
import { getProduct, type Product } from './catalog';

/**
 * Returns a map of variant SKU -> available stock from the database.
 * Falls back to an empty map if the database is unreachable (the catalog
 * stock is then used as a fallback by callers).
 */
export async function getStockBySku(): Promise<Record<string, number>> {
  try {
    const variants = await db
      .select({ sku: productVariants.sku, stock: productVariants.stock })
      .from(productVariants);
    const map: Record<string, number> = {};
    for (const v of variants) map[v.sku] = v.stock;
    return map;
  } catch {
    return {};
  }
}

/**
 * Resolves the effective stock for a catalog product: the real DB stock for
 * its mapped variant SKU, or the static catalog stock when no variant exists.
 */
export function effectiveStock(product: Product, stockBySku: Record<string, number>): number {
  if (product.sku && product.sku in stockBySku) return stockBySku[product.sku];
  return product.stock;
}

/**
 * Convenience helper to get the effective stock for a single product slug.
 */
export async function getStockForSlug(slug: string): Promise<number | null> {
  const product = getProduct(slug);
  if (!product) return null;
  if (!product.sku) return product.stock;
  const map = await getStockBySku();
  return product.sku in map ? map[product.sku] : product.stock;
}
