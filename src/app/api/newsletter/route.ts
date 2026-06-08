import { NextResponse } from 'next/server';
import { sendEmail, getWelcomeEmail } from '@/lib/email';
import { db } from '@/lib/db';
import { contacts } from '../../../../db/schema';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let data: { email?: string; website?: string; locale?: string };
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (data.website) return NextResponse.json({ ok: true }); // honeypot

  const email = data.email?.trim().toLowerCase() ?? '';
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }

  const locale = data.locale ?? 'fr';

  // Enregistrer le contact dans D1
  try {
    const id = `c_nl_${Date.now()}`;
    await db.insert(contacts).values({
      id,
      email,
      source: 'newsletter',
      locale,
      emailConsent: true,
      status: 'lead',
      createdAt: new Date().toISOString()
    }).onConflictDoUpdate({
      target: contacts.email,
      set: { emailConsent: true, locale }
    });
  } catch (dbErr) {
    console.error('Failed to save newsletter contact to DB', dbErr);
  }

  // Envoyer l'email de bienvenue multilingue
  try {
    const { subject, html } = getWelcomeEmail(locale, undefined, email);
    await sendEmail({
      to: email,
      subject,
      html
    });
  } catch {
    /* on n'échoue pas côté visiteur si la notification interne échoue */
  }

  return NextResponse.json({ ok: true });
}
