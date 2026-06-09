import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from "@db/schema";
import { desc } from 'drizzle-orm';
import { getSession, can } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = getSession();
  if (!can(session, 'crm')) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  try {
    const allContacts = await db.select().from(contacts).orderBy(desc(contacts.createdAt));
    return NextResponse.json(allContacts);
  } catch (err: any) {
    console.error('[Admin Contacts GET]', err);
    return NextResponse.json({ error: err.message ?? 'Erreur interne.' }, { status: 500 });
  }
}
