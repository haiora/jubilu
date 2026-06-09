import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql';
import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { createClient } from '@libsql/client';
import * as schema from '../../db/schema';

function createDb() {
  // Cloudflare D1 binding (available at runtime on Pages/Workers)
  const d1Binding = (process.env as any).DB;
  if (d1Binding) {
    return drizzleD1(d1Binding, { schema });
  }

  // Local dev: libsql/SQLite file or Turso remote
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:local.db';
  const authToken = process.env.TURSO_AUTH_TOKEN;
  const client = createClient(authToken ? { url, authToken } : { url });
  return drizzleLibsql(client, { schema });
}

let cachedDb: ReturnType<typeof createDb> | null = null;

function getDb() {
  if (!cachedDb) {
    cachedDb = createDb();
  }
  return cachedDb;
}

// Lazy proxy so imports work without evaluating at build time
export const db = new Proxy({} as any, {
  get(_target, prop: string) {
    return (getDb() as any)[prop];
  }
});
