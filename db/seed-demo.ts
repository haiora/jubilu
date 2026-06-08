import { db } from '../src/lib/db';
import {
  users,
  roles,
  contacts,
  orders,
  orderItems,
  productVariants,
  stockMovements,
} from './schema';
import { eq, sql } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

/**
 * Demo seed: example users (admin + staff) and an example French customer
 * with 3 bottle sales placed this weekend.
 *
 * Run with:  npx tsx db/seed-demo.ts
 * Idempotent: uses fixed ids + onConflictDoNothing.
 */
async function seedDemo() {
  console.log('Seeding demo users & weekend sales...');

  // 1. Roles (admin + shop staff)
  await db.insert(roles).values([
    { id: 'role_admin', key: 'admin', name: 'Administrateur' },
    { id: 'role_shop', key: 'shop', name: 'Gestion boutique' },
  ]).onConflictDoNothing();

  // 2. Users (admin + back-office user)
  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('user123', 10);

  await db.insert(users).values([
    {
      id: 'user_admin',
      email: 'admin@jubilee-israel.org',
      passwordHash: adminHash,
      name: 'Admin Jubilé',
      roleId: 'role_admin',
      locale: 'fr',
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user_staff',
      email: 'user@jubilee-israel.org',
      passwordHash: userHash,
      name: 'Utilisateur Boutique',
      roleId: 'role_shop',
      locale: 'fr',
      active: true,
      createdAt: new Date().toISOString(),
    },
  ]).onConflictDoNothing();
  console.log('Users seeded:');
  console.log('  • admin@jubilee-israel.org / admin123 (administrateur)');
  console.log('  • user@jubilee-israel.org  / user123  (gestion boutique)');

  // 3. Example customer ("utilisateur" client) — France
  const customerId = 'c_demo_fr';
  await db.insert(contacts).values({
    id: customerId,
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@example.fr',
    phone: '+33 6 11 22 33 44',
    country: 'France',
    locale: 'fr',
    status: 'client',
    source: 'Boutique',
    emailConsent: true,
    ordersCount: 0,
    totalSpent: 0,
    createdAt: '2026-06-06T09:00:00.000Z',
  }).onConflictDoNothing();
  console.log('Customer seeded: jean.dupont@example.fr (compte client /compte)');

  // 4. Resolve the Galilee red wine variant (WINE-GAL-RED) for the bottles.
  const [variant] = await db.select().from(productVariants).where(eq(productVariants.sku, 'WINE-GAL-RED'));
  if (!variant) {
    console.error('Variant WINE-GAL-RED introuvable — lancez d\'abord `npx tsx db/seed.ts`.');
    process.exit(1);
  }
  const unitPrice = variant.price; // 2490 cents

  // 5. Three bottle sales this weekend (Sat 06 + Sun 07 June 2026).
  const weekendOrders = [
    { id: 'o_wknd_1', number: 'JBL-WKND01', createdAt: '2026-06-06T11:00:00.000Z' },
    { id: 'o_wknd_2', number: 'JBL-WKND02', createdAt: '2026-06-06T16:30:00.000Z' },
    { id: 'o_wknd_3', number: 'JBL-WKND03', createdAt: '2026-06-07T10:15:00.000Z' },
  ];

  let created = 0;
  for (const o of weekendOrders) {
    const existing = await db.select().from(orders).where(eq(orders.id, o.id));
    if (existing.length > 0) continue;

    await db.insert(orders).values({
      id: o.id,
      number: o.number,
      contactId: customerId,
      status: 'paid',
      subtotal: unitPrice,
      shipping: 0,
      tax: 0,
      total: unitPrice,
      currency: 'EUR',
      locale: 'fr',
      shippingAddress: JSON.stringify({ address: '15 Rue des Vignes', zip: '69000', city: 'Lyon', country: 'France' }),
      createdAt: o.createdAt,
    });

    await db.insert(orderItems).values({
      id: `oi_${o.id}`,
      orderId: o.id,
      variantId: variant.id,
      nameSnapshot: 'Vin rouge de Galilée',
      unitPrice,
      qty: 1,
      productionStatus: 'ready',
    });

    await db.insert(stockMovements).values({
      id: `sm_${o.id}`,
      variantId: variant.id,
      delta: -1,
      reason: `order ${o.number}`,
      authorId: null,
      createdAt: o.createdAt,
    });

    created++;
  }

  if (created > 0) {
    // Decrement stock and update the customer aggregates for the newly created sales.
    await db.update(productVariants)
      .set({ stock: sql`MAX(0, ${productVariants.stock} - ${created})` })
      .where(eq(productVariants.id, variant.id));

    await db.update(contacts)
      .set({
        status: 'client',
        ordersCount: sql`${contacts.ordersCount} + ${created}`,
        totalSpent: sql`${contacts.totalSpent} + ${unitPrice * created}`,
      })
      .where(eq(contacts.id, customerId));
  }

  console.log(`Weekend sales seeded: ${created} new bottle order(s) (${weekendOrders.length} total).`);
  console.log('Demo seeding completed.');
  process.exit(0);
}

seedDemo().catch((e) => {
  console.error(e);
  process.exit(1);
});
