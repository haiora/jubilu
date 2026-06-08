export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { encodeSession, SESSION_COOKIE } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, roles } from '../../../../../db/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!body.email || !body.password) {
    return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
  }

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      passwordHash: users.passwordHash,
      roleKey: roles.key
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(eq(users.email, body.email.toLowerCase()))
    .limit(1);

  if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
    return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
  }

  const role = (user.roleKey || 'admin') as any;

  const token = encodeSession({ email: user.email, name: user.name, role });
  const res = NextResponse.json({ ok: true, role });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8
  });
  return res;
}