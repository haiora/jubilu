import { NextResponse } from 'next/server';
import { ADMIN_LOCALES, ADMIN_LOCALE_COOKIE } from '@/lib/admin-i18n';

export async function POST(request: Request) {
  let body: { locale?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (!body.locale || !ADMIN_LOCALES.includes(body.locale as never)) {
    return NextResponse.json({ error: 'invalid_locale' }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_LOCALE_COOKIE, body.locale, {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365
  });
  return res;
}