import { NextResponse } from 'next/server';
import { getShopProducts } from '@/lib/shop';

export async function GET() {
  try {
    const products = await getShopProducts();
    return NextResponse.json(products);
  } catch (err: any) {
    console.error('[Shop Products API Error]', err);
    return NextResponse.json({ error: err.message ?? 'Erreur interne.' }, { status: 500 });
  }
}
