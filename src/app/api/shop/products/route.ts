import { NextResponse } from 'next/server';
import { getShopProducts } from '@/lib/shop';

export async function GET() {
  try {
    const products = await getShopProducts();
    const res = NextResponse.json(products);
    res.headers.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    return res;
  } catch (err: any) {
    console.error('[Shop Products API Error]', err);
    return NextResponse.json({ error: err.message ?? 'Erreur interne.' }, { status: 500 });
  }
}
