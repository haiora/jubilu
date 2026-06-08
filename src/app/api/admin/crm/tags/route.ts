import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts, contactTags, tags as tagsTable } from '../../../../../../db/schema';
import { and, eq } from 'drizzle-orm';
import { getSession, can } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/crm/tags
 * Body: { contactId: string, name: string }
 * Creates the tag if it does not exist, then links it to the contact.
 */
export async function POST(req: NextRequest) {
  const session = getSession();
  if (!can(session, 'crm')) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  try {
    const { contactId, name } = await req.json();
    const label = typeof name === 'string' ? name.trim() : '';

    if (!contactId || !label) {
      return NextResponse.json({ error: 'Champs requis manquants (contactId, name).' }, { status: 400 });
    }

    const [contact] = await db.select().from(contacts).where(eq(contacts.id, contactId));
    if (!contact) {
      return NextResponse.json({ error: 'Contact introuvable.' }, { status: 404 });
    }

    // Find or create the tag (case-insensitive match on name).
    const existingTags = await db.select().from(tagsTable);
    let tag = existingTags.find(t => t.name.toLowerCase() === label.toLowerCase());

    if (!tag) {
      const id = `tag_${Date.now()}`;
      await db.insert(tagsTable).values({ id, name: label, color: null });
      tag = { id, name: label, color: null };
    }

    // Link if not already linked.
    const [link] = await db
      .select()
      .from(contactTags)
      .where(and(eq(contactTags.contactId, contactId), eq(contactTags.tagId, tag.id)));

    if (!link) {
      await db.insert(contactTags).values({ contactId, tagId: tag.id });
    }

    return NextResponse.json({ ok: true, tag: { id: tag.id, name: tag.name } });
  } catch (err: any) {
    console.error('[CRM Tag Error]', err);
    return NextResponse.json({ error: err.message ?? 'Erreur interne.' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/crm/tags
 * Body: { contactId: string, name: string }
 * Removes the tag link from the contact.
 */
export async function DELETE(req: NextRequest) {
  const session = getSession();
  if (!can(session, 'crm')) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  try {
    const { contactId, name } = await req.json();
    const label = typeof name === 'string' ? name.trim() : '';
    if (!contactId || !label) {
      return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 });
    }

    const existingTags = await db.select().from(tagsTable);
    const tag = existingTags.find(t => t.name.toLowerCase() === label.toLowerCase());
    if (tag) {
      await db
        .delete(contactTags)
        .where(and(eq(contactTags.contactId, contactId), eq(contactTags.tagId, tag.id)));
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[CRM Tag Delete Error]', err);
    return NextResponse.json({ error: err.message ?? 'Erreur interne.' }, { status: 500 });
  }
}
