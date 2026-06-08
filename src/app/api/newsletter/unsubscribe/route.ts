export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from '../../../../../db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

function decodeToken(token: string): string | null {
  try {
    const email = Buffer.from(token, 'base64url').toString('utf8').trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
  } catch {
    return null;
  }
}

/**
 * POST /api/newsletter/unsubscribe
 * Body: { token: string } where token = base64url(email)
 * Sets emailConsent=false for the matching contact (RGPD opt-out).
 */
export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    const email = typeof token === 'string' ? decodeToken(token) : null;
    if (!email) {
      return NextResponse.json({ error: 'invalid_token' }, { status: 400 });
    }

    await db.update(contacts).set({ emailConsent: false }).where(eq(contacts.email, email));

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[Unsubscribe Error]', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}