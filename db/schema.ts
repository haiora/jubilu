import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

// === Modèle de données Jubilé (Cloudflare D1 / SQLite) — Phase 14 ===
// Montants stockés en centimes (integer). Dates en ISO 8601 (text).

export const roles = sqliteTable('roles', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),
  name: text('name').notNull()
});

export const permissions = sqliteTable('permissions', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique()
});

export const rolePermissions = sqliteTable(
  'role_permissions',
  {
    roleId: text('role_id').notNull().references(() => roles.id),
    permissionId: text('permission_id').notNull().references(() => permissions.id)
  },
  (t) => ({ pk: primaryKey({ columns: [t.roleId, t.permissionId] }) })
);

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  locale: text('locale').notNull().default('fr'),
  roleId: text('role_id').references(() => roles.id),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull()
});

export const contacts = sqliteTable('contacts', {
  id: text('id').primaryKey(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  country: text('country'),
  locale: text('locale').notNull().default('fr'),
  status: text('status').notNull().default('lead'), // lead | client | donateur
  source: text('source'),
  emailConsent: integer('email_consent', { mode: 'boolean' }).notNull().default(false),
  ordersCount: integer('orders_count').notNull().default(0),
  totalSpent: integer('total_spent').notNull().default(0),
  createdAt: text('created_at').notNull()
});

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color')
});

export const contactTags = sqliteTable(
  'contact_tags',
  {
    contactId: text('contact_id').notNull().references(() => contacts.id),
    tagId: text('tag_id').notNull().references(() => tags.id)
  },
  (t) => ({ pk: primaryKey({ columns: [t.contactId, t.tagId] }) })
);

export const contactNotes = sqliteTable('contact_notes', {
  id: text('id').primaryKey(),
  contactId: text('contact_id').notNull().references(() => contacts.id),
  authorId: text('author_id').references(() => users.id),
  body: text('body').notNull(),
  createdAt: text('created_at').notNull()
});

export const segments = sqliteTable('segments', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  definition: text('definition_json')
});

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  category: text('category').notNull(),
  status: text('status').notNull().default('active'),
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
  customizable: integer('customizable', { mode: 'boolean' }).notNull().default(false),
  basePrice: integer('base_price').notNull(),
  currency: text('currency').notNull().default('EUR'),
  createdAt: text('created_at').notNull()
});

export const productTranslations = sqliteTable(
  'product_translations',
  {
    productId: text('product_id').notNull().references(() => products.id),
    locale: text('locale').notNull(),
    name: text('name').notNull(),
    shortDesc: text('short_desc'),
    longDesc: text('long_desc')
  },
  (t) => ({ pk: primaryKey({ columns: [t.productId, t.locale] }) })
);

export const productVariants = sqliteTable('product_variants', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id),
  sku: text('sku').notNull().unique(),
  name: text('name'),
  price: integer('price').notNull(),
  stock: integer('stock').notNull().default(0),
  active: integer('active', { mode: 'boolean' }).notNull().default(true)
});

export const mediaAssets = sqliteTable('media_assets', {
  id: text('id').primaryKey(),
  productId: text('product_id').references(() => products.id),
  url: text('url').notNull(),
  alt: text('alt'),
  position: integer('position').notNull().default(0)
});

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  number: text('number').notNull().unique(),
  contactId: text('contact_id').references(() => contacts.id),
  status: text('status').notNull().default('pending'),
  subtotal: integer('subtotal').notNull().default(0),
  shipping: integer('shipping').notNull().default(0),
  tax: integer('tax').notNull().default(0),
  total: integer('total').notNull().default(0),
  currency: text('currency').notNull().default('EUR'),
  locale: text('locale').notNull().default('fr'),
  shippingAddress: text('shipping_address_json'),
  stripeSessionId: text('stripe_session_id'),
  createdAt: text('created_at').notNull()
});

export const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id),
  variantId: text('variant_id').references(() => productVariants.id),
  nameSnapshot: text('name_snapshot').notNull(),
  unitPrice: integer('unit_price').notNull(),
  qty: integer('qty').notNull().default(1),
  customText: text('custom_text'), // parchemins personnalisés
  productionStatus: text('production_status') // to_produce | in_production | quality_check | ready | shipped
});

export const stockMovements = sqliteTable('stock_movements', {
  id: text('id').primaryKey(),
  variantId: text('variant_id').notNull().references(() => productVariants.id),
  delta: integer('delta').notNull(),
  reason: text('reason'),
  authorId: text('author_id').references(() => users.id),
  createdAt: text('created_at').notNull()
});

export const emailTemplates = sqliteTable('email_templates', {
  id: text('id').primaryKey(),
  key: text('key').notNull(),
  name: text('name').notNull(),
  locale: text('locale').notNull(),
  subject: text('subject').notNull(),
  html: text('html').notNull(),
  updatedAt: text('updated_at').notNull()
});

export const campaigns = sqliteTable('campaigns', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  subject: text('subject').notNull(),
  templateId: text('template_id').references(() => emailTemplates.id),
  segmentId: text('segment_id').references(() => segments.id),
  status: text('status').notNull().default('draft'), // draft | scheduled | sent
  locale: text('locale'),
  scheduledAt: text('scheduled_at'),
  sentAt: text('sent_at'),
  stats: text('stats_json'),
  createdAt: text('created_at').notNull()
});

export const emailLogs = sqliteTable('email_logs', {
  id: text('id').primaryKey(),
  campaignId: text('campaign_id').references(() => campaigns.id),
  contactId: text('contact_id').references(() => contacts.id),
  type: text('type').notNull(), // transactional | campaign
  resendId: text('resend_id'),
  status: text('status'),
  openedAt: text('opened_at'),
  clickedAt: text('clicked_at'),
  bouncedAt: text('bounced_at'),
  createdAt: text('created_at').notNull()
});

export const pages = sqliteTable(
  'pages',
  {
    key: text('key').notNull(),
    locale: text('locale').notNull(),
    title: text('title'),
    body: text('body'),
    seo: text('seo_json'),
    status: text('status').notNull().default('draft')
  },
  (t) => ({ pk: primaryKey({ columns: [t.key, t.locale] }) })
);

export const translations = sqliteTable(
  'translations',
  {
    namespace: text('namespace').notNull(),
    key: text('key').notNull(),
    locale: text('locale').notNull(),
    value: text('value').notNull()
  },
  (t) => ({ pk: primaryKey({ columns: [t.namespace, t.key, t.locale] }) })
);

export const testimonials = sqliteTable('testimonials', {
  id: text('id').primaryKey(),
  author: text('author').notNull(),
  country: text('country'),
  locale: text('locale').notNull(),
  body: text('body').notNull(),
  rating: integer('rating'),
  published: integer('published', { mode: 'boolean' }).notNull().default(false)
});

export const blogPosts = sqliteTable('blog_posts', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  coverUrl: text('cover_url'),
  createdAt: text('created_at').notNull()
});

export const blogPostTranslations = sqliteTable(
  'blog_post_translations',
  {
    postId: text('post_id').notNull().references(() => blogPosts.id),
    locale: text('locale').notNull(),
    title: text('title').notNull(),
    excerpt: text('excerpt'),
    body: text('body'),
    seo: text('seo_json'),
    publishedAt: text('published_at')
  },
  (t) => ({ pk: primaryKey({ columns: [t.postId, t.locale] }) })
);

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  action: text('action').notNull(),
  entity: text('entity'),
  entityId: text('entity_id'),
  meta: text('meta_json'),
  ip: text('ip'),
  createdAt: text('created_at').notNull()
});

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value_json')
});

// === Session Management (Requirement 16.5) ===
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  token: text('token').notNull().unique(),
  ip: text('ip'),
  userAgent: text('user_agent'),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull()
});

// === Rate Limiting (Requirement 16.4) ===
export const rateLimits = sqliteTable('rate_limits', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(), // IP address or user ID
  action: text('action').notNull(), // e.g., 'login', 'api_call', 'password_reset'
  count: integer('count').notNull().default(1),
  windowStart: text('window_start').notNull(), // Start of the time window
  expiresAt: text('expires_at').notNull()
});

// === Resend Webhook Events (Requirement 9.7) ===
export const resendWebhookEvents = sqliteTable('resend_webhook_events', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // e.g., 'email.delivered', 'email.opened', 'email.clicked', 'email.bounced'
  emailLogId: text('email_log_id').references(() => emailLogs.id),
  payload: text('payload_json').notNull(), // Full webhook payload as JSON
  processedAt: text('processed_at'),
  createdAt: text('created_at').notNull()
});
