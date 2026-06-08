import { z } from 'zod';

// ============================================================================
// BASE VALIDATION SCHEMAS
// ============================================================================

/**
 * Supported locales for the application
 */
export const localeSchema = z.enum(['fr', 'en', 'es', 'he']);
export type Locale = z.infer<typeof localeSchema>;

/**
 * ISO 3166-1 alpha-2 country code (2 characters)
 */
export const countryCodeSchema = z.string().length(2).toUpperCase();

/**
 * Currency code (ISO 4217)
 */
export const currencySchema = z.enum(['EUR', 'USD', 'ILS']);

/**
 * ISO 8601 date string validation
 */
export const isoDateSchema = z.string().datetime();

// ============================================================================
// CONTACT SCHEMAS
// ============================================================================

/**
 * Contact status enumeration
 */
export const contactStatusSchema = z.enum(['lead', 'client', 'donateur']);
export type ContactStatus = z.infer<typeof contactStatusSchema>;

/**
 * Contact source enumeration
 */
export const contactSourceSchema = z.enum(['website', 'import', 'manual', 'checkout', 'campaign']);
export type ContactSource = z.infer<typeof contactSourceSchema>;

/**
 * Base contact schema for creation
 */
export const createContactSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255),
  phone: z.string().max(50).optional(),
  country: countryCodeSchema.optional(),
  locale: localeSchema.default('fr'),
  status: contactStatusSchema.default('lead'),
  source: contactSourceSchema.optional(),
  emailConsent: z.boolean().default(false),
});
export type CreateContactInput = z.infer<typeof createContactSchema>;

/**
 * Update contact schema (all fields optional except constraints)
 */
export const updateContactSchema = createContactSchema.partial();
export type UpdateContactInput = z.infer<typeof updateContactSchema>;

/**
 * Full contact schema with computed fields
 */
export const contactSchema = createContactSchema.extend({
  id: z.string().uuid(),
  ordersCount: z.number().int().nonnegative().default(0),
  totalSpent: z.number().int().nonnegative().default(0), // in cents
  createdAt: isoDateSchema,
});
export type Contact = z.infer<typeof contactSchema>;

/**
 * Contact filters for querying
 */
export const contactFiltersSchema = z.object({
  status: contactStatusSchema.optional(),
  country: countryCodeSchema.optional(),
  locale: localeSchema.optional(),
  emailConsent: z.boolean().optional(),
  source: contactSourceSchema.optional(),
  search: z.string().optional(), // for email, name search
  minTotalSpent: z.number().int().nonnegative().optional(),
  maxTotalSpent: z.number().int().nonnegative().optional(),
  minOrdersCount: z.number().int().nonnegative().optional(),
  tags: z.array(z.string()).optional(),
});
export type ContactFilters = z.infer<typeof contactFiltersSchema>;

// ============================================================================
// TAG SCHEMAS
// ============================================================================

/**
 * Tag creation schema
 */
export const createTagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(), // Hex color code
});
export type CreateTagInput = z.infer<typeof createTagSchema>;

/**
 * Full tag schema
 */
export const tagSchema = createTagSchema.extend({
  id: z.string().uuid(),
});
export type Tag = z.infer<typeof tagSchema>;

// ============================================================================
// CONTACT NOTE SCHEMAS
// ============================================================================

/**
 * Contact note creation schema
 */
export const createContactNoteSchema = z.object({
  contactId: z.string().uuid(),
  body: z.string().min(1).max(5000),
  authorId: z.string().uuid().optional(),
});
export type CreateContactNoteInput = z.infer<typeof createContactNoteSchema>;

/**
 * Full contact note schema
 */
export const contactNoteSchema = createContactNoteSchema.extend({
  id: z.string().uuid(),
  authorName: z.string().optional(),
  createdAt: isoDateSchema,
});
export type ContactNote = z.infer<typeof contactNoteSchema>;

// ============================================================================
// SEGMENT SCHEMAS
// ============================================================================

/**
 * Segment filter operator
 */
export const segmentOperatorSchema = z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'notIn', 'contains']);
export type SegmentOperator = z.infer<typeof segmentOperatorSchema>;

/**
 * Segment filter field
 */
export const segmentFilterFieldSchema = z.enum([
  'status',
  'country',
  'locale',
  'tags',
  'totalSpent',
  'ordersCount',
  'lastOrderDate',
  'emailConsent',
]);
export type SegmentFilterField = z.infer<typeof segmentFilterFieldSchema>;

/**
 * Individual segment filter
 */
export const segmentFilterSchema = z.object({
  field: segmentFilterFieldSchema,
  operator: segmentOperatorSchema,
  value: z.union([z.string(), z.number(), z.array(z.string()), z.array(z.number())]),
});
export type SegmentFilter = z.infer<typeof segmentFilterSchema>;

/**
 * Segment definition with filters
 */
export const segmentDefinitionSchema = z.object({
  filters: z.array(segmentFilterSchema),
  operator: z.enum(['AND', 'OR']).default('AND'),
});
export type SegmentDefinition = z.infer<typeof segmentDefinitionSchema>;

/**
 * Segment creation schema
 */
export const createSegmentSchema = z.object({
  name: z.string().min(1).max(100),
  definition: segmentDefinitionSchema,
});
export type CreateSegmentInput = z.infer<typeof createSegmentSchema>;

/**
 * Full segment schema
 */
export const segmentSchema = createSegmentSchema.extend({
  id: z.string().uuid(),
  memberCount: z.number().int().nonnegative().optional(),
});
export type Segment = z.infer<typeof segmentSchema>;

// ============================================================================
// PRODUCT SCHEMAS
// ============================================================================

/**
 * Product category enumeration
 */
export const productCategorySchema = z.enum(['wine-white', 'wine-red', 'wine-rose', 'parchments']);
export type ProductCategory = z.infer<typeof productCategorySchema>;

/**
 * Product status enumeration
 */
export const productStatusSchema = z.enum(['active', 'draft', 'archived']);
export type ProductStatus = z.infer<typeof productStatusSchema>;

/**
 * Product translation schema
 */
export const productTranslationSchema = z.object({
  name: z.string().min(1).max(200),
  shortDesc: z.string().max(500).optional(),
  longDesc: z.string().max(5000).optional(),
});
export type ProductTranslation = z.infer<typeof productTranslationSchema>;

/**
 * Product creation schema
 */
export const createProductSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  category: productCategorySchema,
  status: productStatusSchema.default('draft'),
  featured: z.boolean().default(false),
  customizable: z.boolean().default(false),
  basePrice: z.number().int().positive(), // in cents
  currency: currencySchema.default('EUR'),
  translations: z.record(localeSchema, productTranslationSchema),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;

/**
 * Update product schema
 */
export const updateProductSchema = createProductSchema.partial().extend({
  translations: z.record(localeSchema, productTranslationSchema).optional(),
});
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

/**
 * Full product schema
 */
export const productSchema = createProductSchema.extend({
  id: z.string().uuid(),
  createdAt: isoDateSchema,
});
export type Product = z.infer<typeof productSchema>;

// ============================================================================
// PRODUCT VARIANT SCHEMAS
// ============================================================================

/**
 * Product variant creation schema
 */
export const createProductVariantSchema = z.object({
  productId: z.string().uuid(),
  sku: z.string().min(1).max(50).toUpperCase(),
  name: z.string().max(100).optional(),
  price: z.number().int().positive(), // in cents
  stock: z.number().int().nonnegative().default(0),
  active: z.boolean().default(true),
});
export type CreateProductVariantInput = z.infer<typeof createProductVariantSchema>;

/**
 * Update product variant schema
 */
export const updateProductVariantSchema = createProductVariantSchema.partial().omit({ productId: true });
export type UpdateProductVariantInput = z.infer<typeof updateProductVariantSchema>;

/**
 * Full product variant schema
 */
export const productVariantSchema = createProductVariantSchema.extend({
  id: z.string().uuid(),
});
export type ProductVariant = z.infer<typeof productVariantSchema>;

// ============================================================================
// ORDER SCHEMAS
// ============================================================================

/**
 * Order status enumeration
 */
export const orderStatusSchema = z.enum([
  'pending',
  'paid',
  'prepared',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

/**
 * Production status for parchments
 */
export const productionStatusSchema = z.enum([
  'to_produce',
  'in_production',
  'quality_check',
  'ready',
  'shipped',
]);
export type ProductionStatus = z.infer<typeof productionStatusSchema>;

/**
 * Shipping address schema
 */
export const addressSchema = z.object({
  name: z.string().min(1).max(200),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  postalCode: z.string().min(1).max(20),
  country: countryCodeSchema,
});
export type Address = z.infer<typeof addressSchema>;

/**
 * Order item schema
 */
export const orderItemSchema = z.object({
  variantId: z.string().uuid().optional(),
  nameSnapshot: z.string().min(1).max(200),
  unitPrice: z.number().int().nonnegative(), // in cents
  qty: z.number().int().positive().default(1),
  customText: z.string().max(500).optional(), // for parchments
  productionStatus: productionStatusSchema.optional(),
});
export type OrderItem = z.infer<typeof orderItemSchema>;

/**
 * Order creation schema
 */
export const createOrderSchema = z.object({
  contactId: z.string().uuid().optional(),
  status: orderStatusSchema.default('pending'),
  subtotal: z.number().int().nonnegative().default(0), // in cents
  shipping: z.number().int().nonnegative().default(0), // in cents
  tax: z.number().int().nonnegative().default(0), // in cents
  total: z.number().int().nonnegative().default(0), // in cents
  currency: currencySchema.default('EUR'),
  locale: localeSchema.default('fr'),
  shippingAddress: addressSchema.optional(),
  items: z.array(orderItemSchema).min(1),
  stripeSessionId: z.string().optional(),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

/**
 * Update order schema
 */
export const updateOrderSchema = createOrderSchema.partial().extend({
  items: z.array(orderItemSchema).min(1).optional(),
});
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;

/**
 * Full order schema
 */
export const orderSchema = createOrderSchema.extend({
  id: z.string().uuid(),
  number: z.string(), // e.g., "JUB-2024-0001"
  createdAt: isoDateSchema,
});
export type Order = z.infer<typeof orderSchema>;

/**
 * Order filters for querying
 */
export const orderFiltersSchema = z.object({
  status: orderStatusSchema.optional(),
  contactId: z.string().uuid().optional(),
  locale: localeSchema.optional(),
  minTotal: z.number().int().nonnegative().optional(),
  maxTotal: z.number().int().nonnegative().optional(),
  startDate: isoDateSchema.optional(),
  endDate: isoDateSchema.optional(),
  search: z.string().optional(), // for order number, customer name/email
});
export type OrderFilters = z.infer<typeof orderFiltersSchema>;

// ============================================================================
// CAMPAIGN SCHEMAS
// ============================================================================

/**
 * Campaign status enumeration
 */
export const campaignStatusSchema = z.enum(['draft', 'scheduled', 'sending', 'sent', 'archived']);
export type CampaignStatus = z.infer<typeof campaignStatusSchema>;

/**
 * Email type enumeration
 */
export const emailTypeSchema = z.enum(['transactional', 'campaign']);
export type EmailType = z.infer<typeof emailTypeSchema>;

/**
 * Email status for tracking
 */
export const emailStatusSchema = z.enum(['sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed']);
export type EmailStatus = z.infer<typeof emailStatusSchema>;

/**
 * Campaign statistics schema
 */
export const campaignStatsSchema = z.object({
  sent: z.number().int().nonnegative().default(0),
  delivered: z.number().int().nonnegative().default(0),
  opened: z.number().int().nonnegative().default(0),
  clicked: z.number().int().nonnegative().default(0),
  bounced: z.number().int().nonnegative().default(0),
  unsubscribed: z.number().int().nonnegative().default(0),
  deliveryRate: z.number().min(0).max(100).default(0), // percentage
  openRate: z.number().min(0).max(100).default(0), // percentage
  clickRate: z.number().min(0).max(100).default(0), // percentage
});
export type CampaignStats = z.infer<typeof campaignStatsSchema>;

/**
 * Campaign creation schema
 */
export const createCampaignSchema = z.object({
  name: z.string().min(1).max(200),
  subject: z.string().min(1).max(200),
  templateId: z.string().uuid().optional(),
  segmentId: z.string().uuid().optional(),
  status: campaignStatusSchema.default('draft'),
  locale: localeSchema.optional(),
  scheduledAt: isoDateSchema.optional(),
});
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;

/**
 * Update campaign schema
 */
export const updateCampaignSchema = createCampaignSchema.partial();
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;

/**
 * Full campaign schema
 */
export const campaignSchema = createCampaignSchema.extend({
  id: z.string().uuid(),
  sentAt: isoDateSchema.optional(),
  stats: campaignStatsSchema.optional(),
  createdAt: isoDateSchema,
});
export type Campaign = z.infer<typeof campaignSchema>;

// ============================================================================
// EMAIL TEMPLATE SCHEMAS
// ============================================================================

/**
 * Email template category
 */
export const templateCategorySchema = z.enum(['transactional', 'promotional', 'newsletter']);
export type TemplateCategory = z.infer<typeof templateCategorySchema>;

/**
 * Email template creation schema
 */
export const createEmailTemplateSchema = z.object({
  key: z.string().min(1).max(100).regex(/^[a-z0-9-_]+$/),
  name: z.string().min(1).max(200),
  locale: localeSchema,
  subject: z.string().min(1).max(200),
  html: z.string().min(1),
  variables: z.array(z.string()).optional(), // e.g., ['firstName', 'orderNumber']
  category: templateCategorySchema.optional(),
});
export type CreateEmailTemplateInput = z.infer<typeof createEmailTemplateSchema>;

/**
 * Update email template schema
 */
export const updateEmailTemplateSchema = createEmailTemplateSchema.partial().omit({ key: true, locale: true });
export type UpdateEmailTemplateInput = z.infer<typeof updateEmailTemplateSchema>;

/**
 * Full email template schema
 */
export const emailTemplateSchema = createEmailTemplateSchema.extend({
  id: z.string().uuid(),
  updatedAt: isoDateSchema,
});
export type EmailTemplate = z.infer<typeof emailTemplateSchema>;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Safe parse with detailed error messages
 * Returns parsed data or throws formatted error
 */
export function parseOrThrow<T>(schema: z.ZodSchema<T>, data: unknown, context?: string): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.flatten();
    const message = context 
      ? `Validation failed for ${context}: ${JSON.stringify(errors.fieldErrors)}`
      : `Validation failed: ${JSON.stringify(errors.fieldErrors)}`;
    
    throw new ValidationError(message, errors.fieldErrors);
  }
  
  return result.data;
}

/**
 * Safe parse that returns Result type instead of throwing
 */
export function safeParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodFormattedError<T> } {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    return {
      success: false,
      errors: result.error.format() as z.ZodFormattedError<T>,
    };
  }
  
  return {
    success: true,
    data: result.data,
  };
}

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public fieldErrors: Record<string, string[] | undefined>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates and coerces a value to a positive integer (for prices, quantities)
 */
export const positiveIntSchema = z.number().int().positive();

/**
 * Validates and coerces a value to a non-negative integer (for counts, stock)
 */
export const nonNegativeIntSchema = z.number().int().nonnegative();

/**
 * Schema for pagination parameters
 */
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
});
export type PaginationParams = z.infer<typeof paginationSchema>;

/**
 * Schema for sorting parameters
 */
export const sortSchema = z.object({
  sortBy: z.string(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
export type SortParams = z.infer<typeof sortSchema>;

/**
 * Schema for date range filters
 */
export const dateRangeSchema = z.object({
  startDate: isoDateSchema.optional(),
  endDate: isoDateSchema.optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  { message: 'Start date must be before or equal to end date' }
);
export type DateRange = z.infer<typeof dateRangeSchema>;
