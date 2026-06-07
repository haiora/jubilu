import { db } from '../src/lib/db';
import {
  users,
  roles,
  contacts,
  products,
  productTranslations,
  productVariants,
  orders,
  orderItems,
  campaigns,
  emailTemplates,
  segments
} from './schema';
import * as bcrypt from 'bcryptjs';

async function seed() {
  console.log('Seeding DB...');
  
  // 1. Roles
  await db.insert(roles).values({
    id: 'role_admin',
    key: 'admin',
    name: 'Administrator'
  }).onConflictDoNothing();

  // 2. Users
  const hash = await bcrypt.hash('admin123', 10);
  await db.insert(users).values({
    id: 'user_admin',
    email: 'admin@jubilee-israel.org',
    passwordHash: hash,
    name: 'Admin Jubilé',
    roleId: 'role_admin',
    locale: 'fr',
    active: true,
    createdAt: new Date().toISOString()
  }).onConflictDoNothing();
  console.log('Admin user seeded: admin@jubilee-israel.org / admin123');

  // 3. Contacts
  const sampleContacts = [
    { id: 'c1', firstName: 'Marie', lastName: 'Lefèvre', email: 'marie.lefevre@example.com', phone: '+33 6 12 34 56 78', country: 'France', locale: 'fr', status: 'client', source: 'Boutique', emailConsent: true, ordersCount: 3, totalSpent: 18900, createdAt: '2025-09-12T00:00:00Z' },
    { id: 'c2', firstName: 'David', lastName: 'Roberts', email: 'david.roberts@example.com', phone: '+1 555 123 4567', country: 'United States', locale: 'en', status: 'donateur', source: 'Newsletter', emailConsent: true, ordersCount: 1, totalSpent: 8900, createdAt: '2025-10-01T00:00:00Z' },
    { id: 'c3', firstName: 'Sara', lastName: 'Martínez', email: 'sara.martinez@example.com', phone: '+34 600 000 000', country: 'España', locale: 'es', status: 'client', source: 'Instagram', emailConsent: true, ordersCount: 2, totalSpent: 4980, createdAt: '2025-11-08T00:00:00Z' },
    { id: 'c4', firstName: 'Yossi', lastName: 'Ben-David', email: 'yossi.bd@example.com', phone: '+972 50 000 0000', country: 'Israel', locale: 'he', status: 'client', source: 'Bouche à oreille', emailConsent: false, ordersCount: 1, totalSpent: 2490, createdAt: '2025-11-20T00:00:00Z' },
    { id: 'c5', firstName: 'Anna', lastName: 'Klein', email: 'anna.klein@example.com', phone: '+49 170 000000', country: 'Deutschland', locale: 'en', status: 'lead', source: 'Salon', emailConsent: true, ordersCount: 0, totalSpent: 0, createdAt: '2026-01-15T00:00:00Z' },
    { id: 'c6', firstName: 'Paulo', lastName: 'Santos', email: 'paulo.santos@example.com', phone: '+55 11 99999-9999', country: 'Brasil', locale: 'es', status: 'client', source: 'Boutique', emailConsent: true, ordersCount: 1, totalSpent: 8900, createdAt: '2026-02-02T00:00:00Z' }
  ];

  for (const c of sampleContacts) {
    await db.insert(contacts).values(c).onConflictDoNothing();
  }
  console.log('Contacts seeded');

  // 4. Products
  const sampleProducts = [
    { id: 'p1', slug: 'parchemins', category: 'parchment', status: 'active', featured: true, customizable: true, basePrice: 8900, currency: 'EUR', createdAt: '2025-05-01T00:00:00Z' },
    { id: 'p2', slug: 'vin-rouge', category: 'wine', status: 'active', featured: true, customizable: false, basePrice: 2490, currency: 'EUR', createdAt: '2025-05-01T00:00:00Z' }
  ];

  for (const p of sampleProducts) {
    await db.insert(products).values(p).onConflictDoNothing();
  }

  // 4.1 Product Translations
  const sampleProductTranslations = [
    { productId: 'p1', locale: 'fr', name: 'Parchemin personnalisé de Jérusalem', shortDesc: 'Votre verset préféré calligraphié sur parchemin véritable.', longDesc: 'Un magnifique parchemin réalisé à la main par nos scribes à Jérusalem.' },
    { productId: 'p1', locale: 'en', name: 'Custom Jerusalem Scroll', shortDesc: 'Your favorite verse calligraphed on genuine parchment.', longDesc: 'A beautiful handmade scroll created by our scribes in Jerusalem.' },
    { productId: 'p2', locale: 'fr', name: 'Vin rouge de Galilée', shortDesc: 'Un cépage d’exception issu des collines de Galilée.', longDesc: 'Cultivé avec passion et vieilli en fûts de chêne français.' },
    { productId: 'p2', locale: 'en', name: 'Galilee Red Wine', shortDesc: 'An exceptional vintage from the hills of Galilee.', longDesc: 'Cultivated with passion and aged in French oak barrels.' }
  ];

  for (const pt of sampleProductTranslations) {
    await db.insert(productTranslations).values(pt).onConflictDoNothing();
  }

  // 4.2 Product Variants
  const sampleVariants = [
    { id: 'v1', productId: 'p1', sku: 'PARCH-JERU-STD', name: 'Standard', price: 8900, stock: 45, active: true },
    { id: 'v2', productId: 'p2', sku: 'WINE-GAL-RED', name: 'Bouteille 75cl', price: 2490, stock: 120, active: true }
  ];

  for (const v of sampleVariants) {
    await db.insert(productVariants).values(v).onConflictDoNothing();
  }
  console.log('Products & variants seeded');

  // 5. Segments
  await db.insert(segments).values({
    id: 'seg_all',
    name: 'Tous les contacts',
    definition: JSON.stringify({ status: 'all' })
  }).onConflictDoNothing();

  // 6. Templates & Campaigns
  await db.insert(emailTemplates).values({
    id: 'temp_june',
    key: 'newsletter_june',
    name: 'Newsletter Juin',
    locale: 'fr',
    subject: 'Des nouvelles de Jérusalem 🕊️',
    html: '<p>Bonjour {{firstName}}, voici nos nouvelles...</p>',
    updatedAt: new Date().toISOString()
  }).onConflictDoNothing();

  const sampleCampaigns = [
    { id: 'm1', name: 'Newsletter de juin', subject: 'Des nouvelles de Jérusalem 🕊️', templateId: 'temp_june', segmentId: 'seg_all', status: 'sent', locale: 'fr', sentAt: '2026-06-02T10:00:00Z', stats: JSON.stringify({ sent: 8520, delivered: 8395, opened: 4120, clicked: 980, unsubscribed: 22, bounced: 125 }), createdAt: '2026-06-01T08:00:00Z' },
    { id: 'm2', name: 'Lancement parchemins', subject: 'Votre héritage, écrit à la main', templateId: 'temp_june', segmentId: 'seg_all', status: 'sent', locale: 'fr', sentAt: '2026-05-20T14:30:00Z', stats: JSON.stringify({ sent: 1240, delivered: 1230, opened: 760, clicked: 210, unsubscribed: 3, bounced: 10 }), createdAt: '2026-05-18T09:00:00Z' }
  ];

  for (const camp of sampleCampaigns) {
    await db.insert(campaigns).values(camp).onConflictDoNothing();
  }
  console.log('Campaigns seeded');

  // 7. Orders & Items
  const sampleOrders = [
    { id: 'o1', number: 'JBL-1A2B3C', contactId: 'c1', status: 'delivered', subtotal: 8900, shipping: 0, tax: 0, total: 8900, currency: 'EUR', locale: 'fr', shippingAddress: JSON.stringify({ street: '12 Rue de la Paix', city: 'Paris', zip: '75002', country: 'France' }), createdAt: '2026-05-28T10:30:00Z' },
    { id: 'o2', number: 'JBL-4D5E6F', contactId: 'c3', status: 'shipped', subtotal: 2490, shipping: 500, tax: 0, total: 2990, currency: 'EUR', locale: 'es', shippingAddress: JSON.stringify({ street: 'Calle Mayor 10', city: 'Madrid', zip: '28001', country: 'España' }), createdAt: '2026-06-01T15:45:00Z' },
    { id: 'o3', number: 'JBL-7G8H9I', contactId: 'c2', status: 'paid', subtotal: 8900, shipping: 1500, tax: 0, total: 10400, currency: 'EUR', locale: 'en', shippingAddress: JSON.stringify({ street: '5th Ave 100', city: 'New York', zip: '10001', country: 'United States' }), createdAt: '2026-06-05T08:12:00Z' }
  ];

  for (const o of sampleOrders) {
    await db.insert(orders).values(o as any).onConflictDoNothing();
  }

  const sampleOrderItems = [
    { id: 'oi1', orderId: 'o1', variantId: 'v1', nameSnapshot: 'Parchemin personnalisé de Jérusalem', unitPrice: 8900, qty: 1, customText: 'Psaume 23', productionStatus: 'ready' },
    { id: 'oi2', orderId: 'o2', variantId: 'v2', nameSnapshot: 'Vin rouge de Galilée', unitPrice: 2490, qty: 1, productionStatus: 'shipped' },
    { id: 'oi3', orderId: 'o3', variantId: 'v1', nameSnapshot: 'Parchemin personnalisé de Jérusalem', unitPrice: 8900, qty: 1, customText: 'For God so loved the world', productionStatus: 'to_produce' }
  ];

  for (const oi of sampleOrderItems) {
    await db.insert(orderItems).values(oi).onConflictDoNothing();
  }
  console.log('Orders and order items seeded');

  console.log('Seeding completed successfully!');
  process.exit(0);
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
});
