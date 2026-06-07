import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '../../db/schema';

// Local connection to local.db
const client = createClient({
  url: 'file:local.db',
});

export const db = drizzle(client, { schema });
