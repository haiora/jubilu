import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from '@db/schema';
import { eq } from 'drizzle-orm';
import { getSession, can } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = getSession();
  if (!can(session, 'crm')) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  try {
    // Fetch all contacts with status 'donateur' plus any contact who came from donation source
    const donors = await db
      .select()
      .from(contacts)
      .where(eq(contacts.status, 'donateur'));

    return NextResponse.json(donors);
  } catch (err: any) {
    console.error('[Admin Donations API Error]', err);
    return NextResponse.json({ error: err.message ?? 'Erreur interne.' }, { status: 500 });
  }
}
