export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from '../../../../../../db/schema';
import { eq } from 'drizzle-orm';
import { getSession, can } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const VALID_STATUS = new Set(['lead', 'client', 'donateur']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Parse a single CSV line respecting quoted fields ("" escaping).
 */
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else { inQuotes = false; }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',' || ch === ';') {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map(s => s.trim());
}

function parseConsent(value: string | undefined): boolean {
  if (!value) return false;
  const v = value.toLowerCase();
  return v === 'oui' || v === 'yes' || v === 'true' || v === '1';
}

/**
 * POST /api/admin/crm/import
 * Body: { csv: string }
 * Parses a CSV (header row required) and upserts contacts keyed by email.
 * Recognised columns: firstName, lastName, email, phone, country, locale,
 * status, source, emailConsent.
 */
export async function POST(req: NextRequest) {
  const session = getSession();
  if (!can(session, 'crm')) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  try {
    const { csv } = await req.json();
    if (typeof csv !== 'string' || !csv.trim()) {
      return NextResponse.json({ error: 'Fichier CSV vide ou invalide.' }, { status: 400 });
    }

    // Strip BOM and normalise line endings.
    const clean = csv.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const rows = clean.split('\n').filter(l => l.trim().length > 0);
    if (rows.length < 2) {
      return NextResponse.json({ error: 'Aucune donnée (en-tête + au moins une ligne requis).' }, { status: 400 });
    }

    const header = parseCsvLine(rows[0]).map(h => h.toLowerCase());
    const col = (name: string) => header.indexOf(name.toLowerCase());

    const idx = {
      firstName: col('firstName'),
      lastName: col('lastName'),
      email: col('email'),
      phone: col('phone'),
      country: col('country'),
      locale: col('locale'),
      status: col('status'),
      source: col('source'),
      emailConsent: col('emailConsent'),
    };

    if (idx.email === -1) {
      return NextResponse.json({ error: "Colonne 'email' obligatoire absente." }, { status: 400 });
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 1; i < rows.length; i++) {
      const cells = parseCsvLine(rows[i]);
      const get = (j: number) => (j >= 0 && j < cells.length ? cells[j] : '');
      const email = get(idx.email).toLowerCase();

      if (!EMAIL_RE.test(email)) {
        skipped++;
        if (errors.length < 10) errors.push(`Ligne ${i + 1}: email invalide « ${get(idx.email)} »`);
        continue;
      }

      const status = VALID_STATUS.has(get(idx.status)) ? get(idx.status) : 'lead';
      const values = {
        firstName: get(idx.firstName) || null,
        lastName: get(idx.lastName) || null,
        phone: get(idx.phone) || null,
        country: get(idx.country) || null,
        locale: get(idx.locale) || 'fr',
        status,
        source: get(idx.source) || 'import',
        emailConsent: parseConsent(get(idx.emailConsent)),
      };

      const [existing] = await db.select().from(contacts).where(eq(contacts.email, email));
      if (existing) {
        await db.update(contacts).set(values).where(eq(contacts.id, existing.id));
        updated++;
      } else {
        await db.insert(contacts).values({
          id: `c_${Date.now()}_${i}`,
          email,
          ...values,
          ordersCount: 0,
          totalSpent: 0,
          createdAt: new Date().toISOString(),
        });
        created++;
      }
    }

    return NextResponse.json({
      ok: true,
      created,
      updated,
      skipped,
      errors,
      message: `${created} créé(s), ${updated} mis à jour, ${skipped} ignoré(s).`,
    });
  } catch (err: any) {
    console.error('[CRM Import Error]', err);
    return NextResponse.json({ error: err.message ?? 'Erreur interne.' }, { status: 500 });
  }
}