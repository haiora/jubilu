/**
 * Database Types
 * 
 * Type definitions for database entities and operations.
 * These types map to the Drizzle ORM schema and database tables.
 */

import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// Note: These will be properly typed once the database schema is imported
// For now, we provide the structure that the schema should follow

// ============================================================================
// Contact Database Types
// ============================================================================

export interface ContactTable {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  locale: string;
  status: string;
  source: string | null;
  emailConsent: boolean;
  ordersCount: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

export type DbContact = ContactTable;
export type NewDbContact = Omit<ContactTable, 'id' | 'createdAt' | 'updatedAt'>;

// ============================================================================
// Tag Database Types
// ============================================================================

export interface TagTable {
  id: string;
  name: string;
  color: string | null;
  createdAt: Date;
}

export type DbTag = TagTable;
export type NewDbTag = Omit<TagTable, 'id' | 'createdAt'>;

// ============================================================================
// Contact Tag Junction Table
// ============================================================================

export interface ContactTagTable {
  contactId: string;
  tagId: string;
  createdAt: Date;
}

export type DbContactTag = ContactTagTable;
export type NewDbContactTag = ContactTagTable;

// ============================================================================
// Contact Note Database Types
// ============================================================================

export interface ContactNoteTable {
  id: string;
  contactId: string;
  authorId: string | null;
  authorName: string | null;
  body: string;
  createdAt: Date;
}

export type DbContactNote = ContactNoteTable;
export type NewDbContactNote = Omit<ContactNoteTable, 'id' | 'createdAt'>;

// ============================================================================
// Segment Database Types
// ============================================================================

export interface SegmentTable {
  id: string;
  name: string;
  definition: string; // JSON string of SegmentDefinition
  createdAt: Date;
  updatedAt: Date;
}

export type DbSegment = SegmentTable;
export type NewDbSegment = Omit<SegmentTable, 'id' | 'createdAt' | 'updatedAt'>;

// ============================================================================
// Order Database Types
// ============================================================================

export interface OrderTable {
  id: string;
  number: string;
  contactId: string | null;
  status: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  locale: string;
  shippingAddress: string | null; // JSON string of Address
  stripeSessionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type DbOrder = OrderTable;
export type NewDbOrder = Omit<OrderTable, 'id' | 'number' | 'createdAt' | 'updatedAt'>;

// ============================================================================
// Order Item Database Types
// ============================================================================

export interface OrderItemTable {
  id: string;
  orderId: string;
  variantId: string | null;
  nameSnapshot: string;
  unitPrice: number;
  qty: number;
  customText: string | null;
  productionStatus: string | null;
  createdAt: Date;
}

export type DbOrderItem = OrderItemTable;
export type NewDbOrderItem = Omit<OrderItemTable, 'id' | 'createdAt'>;

// ============================================================================
// Campaign Database Types
// ============================================================================

export interface CampaignTable {
  id: string;
  name: string;
  subject: string;
  templateId: string | null;
  segmentId: string | null;
  status: string;
  locale: string | null;
  scheduledAt: Date | null;
  sentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type DbCampaign = CampaignTable;
export type NewDbCampaign = Omit<CampaignTable, 'id' | 'createdAt' | 'updatedAt'>;

// ============================================================================
// Email Template Database Types
// ============================================================================

export interface EmailTemplateTable {
  id: string;
  key: string;
  name: string;
  locale: string;
  subject: string;
  html: string;
  variables: string | null; // JSON string of string[]
  category: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type DbEmailTemplate = EmailTemplateTable;
export type NewDbEmailTemplate = Omit<EmailTemplateTable, 'id' | 'createdAt' | 'updatedAt'>;

// ============================================================================
// Email Log Database Types
// ============================================================================

export interface EmailLogTable {
  id: string;
  campaignId: string | null;
  contactId: string | null;
  type: string;
  resendId: string | null;
  status: string;
  openedAt: Date | null;
  clickedAt: Date | null;
  bouncedAt: Date | null;
  createdAt: Date;
}

export type DbEmailLog = EmailLogTable;
export type NewDbEmailLog = Omit<EmailLogTable, 'id' | 'createdAt'>;

// ============================================================================
// Product Database Types
// ============================================================================

export interface ProductTable {
  id: string;
  slug: string;
  category: string;
  status: string;
  featured: boolean;
  customizable: boolean;
  basePrice: number;
  currency: string;
  translations: string; // JSON string of Record<Locale, ProductTranslation>
  createdAt: Date;
  updatedAt: Date;
}

export type DbProduct = ProductTable;
export type NewDbProduct = Omit<ProductTable, 'id' | 'createdAt' | 'updatedAt'>;

// ============================================================================
// Product Variant Database Types
// ============================================================================

export interface ProductVariantTable {
  id: string;
  productId: string;
  sku: string;
  name: string | null;
  price: number;
  stock: number;
  active: boolean;
  createdAt: Date;
}

export type DbProductVariant = ProductVariantTable;
export type NewDbProductVariant = Omit<ProductVariantTable, 'id' | 'createdAt'>;

// ============================================================================
// Media Asset Database Types
// ============================================================================

export interface MediaAssetTable {
  id: string;
  productId: string | null;
  url: string;
  alt: string | null;
  position: number;
  createdAt: Date;
}

export type DbMediaAsset = MediaAssetTable;
export type NewDbMediaAsset = Omit<MediaAssetTable, 'id' | 'createdAt'>;

// ============================================================================
// Admin User Database Types
// ============================================================================

export interface AdminUserTable {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
}

export type DbAdminUser = AdminUserTable;
export type NewDbAdminUser = Omit<AdminUserTable, 'id' | 'createdAt' | 'lastLoginAt'>;

// ============================================================================
// Audit Log Database Types
// ============================================================================

export interface AuditLogTable {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string | null;
  changes: string | null; // JSON string of Record<string, {old: unknown, new: unknown}>
  ipAddress: string | null;
  timestamp: Date;
}

export type DbAuditLog = AuditLogTable;
export type NewDbAuditLog = Omit<AuditLogTable, 'id' | 'timestamp'>;

// ============================================================================
// Stock Movement Database Types
// ============================================================================

export interface StockMovementTable {
  id: string;
  variantId: string;
  qty: number; // Positive for additions, negative for subtractions
  reason: string;
  authorId: string | null;
  authorName: string | null;
  createdAt: Date;
}

export type DbStockMovement = StockMovementTable;
export type NewDbStockMovement = Omit<StockMovementTable, 'id' | 'createdAt'>;

// ============================================================================
// Helper Types for Database Operations
// ============================================================================

export interface WithTimestamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface WithCreatedAt {
  createdAt: Date;
}

export type Insertable<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
export type Updateable<T> = Partial<Omit<T, 'id' | 'createdAt'>>;

// ============================================================================
// Query Result Types
// ============================================================================

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}
