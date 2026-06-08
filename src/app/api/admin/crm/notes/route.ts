import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contactNotes, contacts, users } from '../../../../../../db/schema';
import { eq } from 'drizzle-orm';
import { getSession, can } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/crm/notes
 * Body: { contactId: string, body: string }
 * Adds a note to a contact's timeline.
 */
export async function POST(req: NextRequest) {
  const session = getSession();
  if (!can(session, 'crm')) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  try {
    const { contactId, body } = await req.json();

    if (!contactId || typeof body !== 'string' || !body.trim()) {
      return NextResponse.json({ error: 'Champs requis manquants (contactId, body).' }, { status: 400 });
    }

    const [contact] = await db.select().from(contacts).where(eq(contacts.id, contactId));
    if (!contact) {
      return NextResponse.json({ error: 'Contact introuvable.' }, { status: 404 });
    }

    // Resolve author id from the session email (best-effort).
    let authorId: string | null = null;
    if (session?.email) {
      const [author] = await db.select().from(users).where(eq(users.email, session.email));
      authorId = author?.id ?? null;
    }

    const id = `note_${Date.now()}`;
    const now = new Date().toISOString();

    await db.insert(contactNotes).values({
      id,
      contactId,
      authorId,
      body: body.trim(),
      createdAt: now,
    });

    return NextResponse.json({ ok: true, id, createdAt: now });
  } catch (err: any) {
    console.error('[CRM Note Error]', err);
    return NextResponse.json({ error: err.message ?? 'Erreur interne.' }, { status: 500 });
  }
}
