export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from '../../../../../../db/schema';
import { desc } from 'drizzle-orm';
import { getSession, can } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function csvCell(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  // Escape quotes and wrap if the value contains a separator, quote or newline.
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * GET /api/admin/crm/export
 * Streams all contacts as a downloadable CSV file.
 */
export async function GET(req: NextRequest) {
  const session = getSession();
  if (!can(session, 'crm')) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  const rows = await db.select().from(contacts).orderBy(desc(contacts.createdAt));

  const headers = [
    'id', 'firstName', 'lastName', 'email', 'phone', 'country',
    'locale', 'status', 'source', 'emailConsent', 'ordersCount',
    'totalSpentEUR', 'createdAt',
  ];

  const lines = [headers.join(',')];
  for (const c of rows) {
    lines.push([
      csvCell(c.id),
      csvCell(c.firstName),
      csvCell(c.lastName),
      csvCell(c.email),
      csvCell(c.phone),
      csvCell(c.country),
      csvCell(c.locale),
      csvCell(c.status),
      csvCell(c.source),
      csvCell(c.emailConsent ? 'oui' : 'non'),
      csvCell(c.ordersCount),
      csvCell((c.totalSpent / 100).toFixed(2)),
      csvCell(c.createdAt),
    ].join(','));
  }

  // Prepend BOM so Excel detects UTF-8 correctly.
  const csv = '\uFEFF' + lines.join('\r\n');
  const filename = `contacts-jubilee-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}