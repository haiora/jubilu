import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '../../db/schema';

// Connection:
// - Local dev: defaults to the bundled SQLite file (file:local.db).
// - Production/online: set TURSO_DATABASE_URL (libsql://...) and TURSO_AUTH_TOKEN
//   (or DATABASE_URL) to use a hosted libsql/Turso database.
const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:local.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient(authToken ? { url, authToken } : { url });

export const db = drizzle(client, { schema });
