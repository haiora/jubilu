import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from '@db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { amount, name, email, message, recurring, locale } = data;

    if (!amount || amount <= 0 || !email) {
      return NextResponse.json({ error: 'Données invalides.' }, { status: 400 });
    }

    // Upsert contact for donor
    const cleanEmail = email.toLowerCase().trim();
    const existing = await db.select().from(contacts).where(eq(contacts.email, cleanEmail));
    
    if (existing.length === 0) {
      await db.insert(contacts).values({
        id: `c_${Date.now()}`,
        email: cleanEmail,
        firstName: name || null,
        status: 'donateur',
        source: 'donation',
        createdAt: new Date().toISOString(),
      });
    } else {
      await db.update(contacts)
        .set({ status: 'donateur', firstName: name || existing[0].firstName })
        .where(eq(contacts.email, cleanEmail));
    }

    const donationId = `DON-${Date.now()}`;

    return NextResponse.json({ ok: true, donationId });
  } catch (err: any) {
    console.error('[Donation POST]', err);
    return NextResponse.json({ error: err.message ?? 'Erreur interne.' }, { status: 500 });
  }
}
