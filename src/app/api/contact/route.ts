import { NextResponse } from 'next/server';
import { sendEmail, baseTemplate, getContactAutoReply } from '@/lib/email';
import { db } from '@/lib/db';
import { contacts } from '../../../../db/schema';

export async function POST(request: Request) {
  let data: Record<string, string>;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  // Anti-spam : si le honeypot est rempli, on ignore silencieusement.
  if (data.website) {
    return NextResponse.json({ ok: true });
  }

  const { firstName = '', lastName = '', email = '', subject = '', message = '', locale = 'fr' } = data;
  if (!email || !message) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  // Enregistrer en base
  try {
    await db.insert(contacts).values({
      id: crypto.randomUUID(),
      firstName,
      lastName,
      email,
      source: 'contact_form',
      locale,
      emailConsent: true,
      createdAt: new Date().toISOString()
    }).onConflictDoUpdate({
      target: contacts.email,
      set: { emailConsent: true, locale, firstName, lastName }
    });
  } catch (e) {
    console.error('Failed to save contact:', e);
  }

  const to = process.env.EMAIL_TO ?? 'contact@jubilee-israel.org';
  const htmlAdmin = baseTemplate(
    `Nouveau message — ${subject || 'Contact'}`,
    `<p><strong>${firstName} ${lastName}</strong> (${email})</p><p>${message.replace(/\n/g, '<br>')}</p>`
  );

  try {
    // 1. Notifier l'équipe Jubilé
    await sendEmail({ to, subject: `[Contact] ${subject || 'Nouveau message'}`, html: htmlAdmin, replyTo: email });
    
    // 2. Envoyer l'auto-réponse au client
    const { subject: userSubject, html: userHtml } = getContactAutoReply(locale, firstName);
    await sendEmail({ to: email, subject: userSubject, html: userHtml });
  } catch {
    return NextResponse.json({ error: 'send_failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}