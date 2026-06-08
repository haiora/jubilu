/**
 * API Types
 * 
 * Type definitions for API requests and responses.
 * These types define the contracts between the frontend and backend.
 */

import type {
  Contact,
  ContactStatus,
  ContactSource,
  Tag,
  ContactNote,
  Segment,
  SegmentDefinition,
  Order,
  OrderStatus,
  Campaign,
  CampaignStatus,
  EmailTemplate,
  Product,
  ProductStatus,
  ProductCategory,
  ProductVariant,
  MediaAsset,
  Locale,
  DashboardOverview,
  RevenueMetrics,
  OrdersMetrics,
  ContactsMetrics,
  CampaignsMetrics,
  TopProduct,
  CategoryRevenue,
  AcquisitionMetrics,
  FunnelMetrics,
  GeoDistribution,
  Activity,
  AdminUser,
  AdminRole,
  AuditLogEntry,
  DateRange,
} from './domain';

// ============================================================================
// Common API Types
// ============================================================================

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
  details?: Record<string, string[]>;
}

export interface ApiMeta {
  page?: number;
  pageSize?: number;
  total?: number;
  hasMore?: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// Contact API Types
// ============================================================================

export interface ContactFilters extends PaginationParams, SortParams {
  status?: ContactStatus;
  country?: string;
  locale?: Locale;
  tags?: string[];
  emailConsent?: boolean;
  search?: string;
}

export interface CreateContactRequest {
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  country?: string;
  locale: Locale;
  status?: ContactStatus;
  source?: ContactSource;
  emailConsent?: boolean;
  tags?: string[];
}

export interface UpdateContactRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  country?: string;
  locale?: Locale;
  status?: ContactStatus;
  emailConsent?: boolean;
}

export interface ContactResponse extends Contact {}

export interface ContactListResponse {
  contacts: Contact[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MergeContactsRequest {
  sourceId: string;
  targetId: string;
}

export interface AddContactTagRequest {
  tagId: string;
}

export interface CreateContactNoteRequest {
  body: string;
  authorName?: string;
}

export interface ImportContactsRequest {
  file: File | Blob;
  fieldMapping?: Record<string, string>;
}

export interface ImportContactsResponse {
  success: number;
  failed: number;
  duplicates: number;
  errors?: Array<{ row: number; error: string }>;
}

// ============================================================================
// Segment API Types
// ============================================================================

export interface CreateSegmentRequest {
  name: string;
  definition: SegmentDefinition;
}

export interface UpdateSegmentRequest {
  name?: string;
  definition?: SegmentDefinition;
}

export interface SegmentResponse extends Segment {}

export interface SegmentListResponse {
  segments: Segment[];
}

export interface SegmentMembersResponse {
  contacts: Contact[];
  total: number;
}

// ============================================================================
// Campaign API Types
// ============================================================================

export interface CampaignFilters extends PaginationParams, SortParams {
  status?: CampaignStatus;
  locale?: Locale;
}

export interface CreateCampaignRequest {
  name: string;
  subject: string;
  templateId?: string;
  segmentId?: string;
  locale?: Locale;
  scheduledAt?: string; // ISO date string
}

export interface UpdateCampaignRequest {
  name?: string;
  subject?: string;
  templateId?: string;
  segmentId?: string;
  status?: CampaignStatus;
  scheduledAt?: string;
}

export interface CampaignResponse extends Campaign {}

export interface CampaignListResponse {
  campaigns: Campaign[];
  total: number;
}

export interface SendCampaignRequest {
  campaignId: string;
}

export interface SendTestEmailRequest {
  emails: string[];
}

// ============================================================================
// Template API Types
// ============================================================================

export interface TemplateFilters {
  locale?: Locale;
  category?: 'transactional' | 'promotional' | 'newsletter';
}

export interface CreateTemplateRequest {
  key: string;
  name: string;
  locale: Locale;
  subject: string;
  html: string;
  category?: 'transactional' | 'promotional' | 'newsletter';
}

export interface UpdateTemplateRequest {
  name?: string;
  subject?: string;
  html?: string;
  category?: 'transactional' | 'promotional' | 'newsletter';
}

export interface TemplateResponse extends EmailTemplate {}

export interface TemplateListResponse {
  templates: EmailTemplate[];
}

export interface RenderTemplateRequest {
  templateId: string;
  variables: Record<string, string>;
}

export interface RenderTemplateResponse {
  html: string;
}

export interface ValidateTemplateRequest {
  html: string;
}

export interface ValidateTemplateResponse {
  valid: boolean;
  errors?: string[];
}

// ============================================================================
// Order API Types
// ============================================================================

export interface OrderFilters extends PaginationParams, SortParams {
  status?: OrderStatus;
  contactId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface CreateOrderRequest {
  contactId?: string;
  items: Array<{
    variantId: string;
    qty: number;
    customText?: string;
  }>;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
  locale: Locale;
}

export interface UpdateOrderRequest {
  status?: OrderStatus;
  shippingAddress?: {
    name?: string;
    line1?: string;
    line2?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
}

export interface OrderResponse extends Order {}

export interface OrderListResponse {
  orders: Order[];
  total: number;
}

export interface CancelOrderRequest {
  reason?: string;
}

export interface RefundOrderRequest {
  amount?: number; // Partial refund amount in cents
  reason?: string;
}

// ============================================================================
// Product API Types
// ============================================================================

export interface ProductFilters extends PaginationParams, SortParams {
  status?: ProductStatus;
  category?: ProductCategory;
  featured?: boolean;
  search?: string;
}

export interface CreateProductRequest {
  slug: string;
  category: ProductCategory;
  status?: ProductStatus;
  featured?: boolean;
  customizable?: boolean;
  basePrice: number;
  currency?: string;
  translations: Record<Locale, {
    name: string;
    shortDesc?: string;
    longDesc?: string;
  }>;
}

export interface UpdateProductRequest {
  slug?: string;
  category?: ProductCategory;
  status?: ProductStatus;
  featured?: boolean;
  customizable?: boolean;
  basePrice?: number;
  translations?: Record<Locale, {
    name?: string;
    shortDesc?: string;
    longDesc?: string;
  }>;
}

export interface ProductResponse extends Product {}

export interface ProductListResponse {
  products: Product[];
  total: number;
}

export interface CreateVariantRequest {
  sku: string;
  name?: string;
  price: number;
  stock: number;
  active?: boolean;
}

export interface UpdateVariantRequest {
  sku?: string;
  name?: string;
  price?: number;
  stock?: number;
  active?: boolean;
}

export interface VariantResponse extends ProductVariant {}

export interface UploadMediaRequest {
  file: File | Blob;
  alt?: string;
  position?: number;
}

export interface MediaResponse extends MediaAsset {}

// ============================================================================
// Dashboard API Types
// ============================================================================

export interface DashboardRequest {
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface DashboardOverviewResponse extends DashboardOverview {}

export interface RevenueMetricsResponse extends RevenueMetrics {}

export interface OrdersMetricsResponse extends OrdersMetrics {}

export interface ContactsMetricsResponse extends ContactsMetrics {}

export interface CampaignsMetricsResponse extends CampaignsMetrics {}

export interface TopProductsResponse {
  products: TopProduct[];
}

export interface RevenueByCategoryResponse {
  categories: CategoryRevenue[];
}

export interface AcquisitionMetricsResponse extends AcquisitionMetrics {}

export interface FunnelMetricsResponse extends FunnelMetrics {}

export interface GeoDistributionResponse {
  distribution: GeoDistribution[];
}

export interface RecentActivityResponse {
  activities: Activity[];
}

// ============================================================================
// Admin & Auth API Types
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AdminUser;
  token?: string;
}

export interface CreateAdminUserRequest {
  email: string;
  name: string;
  password: string;
  role: AdminRole;
}

export interface UpdateAdminUserRequest {
  name?: string;
  role?: AdminRole;
  active?: boolean;
}

export interface AdminUserResponse extends AdminUser {}

export interface AdminUserListResponse {
  users: AdminUser[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuditLogFilters extends PaginationParams {
  userId?: string;
  entityType?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditLogResponse {
  entries: AuditLogEntry[];
  total: number;
}

// ============================================================================
// Settings API Types
// ============================================================================

export interface UpdateSettingsRequest {
  siteName?: string;
  siteDescription?: Record<Locale, string>;
  contactEmail?: string;
  supportEmail?: string;
  defaultLocale?: Locale;
  enabledLocales?: Locale[];
  currency?: string;
  stripePublicKey?: string;
  resendApiKey?: string;
  [key: string]: unknown;
}

export interface SettingsResponse {
  settings: Record<string, unknown>;
}
