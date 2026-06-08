/**
 * Domain Types
 * 
 * Core business domain type definitions for the Jubilu system.
 * These types represent the business logic layer and are independent
 * of database implementation or API contracts.
 */

export type Locale = 'fr' | 'en' | 'es' | 'he';

// ============================================================================
// CRM Domain Types
// ============================================================================

export type ContactStatus = 'lead' | 'client' | 'donateur';
export type ContactSource = 'website' | 'import' | 'manual' | 'checkout' | 'campaign';

export interface Contact {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  country?: string;
  locale: Locale;
  status: ContactStatus;
  source?: ContactSource;
  emailConsent: boolean;
  ordersCount: number;
  totalSpent: number; // in cents
  createdAt: Date;
  updatedAt?: Date;
  tags?: Tag[];
  notes?: ContactNote[];
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt?: Date;
}

export interface ContactNote {
  id: string;
  contactId: string;
  authorId?: string;
  authorName?: string;
  body: string;
  createdAt: Date;
}

export interface Segment {
  id: string;
  name: string;
  definition: SegmentDefinition;
  memberCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SegmentDefinition {
  filters: SegmentFilter[];
  operator: 'AND' | 'OR';
}

export type SegmentFilterField = 
  | 'status' 
  | 'country' 
  | 'locale' 
  | 'tags' 
  | 'totalSpent' 
  | 'ordersCount' 
  | 'lastOrderDate'
  | 'emailConsent'
  | 'source';

export type SegmentFilterOperator = 
  | 'eq' 
  | 'ne' 
  | 'gt' 
  | 'gte' 
  | 'lt' 
  | 'lte' 
  | 'in' 
  | 'notIn' 
  | 'contains';

export interface SegmentFilter {
  field: SegmentFilterField;
  operator: SegmentFilterOperator;
  value: string | number | string[] | number[];
}

// ============================================================================
// Orders Domain Types
// ============================================================================

export type OrderStatus = 
  | 'pending' 
  | 'paid' 
  | 'prepared' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded';

export type ProductionStatus = 
  | 'to_produce' 
  | 'in_production' 
  | 'quality_check' 
  | 'ready' 
  | 'shipped';

export interface Order {
  id: string;
  number: string;
  contactId?: string;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  locale: Locale;
  shippingAddress?: Address;
  items: OrderItem[];
  stripeSessionId?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  variantId?: string;
  nameSnapshot: string;
  unitPrice: number;
  qty: number;
  customText?: string; // For parchments
  productionStatus?: ProductionStatus;
}

export interface Address {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
}

// ============================================================================
// Campaigns Domain Types
// ============================================================================

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'archived';
export type EmailType = 'transactional' | 'campaign';
export type EmailStatus = 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  templateId?: string;
  segmentId?: string;
  status: CampaignStatus;
  locale?: Locale;
  scheduledAt?: Date;
  sentAt?: Date;
  stats?: CampaignStats;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CampaignStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
}

export interface EmailTemplate {
  id: string;
  key: string;
  name: string;
  locale: Locale;
  subject: string;
  html: string;
  variables?: string[]; // List of available {{variable}}
  category?: 'transactional' | 'promotional' | 'newsletter';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmailLog {
  id: string;
  campaignId?: string;
  contactId?: string;
  type: EmailType;
  resendId?: string;
  status: EmailStatus;
  openedAt?: Date;
  clickedAt?: Date;
  bouncedAt?: Date;
  createdAt: Date;
}

// ============================================================================
// Products Domain Types
// ============================================================================

export type ProductCategory = 'wine-white' | 'wine-red' | 'wine-rose' | 'parchments';
export type ProductStatus = 'active' | 'draft' | 'archived';

export interface Product {
  id: string;
  slug: string;
  category: ProductCategory;
  status: ProductStatus;
  featured: boolean;
  customizable: boolean;
  basePrice: number;
  currency: string;
  translations: Record<Locale, ProductTranslation>;
  variants: ProductVariant[];
  media: MediaAsset[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface ProductTranslation {
  name: string;
  shortDesc?: string;
  longDesc?: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name?: string;
  price: number;
  stock: number;
  active: boolean;
}

export interface MediaAsset {
  id: string;
  productId?: string;
  url: string;
  alt?: string;
  position: number;
}

// ============================================================================
// Analytics Domain Types
// ============================================================================

export interface DateRange {
  start: Date;
  end: Date;
}

export interface DashboardOverview {
  totalRevenue: number;
  revenueChange: number; // percentage vs previous period
  totalOrders: number;
  ordersChange: number;
  newContacts: number;
  contactsChange: number;
  avgCartValue: number;
  avgCartChange: number;
}

export interface RevenueMetrics {
  total: number;
  byPeriod: { date: string; amount: number }[];
  byCategory: CategoryRevenue[];
}

export interface OrdersMetrics {
  total: number;
  byStatus: { status: OrderStatus; count: number }[];
  avgFulfillmentTime: number; // in hours
}

export interface ContactsMetrics {
  total: number;
  byStatus: { status: ContactStatus; count: number }[];
  newThisPeriod: number;
  conversionRate: number; // lead to client
}

export interface CampaignsMetrics {
  totalSent: number;
  avgOpenRate: number;
  avgClickRate: number;
  avgDeliveryRate: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  unitsSold: number;
  revenue: number;
}

export interface CategoryRevenue {
  category: ProductCategory;
  revenue: number;
  percentage: number;
}

export interface AcquisitionMetrics {
  newCustomers: number;
  returningCustomers: number;
  retentionRate: number;
}

export interface FunnelMetrics {
  visits: number;
  cartAdds: number;
  checkoutStarts: number;
  purchases: number;
  cartConversion: number; // percentage
  checkoutConversion: number; // percentage
}

export interface GeoDistribution {
  country: string;
  customerCount: number;
  revenue: number;
}

export type ActivityType = 'order' | 'contact' | 'campaign';

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Admin & Auth Domain Types
// ============================================================================

export type AdminRole = 
  | 'super_admin' 
  | 'admin' 
  | 'shop' 
  | 'crm' 
  | 'content' 
  | 'marketing' 
  | 'support';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  active: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  ipAddress?: string;
  timestamp: Date;
}
