# Implementation Plan: Jubilu System Improvements

## Overview

Ce plan d'implémentation détaille les tâches nécessaires pour améliorer le système Jubilu existant selon 10 phases majeures : refactoring architectural, optimisation performance, amélioration CRM, système d'emailing, support multilingue/RTL, design system moderne, dashboard analytics, sécurité RBAC, testing, et migration/déploiement.

Chaque tâche est atomique, testable et référence les requirements spécifiques qu'elle implémente.

## Tasks

- [ ] 1. Architecture Refactoring & Foundation
  - [x] 1.1 Create layered architecture structure
    - Create `lib/domains/` directory structure with subdirectories for crm, orders, products, campaigns, analytics
    - Create `lib/repositories/` directory for data access layer
    - Create `lib/utils/` directory for shared utilities (validation, formatting, dates, errors)
    - Create `types/domain.ts`, `types/api.ts`, `types/database.ts` for type definitions
    - _Requirements: 1.3, 1.5_

  - [x] 1.2 Implement Result type pattern for error handling
    - Create `lib/utils/result.ts` with Result<T, E> type, ok() and err() helper functions
    - Implement type guards (isOk, isErr) for Result type
    - Add documentation with usage examples
    - _Requirements: 1.4_

  - [x] 1.3 Create error hierarchy classes
    - Create `lib/utils/errors.ts` with custom error classes: ValidationError, NotFoundError, UnauthorizedError, ForbiddenError, ConflictError, ExternalServiceError
    - Implement error serialization for API responses
    - Add error logging integration
    - _Requirements: 1.4_

  - [-] 1.4 Implement global error handler middleware
    - Create `app/api/middleware/error-handler.ts` to catch and format errors consistently
    - Add error response standardization with status codes and messages
    - Implement development vs production error detail handling
    - _Requirements: 1.4_

  - [x] 1.5 Create Zod validation schemas foundation
    - Create `lib/utils/validation.ts` with base schemas for contact, segment, campaign, product, order
    - Implement schema composition utilities for reusability
    - Add runtime validation helper functions (safeParse, parseOrThrow)
    - _Requirements: 1.7_


- [ ] 2. Database Schema Enhancement
  - [-] 2.1 Extend existing database schema
    - Add new columns to contacts table: lastActivityAt, lastOrderAt, avgCartValue
    - Add new columns to campaigns table: htmlContent, plainTextContent
    - Add new columns to orders table: fulfilledAt, shippedAt, deliveredAt, trackingNumber
    - Update Drizzle schema in `db/schema.ts`
    - _Requirements: 7.3, 7.8, 13.3_

  - [ ] 2.2 Create new database tables for enhanced functionality
    - Create sessions table with id, userId, token, ip, userAgent, expiresAt, createdAt
    - Create rateLimits table with id, identifier, action, count, windowStart, expiresAt
    - Create resendWebhookEvents table with id, type, emailLogId, payload, processedAt, createdAt
    - Update Drizzle schema with foreign key relationships
    - _Requirements: 16.5, 16.4, 9.7_

  - [~] 2.3 Add database indexes for performance optimization
    - Add indexes on contacts: email, status, createdAt
    - Add indexes on orders: contactId, status, createdAt
    - Add indexes on campaigns: status, scheduledAt
    - Add indexes on sessions: token, expiresAt
    - Add indexes on emailLogs: campaignId, contactId, status
    - _Requirements: 2.5_

  - [~] 2.4 Create and run database migrations
    - Generate migration files with `drizzle-kit generate`
    - Create migration runner script in `db/migrate.ts`
    - Test migrations on development database
    - Document rollback procedures
    - _Requirements: 2.5_

- [ ] 3. Core Repositories Implementation
  - [~] 3.1 Implement contacts repository
    - Create `lib/repositories/contacts.repository.ts` with CRUD operations
    - Implement findById, findByEmail, findAll with filtering
    - Implement create, update, delete, updateStatus, updateTotalSpent methods
    - Add query methods: countByStatus, searchByQuery, findByTags
    - _Requirements: 7.1, 7.6_

  - [~] 3.2 Implement orders repository
    - Create `lib/repositories/orders.repository.ts` with CRUD operations
    - Implement findById, findAll with filtering by status, contactId, dateRange
    - Implement create, updateStatus, cancel, addNote methods
    - Add aggregate methods: countByContact, sumTotalByContact, getRevenueMetrics
    - _Requirements: 13.1, 13.2, 14.1_


  - [~] 3.3 Implement products repository
    - Create `lib/repositories/products.repository.ts` with CRUD operations
    - Implement findById, findBySlug, findAll with filtering by category, status
    - Implement create, update, delete, updateStatus methods
    - Add methods for variants: createVariant, updateVariant, deleteVariant, updateStock
    - _Requirements: 12.1, 12.2, 12.8_

  - [~] 3.4 Implement campaigns repository
    - Create `lib/repositories/campaigns.repository.ts` with CRUD operations
    - Implement findById, findAll, create, update, delete, updateStatus
    - Add methods: getStats, duplicate
    - Implement query methods for scheduled campaigns
    - _Requirements: 9.5, 9.8, 9.14_

  - [~] 3.5 Implement segments repository
    - Create `lib/repositories/segments.repository.ts` with CRUD operations
    - Implement findById, findAll, create, update, delete
    - Add method to evaluate segment filters and return matching contact IDs
    - Implement countMembers and getMembers methods
    - _Requirements: 11.1, 11.2, 11.4_

  - [~] 3.6 Implement email templates repository
    - Create `lib/repositories/templates.repository.ts` with CRUD operations
    - Implement findById, findByKey, findAll with locale filtering
    - Implement create, update, delete methods
    - Add versioning support for template history
    - _Requirements: 10.1, 10.2, 10.4_

- [ ] 4. CRM Services Implementation
  - [~] 4.1 Implement contacts service
    - Create `lib/domains/crm/contacts.service.ts` with business logic
    - Implement getAll, getById, create, update, delete methods using Result pattern
    - Implement updateStatusBasedOnOrders to auto-promote lead to client
    - Implement calculateLifetimeValue method
    - _Requirements: 7.2, 7.3_

  - [~] 4.2 Implement contact merge functionality
    - Add merge method to contacts service to combine duplicate contacts
    - Transfer orders, notes, tags from source to target contact
    - Update totalSpent and ordersCount on target contact
    - Delete source contact after successful merge
    - _Requirements: 3.8_


  - [~] 4.3 Implement tags management in CRM service
    - Add addTag, removeTag methods to contacts service
    - Create tags service in `lib/domains/crm/tags.service.ts` for tag CRUD
    - Implement color-coded tag system with hex color validation
    - Add bulk tag assignment functionality
    - _Requirements: 7.4, 7.11_

  - [~] 4.4 Implement contact notes functionality
    - Add addNote method to contacts service
    - Store author information (userId or name) with each note
    - Implement timestamped notes with automatic createdAt
    - Add notes to contact activity timeline
    - _Requirements: 7.5_

  - [~] 4.5 Implement contact search functionality
    - Add search method to contacts service with query string parameter
    - Search across firstName, lastName, email, phone fields
    - Implement fuzzy matching using SQL LIKE with wildcards
    - Return results ordered by relevance
    - _Requirements: 7.6_

  - [~] 4.6 Implement CSV import for contacts
    - Create importFromCsv method in contacts service
    - Parse CSV file and map columns to contact fields
    - Validate each row using Zod schema
    - Detect duplicates by email and offer merge/skip/overwrite options
    - Return ImportResult with success count, error count, and error details
    - _Requirements: 3.3_

  - [~] 4.7 Implement CSV export for contacts
    - Create exportToCsv method in contacts service
    - Support filtering exports by status, tags, country
    - Generate CSV with all contact fields including custom fields
    - Return Blob for download
    - _Requirements: 3.4_

  - [~] 4.8 Implement segments service
    - Create `lib/domains/crm/segments.service.ts` with CRUD operations
    - Implement evaluateFilters method to build SQL queries from SegmentDefinition
    - Support AND/OR logic for compound filters
    - Implement real-time member count calculation
    - _Requirements: 11.1, 11.2, 11.4, 11.5_

  - [~] 4.9 Implement advanced segment filtering
    - Add support for filters on: status, tags, country, locale, emailConsent
    - Add support for order-based filters: totalSpent, ordersCount, lastOrderDate
    - Implement negative filters (e.g., "has not purchased in X days")
    - Support operators: eq, ne, gt, gte, lt, lte, in, notIn, contains
    - _Requirements: 11.1, 11.3, 11.8_


- [~] 5. Checkpoint - Verify CRM Foundation
  - Ensure all CRM services and repositories are implemented
  - Run unit tests for contacts, segments, tags services
  - Verify database queries are optimized with proper indexes
  - Ask the user if questions arise

- [ ] 6. Email System Implementation
  - [~] 6.1 Set up Resend client integration
    - Create `lib/email/client.ts` with Resend initialization
    - Configure FROM_EMAIL and environment variables
    - Add error handling for API failures
    - _Requirements: 9.1_

  - [~] 6.2 Implement email service for transactional emails
    - Create `lib/email/email.service.ts` with sendTransactional method
    - Implement email types: orderConfirmation, shippingNotification, passwordReset
    - Support template rendering with variables
    - Add multilingual template selection based on recipient locale
    - _Requirements: 9.1, 9.9_

  - [~] 6.3 Implement email templates service
    - Create `lib/domains/campaigns/templates.service.ts` with CRUD operations
    - Implement render method to replace {{variables}} with actual values
    - Add extractVariables method to parse template and find all {{variable}} placeholders
    - Implement validateTemplate method to check HTML structure
    - _Requirements: 10.1, 10.5, 10.6_

  - [~] 6.4 Implement template categories and versioning
    - Add category field to templates (transactional, promotional, newsletter)
    - Implement version tracking to save template history on each update
    - Add ability to restore previous versions
    - _Requirements: 10.3, 10.4_

  - [~] 6.5 Implement campaigns service
    - Create `lib/domains/campaigns/campaigns.service.ts` with CRUD operations
    - Implement send method to dispatch emails to segment members
    - Implement schedule method to save campaign for future sending
    - Add sendTest method to send preview emails to test addresses
    - _Requirements: 9.2, 9.5, 9.6, 9.10_

  - [~] 6.6 Implement campaign execution logic
    - Add logic in send method to resolve segment members
    - Render template for each recipient with personalized variables (name, custom fields)
    - Send emails in batches using Resend API
    - Create emailLog entry for each sent email
    - _Requirements: 9.4, 9.13_


  - [~] 6.7 Implement email tracking via webhooks
    - Create `app/api/webhook/resend/route.ts` to handle Resend webhook events
    - Implement handlers for: email.delivered, email.opened, email.clicked, email.bounced
    - Update emailLogs table with event timestamps
    - Create resendWebhookEvents table entries for audit
    - _Requirements: 9.7_

  - [~] 6.8 Implement campaign analytics
    - Add getStats method to campaigns service
    - Calculate metrics: sent, delivered, opened, clicked, bounced, unsubscribed counts
    - Calculate rates: deliveryRate, openRate, clickRate
    - Cache stats with periodic refresh
    - _Requirements: 9.8_

  - [~] 6.9 Implement unsubscribe functionality
    - Add unsubscribe link to all campaign emails
    - Create `app/api/unsubscribe/[token]/route.ts` for one-click unsubscribe
    - Update contact emailConsent to false when unsubscribed
    - Track unsubscribe in campaign stats
    - _Requirements: 9.11_

  - [~] 6.10 Handle email bounces and invalid emails
    - When permanent bounce occurs, flag contact email as invalid
    - Add invalidEmail field to contacts table
    - Prevent sending to contacts with invalidEmail=true
    - Log bounce reasons for review
    - _Requirements: 9.15_

  - [~] 6.11 Implement campaign duplication
    - Add duplicate method to campaigns service
    - Copy campaign with new name (e.g., "Copy of X")
    - Reset status to draft and clear stats
    - Preserve template, segment, and content
    - _Requirements: 9.14_

- [ ] 7. Orders and Products Enhancement
  - [~] 7.1 Implement products service
    - Create `lib/domains/products/products.service.ts` with CRUD operations
    - Support multilingual product content via translations field
    - Implement featured product management
    - Add stock tracking integration
    - _Requirements: 12.1, 12.4, 12.6_

  - [~] 7.2 Implement product variants management
    - Add createVariant, updateVariant, deleteVariant methods to products service
    - Support SKU, price, and stock per variant
    - Implement low stock alerts when variant stock < threshold
    - _Requirements: 12.2, 12.9_


  - [~] 7.3 Implement product media management
    - Add uploadMedia, deleteMedia methods to products service
    - Support multiple images per product with position ordering
    - Integrate with Cloudflare R2 for image storage
    - Generate optimized thumbnails and responsive sizes
    - _Requirements: 12.3, 5.5_

  - [~] 7.4 Implement stock movements tracking
    - Create stockMovements table to log all stock changes
    - Record reason (sale, adjustment, return, damage) and author
    - Update variant stock atomically with movement creation
    - Generate stock movement reports
    - _Requirements: 12.7, 12.8_

  - [~] 7.5 Implement orders service
    - Create `lib/domains/orders/orders.service.ts` with CRUD operations
    - Implement order status workflow transitions: pending → paid → prepared → shipped → delivered
    - Add order cancellation with automatic stock restoration
    - Implement order search by number, email, customer name
    - _Requirements: 13.1, 13.2, 13.6, 13.12_

  - [~] 7.6 Implement order fulfillment tracking
    - Add updateStatus method with automatic email notifications
    - Track fulfilledAt, shippedAt, deliveredAt timestamps
    - Support tracking number assignment
    - Calculate and display fulfillment time metrics
    - _Requirements: 13.3, 13.11_

  - [~] 7.7 Implement parchment production tracking
    - Add productionStatus field to orderItems (to_produce → in_production → quality_check → ready → shipped)
    - Create production status update methods
    - Display production status in admin order details
    - _Requirements: 3.6, 13.8_

  - [~] 7.8 Implement order notes and internal comments
    - Add addNote method to orders service for internal notes
    - Store author and timestamp with each note
    - Display notes in admin order detail view
    - _Requirements: 13.5_

  - [~] 7.9 Implement partial refunds via Stripe
    - Add refund method to orders service
    - Integrate with Stripe API for partial refund processing
    - Update order status and total after refund
    - Send refund confirmation email to customer
    - _Requirements: 13.7_


- [~] 8. Checkpoint - Verify Email and Orders Systems
  - Test email sending, tracking, and unsubscribe flows
  - Verify order status transitions and stock restoration on cancellation
  - Test campaign execution with segment targeting
  - Ask the user if questions arise

- [ ] 9. Dashboard Analytics Implementation
  - [~] 9.1 Implement dashboard service
    - Create `lib/domains/analytics/dashboard.service.ts` with analytics methods
    - Implement getOverview to calculate key metrics with period comparison
    - Add date range filtering support for all metrics
    - _Requirements: 14.1, 14.10_

  - [~] 9.2 Implement revenue metrics
    - Add getRevenueMetrics method to calculate total revenue, growth percentage
    - Calculate revenue by product category
    - Calculate average cart value and trend
    - _Requirements: 14.1, 14.4, 14.7_

  - [~] 9.3 Implement orders metrics
    - Add getOrdersMetrics method with order count by status
    - Calculate order fulfillment time averages
    - Track order volume trends over time
    - _Requirements: 14.2, 13.11_

  - [~] 9.4 Implement contacts and conversion metrics
    - Add getContactsMetrics method with new contact count and growth trend
    - Calculate customer acquisition metrics (new vs returning)
    - Calculate conversion funnel (visits → cart → checkout → purchase)
    - _Requirements: 14.3, 14.8, 14.9_

  - [~] 9.5 Implement campaign performance metrics
    - Add getCampaignsMetrics method with aggregated campaign stats
    - Calculate average open rate and click rate across all campaigns
    - Track campaign performance trends over time
    - _Requirements: 14.5_

  - [~] 9.6 Implement top products analysis
    - Add getTopProducts method with units sold and revenue per product
    - Support filtering by date range
    - Order results by revenue or units sold
    - _Requirements: 14.6_

  - [~] 9.7 Implement geographic distribution analysis
    - Add getGeographicDistribution method to aggregate customers by country
    - Calculate revenue per country
    - Return data formatted for map visualization
    - _Requirements: 14.12_


  - [~] 9.8 Implement activity feed
    - Add getRecentActivity method to fetch recent orders and new contacts
    - Format activity items with timestamp, type, and summary
    - Support real-time updates via polling or websockets
    - _Requirements: 14.11_

- [ ] 10. Security and RBAC Implementation
  - [~] 10.1 Implement session management
    - Create `lib/auth/session.ts` with session CRUD operations
    - Generate secure random tokens for session IDs
    - Store sessions in database with httpOnly, Secure, SameSite cookies
    - Implement automatic session expiration after inactivity
    - _Requirements: 16.5, 16.12_

  - [~] 10.2 Implement password hashing and validation
    - Create `lib/auth/password.ts` with bcrypt hashing (10+ rounds)
    - Implement hashPassword and verifyPassword methods
    - Add password strength validation with minimum requirements
    - _Requirements: 16.1, 16.11_

  - [~] 10.3 Implement RBAC system
    - Create `lib/auth/rbac.ts` with role and permission definitions
    - Define 7 roles: super_admin, admin, shop, crm, content, marketing, support
    - Define permissions matrix for each resource and action
    - Implement hasPermission check method
    - _Requirements: 8.1, 8.9_

  - [~] 10.4 Implement RBAC middleware
    - Create middleware to verify user permissions before allowing access
    - Add requirePermission decorator for API routes
    - Redirect to unauthorized page when permission denied
    - _Requirements: 8.2_

  - [~] 10.5 Implement audit trail logging
    - Create `lib/audit/logger.ts` to log all administrative actions
    - Record user, timestamp, entity type, entity ID, action, and changes (before/after)
    - Store audit logs in database
    - _Requirements: 8.4_

  - [~] 10.6 Implement audit log viewing
    - Add getAuditLogs method to fetch logs with filtering
    - Support filtering by user, entity type, action, date range
    - Display audit logs in admin settings page
    - _Requirements: 8.5_


  - [~] 10.7 Implement rate limiting
    - Create `lib/utils/rate-limit.ts` with rate limiting logic
    - Store rate limit counters in database with sliding window
    - Apply rate limiting to authentication endpoints (login, password reset)
    - Return 429 Too Many Requests when limit exceeded
    - _Requirements: 16.4_

  - [~] 10.8 Implement input validation and sanitization
    - Create `lib/utils/sanitize.ts` with HTML sanitization using DOMPurify
    - Add SQL injection protection via parameterized queries (Drizzle ORM)
    - Validate all API inputs using Zod schemas
    - _Requirements: 16.3, 16.6_

  - [~] 10.9 Implement CSRF protection
    - Create `lib/security/csrf.ts` with token generation and validation
    - Add CSRF token to all state-changing forms
    - Verify CSRF token on POST/PUT/DELETE requests
    - _Requirements: 16.2_

  - [~] 10.10 Implement Content Security Policy
    - Add CSP headers to Next.js configuration
    - Define allowed sources for scripts, styles, images, fonts
    - Test CSP with browser console for violations
    - _Requirements: 16.8_

  - [~] 10.11 Implement honeypot spam prevention
    - Add invisible honeypot fields to public forms (contact, newsletter)
    - Reject form submissions with filled honeypot fields
    - Log potential spam attempts
    - _Requirements: 16.10_

- [ ] 11. API Routes Implementation
  - [~] 11.1 Implement admin contacts API routes
    - Create `app/api/admin/contacts/route.ts` for GET (list) and POST (create)
    - Create `app/api/admin/contacts/[id]/route.ts` for GET, PATCH, DELETE
    - Create `app/api/admin/contacts/[id]/tags/route.ts` for POST, DELETE
    - Create `app/api/admin/contacts/[id]/notes/route.ts` for POST
    - _Requirements: 7.1, 7.4, 7.5_

  - [~] 11.2 Implement contacts import/export API routes
    - Create `app/api/admin/contacts/import/route.ts` for CSV import (POST)
    - Create `app/api/admin/contacts/export/route.ts` for CSV export (GET)
    - Create `app/api/admin/contacts/merge/route.ts` for merging contacts (POST)
    - Create `app/api/admin/contacts/search/route.ts` for search (GET)
    - _Requirements: 3.3, 3.4, 3.8, 7.6_


  - [~] 11.3 Implement segments API routes
    - Create `app/api/admin/segments/route.ts` for GET (list) and POST (create)
    - Create `app/api/admin/segments/[id]/route.ts` for GET, PATCH, DELETE
    - Create `app/api/admin/segments/[id]/members/route.ts` for GET (list members)
    - Create `app/api/admin/segments/evaluate/route.ts` for POST (preview segment filters)
    - _Requirements: 11.1, 11.5, 11.9_

  - [~] 11.4 Implement campaigns API routes
    - Create `app/api/admin/campaigns/route.ts` for GET (list) and POST (create)
    - Create `app/api/admin/campaigns/[id]/route.ts` for GET, PATCH, DELETE
    - Create `app/api/admin/campaigns/[id]/send/route.ts` for POST (send now)
    - Create `app/api/admin/campaigns/[id]/schedule/route.ts` for POST (schedule)
    - Create `app/api/admin/campaigns/[id]/test/route.ts` for POST (send test)
    - Create `app/api/admin/campaigns/[id]/duplicate/route.ts` for POST (duplicate)
    - Create `app/api/admin/campaigns/[id]/stats/route.ts` for GET (get stats)
    - _Requirements: 9.5, 9.6, 9.8, 9.10, 9.14_

  - [~] 11.5 Implement templates API routes
    - Create `app/api/admin/templates/route.ts` for GET (list) and POST (create)
    - Create `app/api/admin/templates/[id]/route.ts` for GET, PATCH, DELETE
    - Create `app/api/admin/templates/[id]/preview/route.ts` for POST (preview with data)
    - Create `app/api/admin/templates/[id]/validate/route.ts` for POST (validate HTML)
    - _Requirements: 10.1, 10.5, 10.6_

  - [~] 11.6 Implement orders API routes
    - Create `app/api/admin/orders/route.ts` for GET (list with filters)
    - Create `app/api/admin/orders/[id]/route.ts` for GET and PATCH (update status)
    - Create `app/api/admin/orders/[id]/cancel/route.ts` for POST (cancel order)
    - Create `app/api/admin/orders/[id]/refund/route.ts` for POST (process refund)
    - Create `app/api/admin/orders/[id]/notes/route.ts` for POST (add note)
    - Create `app/api/admin/orders/export/route.ts` for GET (export to CSV)
    - _Requirements: 13.1, 13.2, 13.5, 13.6, 13.7_

  - [~] 11.7 Implement products API routes
    - Create `app/api/admin/products/route.ts` for GET (list) and POST (create)
    - Create `app/api/admin/products/[id]/route.ts` for GET, PATCH, DELETE
    - Create `app/api/admin/products/[id]/variants/route.ts` for POST (add variant)
    - Create `app/api/admin/products/[id]/variants/[variantId]/route.ts` for PATCH, DELETE
    - Create `app/api/admin/products/[id]/media/route.ts` for POST (upload image)
    - Create `app/api/admin/products/[id]/media/[mediaId]/route.ts` for DELETE
    - _Requirements: 12.1, 12.2, 12.3_


  - [~] 11.8 Implement dashboard API routes
    - Create `app/api/admin/dashboard/overview/route.ts` for GET (dashboard overview)
    - Create `app/api/admin/dashboard/revenue/route.ts` for GET (revenue metrics)
    - Create `app/api/admin/dashboard/top-products/route.ts` for GET (top selling products)
    - Create `app/api/admin/dashboard/activity/route.ts` for GET (recent activity feed)
    - _Requirements: 14.1, 14.6, 14.11_

  - [~] 11.9 Implement settings and audit API routes
    - Create `app/api/admin/settings/route.ts` for GET (get settings) and PATCH (update)
    - Create `app/api/admin/settings/roles/route.ts` for GET (get roles and permissions)
    - Create `app/api/admin/audit/route.ts` for GET (get audit logs with filters)
    - _Requirements: 8.3, 8.5, 8.6_

  - [~] 11.10 Implement webhook routes
    - Update `app/api/webhook/stripe/route.ts` to handle Stripe events
    - Create `app/api/webhook/resend/route.ts` to handle Resend events (already implemented in 6.7)
    - Add webhook signature verification for security
    - _Requirements: 9.7_

- [~] 12. Checkpoint - Verify API Routes
  - Test all admin API routes with authentication and RBAC
  - Verify input validation and error handling
  - Test webhook handlers with mock payloads
  - Ask the user if questions arise

- [ ] 13. Admin UI Components Implementation
  - [~] 13.1 Implement admin dashboard page
    - Create `app/admin/(dash)/page.tsx` with dashboard layout
    - Display metric cards for revenue, orders, contacts, avg cart value
    - Add charts for revenue trends and order status breakdown
    - Display recent activity feed
    - Integrate with dashboard API routes
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.11_

  - [~] 13.2 Implement dashboard metric cards component
    - Create `components/admin/dashboard/metric-card.tsx` reusable component
    - Display metric value, label, and change percentage
    - Add trend indicator (up/down arrow with color)
    - Support loading state
    - _Requirements: 14.1_


  - [~] 13.3 Implement CRM contacts list page
    - Update `app/admin/(dash)/crm/page.tsx` with DataTable component
    - Add filters by status, tags, country
    - Add search functionality
    - Add bulk actions (tag assignment, export)
    - Display contact count and segments overview
    - _Requirements: 7.1, 7.6, 7.11_

  - [~] 13.4 Implement CRM contact detail page
    - Update `app/admin/(dash)/crm/[id]/page.tsx` with contact details
    - Display contact info, tags, notes, and activity timeline
    - Add forms to edit contact info, add tags, add notes
    - Display orders history for the contact
    - Show calculated metrics (lifetime value, last order date)
    - _Requirements: 7.4, 7.5, 7.7, 7.8_

  - [~] 13.5 Implement segments management page
    - Create `app/admin/(dash)/crm/segments/page.tsx` for segments list
    - Create `app/admin/(dash)/crm/segments/[id]/page.tsx` for segment editor
    - Build segment filter builder UI with add/remove filters
    - Display real-time member count preview
    - Show segment analytics (avg order value, conversion rate)
    - _Requirements: 11.1, 11.5, 11.7_

  - [~] 13.6 Implement campaigns list page
    - Update `app/admin/(dash)/campagnes/page.tsx` with campaigns DataTable
    - Display campaign name, status, scheduled date, sent date
    - Show campaign stats (sent, open rate, click rate)
    - Add actions: send, schedule, duplicate, view stats
    - _Requirements: 9.5, 9.8, 9.14_

  - [~] 13.7 Implement campaign editor page
    - Create `app/admin/(dash)/campagnes/[id]/page.tsx` for campaign editing
    - Add form fields for name, subject, template, segment
    - Implement template preview with sample data
    - Add send test functionality with email input
    - Add schedule picker for future sending
    - _Requirements: 9.5, 9.6, 9.10_

  - [~] 13.8 Implement email templates list page
    - Create `app/admin/(dash)/templates/page.tsx` for templates list
    - Display templates grouped by category and locale
    - Add actions: create, edit, duplicate, delete, preview
    - _Requirements: 10.1, 10.3_


  - [~] 13.9 Implement template editor page
    - Create `app/admin/(dash)/templates/[id]/page.tsx` for template editing
    - Add WYSIWYG editor or Monaco editor for HTML editing
    - Display extracted variables list
    - Add preview pane with sample data injection
    - Implement template validation before save
    - _Requirements: 10.1, 10.5, 10.6, 10.12_

  - [~] 13.10 Implement orders list page
    - Update `app/admin/(dash)/commandes/page.tsx` with orders DataTable
    - Add filters by status, date range, customer
    - Display order number, customer, total, status, date
    - Add actions: view details, update status, cancel, refund
    - _Requirements: 13.1, 13.2_

  - [~] 13.11 Implement order detail page
    - Create `app/admin/(dash)/commandes/[id]/page.tsx` for order details
    - Display customer info, items, pricing, shipping address
    - Add status update workflow UI
    - Display and edit tracking number
    - Show internal notes and add note form
    - Display parchment production status for custom items
    - _Requirements: 13.4, 13.5, 13.8_

  - [~] 13.12 Implement products list page
    - Update `app/admin/(dash)/produits/page.tsx` with products DataTable
    - Display product name, category, status, featured flag, base price
    - Add filters by category, status
    - Add actions: create, edit, duplicate, archive
    - _Requirements: 12.1, 12.5_

  - [~] 13.13 Implement product editor page
    - Create `app/admin/(dash)/produits/[id]/page.tsx` for product editing
    - Add multilingual tabs for name, short_desc, long_desc in fr/en/es/he
    - Implement variant management UI (add, edit, delete variants)
    - Add image upload and ordering UI
    - Display stock levels and low stock alerts
    - _Requirements: 12.2, 12.3, 12.4, 12.9_

  - [~] 13.14 Implement stock management page
    - Update `app/admin/(dash)/stock/page.tsx` with stock overview
    - Display all variants with current stock levels
    - Highlight low stock items
    - Add stock adjustment form with reason
    - Display stock movements history
    - _Requirements: 12.7, 12.8_


  - [~] 13.15 Implement settings page
    - Update `app/admin/(dash)/parametres/page.tsx` with settings interface
    - Add tabs for: General, API Keys, Roles & Permissions, Audit Log
    - Display and edit site settings (locale, currency, email from)
    - Add API keys management UI (Stripe, Resend, R2)
    - Display roles and permissions matrix
    - Show audit log with filtering
    - _Requirements: 8.3, 8.5, 8.6, 8.7_

- [ ] 14. Shared UI Components Implementation
  - [~] 14.1 Implement generic DataTable component
    - Create `components/shared/data-table.tsx` with TanStack Table
    - Support column definitions, sorting, filtering, pagination
    - Add row selection and bulk actions support
    - Implement search functionality
    - _Requirements: 3.1_

  - [~] 14.2 Implement FormField component with validation
    - Create `components/shared/form-field.tsx` with react-hook-form integration
    - Display label, input, error message
    - Support multilingual labels and error messages via next-intl
    - Add accessibility attributes (aria-label, aria-describedby)
    - _Requirements: 15.3, 15.7_

  - [~] 14.3 Implement loading and skeleton components
    - Create `components/ui/skeleton.tsx` for loading placeholders
    - Create loading spinners for buttons and pages
    - Implement skeleton layouts for DataTable, cards, forms
    - _Requirements: 6.8_

  - [~] 14.4 Implement toast notifications system
    - Integrate Sonner for toast notifications
    - Create toast utility functions: success, error, warning, info
    - Display toasts on API success/error responses
    - _Requirements: 6.9_

  - [~] 14.5 Implement animation components
    - Create `components/shared/fade-in.tsx` with Framer Motion
    - Add slide, scale, and fade animation variants
    - Apply animations to page transitions and cards
    - _Requirements: 6.3_

  - [~] 14.6 Implement locale switcher component
    - Create `components/shared/locale-switcher.tsx` for language selection
    - Display flags or language names for fr/en/es/he
    - Persist locale selection in cookie
    - Reload page with new locale on change
    - _Requirements: 4.1, 4.4_


- [ ] 15. Multilingual and RTL Implementation
  - [~] 15.1 Configure next-intl for four locales
    - Update `i18n.ts` configuration with fr, en, es, he locales
    - Set default locale to fr
    - Configure locale detection and routing
    - _Requirements: 4.1_

  - [~] 15.2 Verify translation completeness for all locales
    - Audit `messages/fr.json`, `messages/en.json`, `messages/es.json`, `messages/he.json`
    - Identify missing keys in each locale
    - Add fallback warnings when translation missing
    - _Requirements: 4.1, 4.2_

  - [~] 15.3 Implement translation verification tool
    - Create script `scripts/verify-translations.ts` to compare translation files
    - Report missing keys per locale
    - Report outdated translations (keys present but potentially stale)
    - _Requirements: 4.5_

  - [~] 15.4 Add RTL support in Tailwind configuration
    - Update `tailwind.config.ts` with RTL plugin
    - Use logical properties (start/end instead of left/right)
    - Test layouts in RTL mode (Hebrew locale)
    - _Requirements: 4.4_

  - [~] 15.5 Implement directional icon component
    - Create `components/ui/directional-icon.tsx` to flip icons in RTL
    - Auto-detect locale and apply RTL transformations
    - Test with arrows, chevrons, and directional icons
    - _Requirements: 4.4_

  - [~] 15.6 Implement multilingual database content
    - Add locale-specific columns to products, blog posts, page content tables
    - Create translation management UI in admin panel
    - Implement content fetching based on current locale
    - _Requirements: 4.6, 4.7_

  - [~] 15.7 Implement pluralization rules
    - Configure next-intl with ICU message format for pluralization
    - Add plural forms for each locale (singular, plural, etc.)
    - Test with dynamic counts (e.g., "1 item" vs "2 items")
    - _Requirements: 4.8_

- [ ] 16. Design System Implementation
  - [~] 16.1 Configure Tailwind theme with Jubilé brand colors
    - Update `tailwind.config.ts` with color palette: gold, wine (red/white), parchment tones
    - Define typography scale with serif for headings, sans-serif for body
    - Set consistent spacing, border radius, and shadow utilities
    - _Requirements: 6.1, 6.2, 6.4_


  - [~] 16.2 Extend shadcn/ui Button component with variants
    - Update `components/ui/button.tsx` with premium, outline, ghost, link variants
    - Add loading state with spinner
    - Ensure accessibility with focus-visible styles
    - _Requirements: 6.7_

  - [~] 16.3 Implement consistent card-based layouts
    - Use shadcn/ui Card component throughout admin panel
    - Apply consistent padding, shadows, and borders
    - Ensure visual hierarchy with headers, content, footers
    - _Requirements: 6.6_

  - [~] 16.4 Implement responsive layouts
    - Test and optimize all pages for mobile, tablet, desktop breakpoints
    - Use Tailwind responsive utilities (sm:, md:, lg:, xl:)
    - Ensure mobile navigation is accessible
    - _Requirements: 6.5_

  - [~] 16.5 Implement accessible focus states
    - Add focus-visible styles to all interactive elements
    - Ensure keyboard navigation works for forms, buttons, links
    - Test with keyboard-only navigation
    - _Requirements: 6.7, 15.2, 15.6_

  - [~] 16.6 Implement color contrast compliance
    - Audit all text/background combinations for WCAG AA (4.5:1 ratio)
    - Fix any failing combinations
    - Test with contrast checker tools
    - _Requirements: 15.4_

  - [~] 16.7 Implement skip navigation links
    - Add "Skip to main content" link at top of page
    - Hide visually but accessible to screen readers
    - Ensure link receives focus when tabbed
    - _Requirements: 15.5_

- [~] 17. Checkpoint - Verify UI and Multilingual
  - Test all admin pages for responsive design and accessibility
  - Verify RTL layout for Hebrew locale
  - Test translations completeness across all locales
  - Ask the user if questions arise

- [ ] 18. Performance Optimization
  - [~] 18.1 Implement Next.js Image optimization
    - Replace all `<img>` tags with Next.js `<Image>` component
    - Configure image sizes and formats (webp, avif)
    - Add lazy loading for below-the-fold images
    - _Requirements: 2.2_


  - [~] 18.2 Implement code splitting for admin routes
    - Use dynamic imports with `next/dynamic` for heavy components
    - Split admin panel routes into separate chunks
    - Add loading fallbacks for dynamic components
    - _Requirements: 2.3_

  - [~] 18.3 Optimize bundle size
    - Run `npm run build` and analyze bundle with `@next/bundle-analyzer`
    - Remove unused dependencies from package.json
    - Replace heavy libraries with lighter alternatives where possible
    - _Requirements: 2.4_

  - [~] 18.4 Implement caching strategy
    - Use `unstable_cache` from Next.js for expensive operations (translations, product catalog)
    - Configure cache revalidation periods
    - Implement cache invalidation on data updates
    - _Requirements: 2.6_

  - [~] 18.5 Optimize database queries
    - Review all repository methods for N+1 query problems
    - Add eager loading with joins where needed
    - Use select specific columns instead of `select()`
    - _Requirements: 2.5, 2.8_

  - [~] 18.6 Measure Core Web Vitals
    - Run Lighthouse audits on public pages
    - Measure LCP, FID, CLS scores
    - Optimize to achieve scores above 90
    - _Requirements: 2.1_

  - [~] 18.7 Optimize API response times
    - Profile slow API routes with logging
    - Optimize database queries causing slowness
    - Implement pagination for list endpoints
    - Ensure 95th percentile response time < 200ms
    - _Requirements: 2.7_

- [ ] 19. Public Site Enhancement
  - [~] 19.1 Implement visual content for products
    - Add at least 3 high-quality images per product
    - Optimize images with Next.js Image component
    - Add multilingual alt text for accessibility
    - _Requirements: 5.1, 5.4_

  - [~] 19.2 Implement hero images for public pages
    - Create hero sections with responsive images
    - Optimize for different viewport sizes
    - Add overlay text with proper contrast
    - _Requirements: 5.2_


  - [~] 19.3 Implement image galleries for mission projects
    - Create gallery component with lightbox functionality
    - Display multiple images per mission project
    - Support image captions in multiple locales
    - _Requirements: 5.3_

  - [~] 19.4 Implement media asset management
    - Upload images to Cloudflare R2 storage
    - Generate thumbnails and responsive sizes
    - Store metadata (alt text in all locales, tags, categories)
    - _Requirements: 5.5, 5.6_

  - [~] 19.5 Implement favicon and social share images
    - Create favicon in multiple sizes
    - Create og:image and twitter:image for social sharing
    - Configure meta tags in Next.js layout
    - _Requirements: 5.8_

  - [~] 19.6 Implement product search and filtering
    - Add search bar in product catalog
    - Implement filtering by category, price range
    - Display filtered results with client-side interactivity
    - _Requirements: 3.9_

  - [~] 19.7 Implement customer order tracking
    - Create order tracking page accessible via unique token
    - Display order status, estimated delivery, tracking number
    - Allow customers to view order history in account page
    - _Requirements: 3.10_

  - [~] 19.8 Implement premium footer
    - Design footer with newsletter signup form
    - Add verse citation (thematic to Jubilee mission)
    - Include site links, social media, contact info
    - _Requirements: 6.10_

- [ ] 20. Testing Implementation
  - [~] 20.1 Set up Vitest testing framework
    - Install Vitest and @testing-library packages
    - Configure `vitest.config.ts` with TypeScript and path aliases
    - Create test utilities in `test-utils/` directory
    - _Requirements: 17.1_

  - [~] 20.2 Write unit tests for services
    - Test contacts service methods (create, update, merge, calculateLifetimeValue)
    - Test orders service methods (create, updateStatus, cancel, refund)
    - Test campaigns service methods (send, schedule, getStats)
    - Achieve minimum 80% coverage for all services
    - _Requirements: 17.1_


  - [~] 20.3 Write integration tests for API routes
    - Test admin API routes with in-memory SQLite database
    - Test authentication and RBAC middleware
    - Test input validation and error responses
    - _Requirements: 17.2_

  - [~] 20.4 Write component tests for critical UI
    - Test DataTable component with sorting, filtering, pagination
    - Test FormField component with validation errors
    - Test ContactsTable with bulk actions
    - _Requirements: 17.3_

  - [~] 20.5 Write E2E tests for main user flows
    - Test admin login and session management
    - Test order creation and checkout flow
    - Test CRM contact creation and editing
    - Test campaign creation and sending
    - _Requirements: 17.4_

  - [~] 20.6 Write validation tests for Zod schemas
    - Test all Zod schemas with valid and invalid inputs
    - Test edge cases (empty strings, max lengths, regex patterns)
    - Test error message clarity
    - _Requirements: 17.5_

  - [~] 20.7 Write email template rendering tests
    - Test template rendering with various data scenarios
    - Test variable substitution accuracy
    - Test fallback behavior for missing variables
    - _Requirements: 17.6_

  - [~] 20.8 Write authentication and authorization tests
    - Test password hashing and verification
    - Test session creation and expiration
    - Test RBAC permission checks for all roles
    - _Requirements: 17.7_

  - [~] 20.9 Write multilingual tests
    - Test translation loading for all four locales
    - Test fallback behavior for missing translations
    - Test RTL layout rendering for Hebrew
    - _Requirements: 17.8, 17.9_

  - [~] 20.10 Write performance tests for database queries
    - Benchmark slow queries with large datasets
    - Test query optimization with indexes
    - Ensure queries complete within acceptable time limits
    - _Requirements: 17.10_

- [ ] 21. Documentation Implementation
  - [~] 21.1 Write README with setup instructions
    - Document prerequisites (Node.js, npm, Cloudflare account)
    - Provide step-by-step local development setup
    - Document architecture overview and folder structure
    - _Requirements: 18.1_


  - [~] 21.2 Document environment variables
    - List all required environment variables with descriptions
    - Provide example values in `.env.example` file
    - Document where to obtain API keys (Stripe, Resend, R2)
    - _Requirements: 18.2_

  - [~] 21.3 Write API documentation
    - Document all API routes with request/response examples
    - Include authentication requirements per route
    - Provide cURL examples for testing
    - _Requirements: 18.3_

  - [~] 21.4 Document database schema
    - Create entity relationship diagram (ERD)
    - Document all tables, columns, relationships, indexes
    - Explain data types and constraints
    - _Requirements: 18.4_

  - [~] 21.5 Write admin panel user guide
    - Document each admin feature with screenshots
    - Provide step-by-step guides for common tasks (create campaign, import contacts, etc.)
    - Include FAQ section
    - _Requirements: 18.5_

  - [~] 21.6 Document deployment process
    - Write deployment guide for Cloudflare Pages
    - Document D1 database setup and migrations
    - Document R2 storage configuration
    - Document environment variable setup in Cloudflare dashboard
    - _Requirements: 18.6_

  - [~] 21.7 Document email template syntax
    - List all available template variables
    - Provide examples of template usage
    - Document conditional content syntax if supported
    - _Requirements: 18.7_

  - [~] 21.8 Write troubleshooting guide
    - Document common issues and solutions
    - Provide debugging tips for local development
    - Include error code reference
    - _Requirements: 18.8_

  - [~] 21.9 Document RBAC permissions matrix
    - Create table showing roles and their permissions
    - Document permission naming conventions
    - Explain permission inheritance if applicable
    - _Requirements: 18.9_

  - [~] 21.10 Maintain changelog
    - Document all changes since last release
    - Group changes by category (features, fixes, breaking changes)
    - Follow semantic versioning
    - _Requirements: 18.10_


- [ ] 22. Backup and Recovery Implementation
  - [~] 22.1 Implement automated database backups
    - Create `scripts/backup-db.ts` to export D1 database
    - Schedule daily backups using cron or Cloudflare Workers Cron Triggers
    - Store backups in separate R2 bucket
    - _Requirements: 19.1, 19.3_

  - [~] 22.2 Implement backup retention policy
    - Keep daily backups for 30 days
    - Implement automatic cleanup of old backups
    - Log backup operations with success/failure status
    - _Requirements: 19.2, 19.7_

  - [~] 22.3 Implement backup restore functionality
    - Create restore script to import D1 database from backup
    - Add admin UI button for one-click restore
    - Test restore process in development environment
    - _Requirements: 19.4, 19.5_

  - [~] 22.4 Implement media assets backup
    - Create script to backup R2 storage bucket
    - Schedule periodic media backups
    - Store media backups in separate location
    - _Requirements: 19.6_

  - [~] 22.5 Implement backup monitoring
    - Display last backup date and status in admin dashboard
    - Send alert emails when backup fails
    - Implement point-in-time recovery capability
    - _Requirements: 19.8, 19.9, 19.10_

- [ ] 23. Migration and Data Import
  - [~] 23.1 Implement CSV import for contacts with preview
    - Create import preview UI showing success/error counts before insertion
    - Implement field mapping interface for CSV columns
    - Validate all data before import
    - _Requirements: 20.1, 20.2, 20.4_

  - [~] 23.2 Implement duplicate detection during import
    - Detect duplicates by email during CSV import
    - Offer options: skip, merge, or overwrite duplicates
    - Log duplicate handling decisions
    - _Requirements: 20.3_

  - [~] 23.3 Implement import rollback capability
    - Track imported records in batch
    - Provide rollback functionality to undo failed imports
    - Display import report with statistics and error details
    - _Requirements: 20.5, 20.10_


  - [~] 23.4 Import blog posts from Wix site
    - Export blog posts from existing Wix site
    - Create import script to parse Wix export format
    - Preserve content, images, metadata (title, description, date)
    - Store blog posts in database with multilingual content
    - _Requirements: 20.6, 20.8_

  - [~] 23.5 Implement URL redirects for SEO
    - Map old Wix URLs to new Next.js routes
    - Implement 301 redirects in Next.js middleware
    - Test all redirects to ensure no broken links
    - _Requirements: 20.7_

  - [~] 23.6 Import and optimize images from old site
    - Download all images from Wix site
    - Optimize images (compress, convert to webp)
    - Upload optimized images to R2 storage
    - Update image references in blog posts and content
    - _Requirements: 20.9_

- [ ] 24. Final Testing and Quality Assurance
  - [~] 24.1 Run full test suite
    - Execute all unit tests, integration tests, component tests
    - Execute E2E tests for critical flows
    - Ensure all tests pass with minimum 80% coverage
    - _Requirements: 17.1, 17.2, 17.3, 17.4_

  - [~] 24.2 Perform manual QA testing
    - Test all admin features with different user roles
    - Test public site on multiple browsers (Chrome, Firefox, Safari, Edge)
    - Test responsive design on mobile, tablet, desktop
    - Test RTL layout in Hebrew locale
    - _Requirements: 15.4, 16.4_

  - [~] 24.3 Perform accessibility audit
    - Run automated accessibility tests with Lighthouse
    - Test keyboard navigation throughout the site
    - Test with screen reader (NVDA or JAWS)
    - Fix any WCAG AA violations
    - _Requirements: 15.1, 15.2, 15.6_

  - [~] 24.4 Perform security audit
    - Test authentication flows for vulnerabilities
    - Test RBAC permissions enforcement
    - Test input validation on all forms
    - Test CSRF protection on state-changing operations
    - _Requirements: 16.1, 16.2, 16.3, 16.4_

  - [~] 24.5 Perform performance testing
    - Run Lighthouse on all public pages (target >90 score)
    - Benchmark API response times under load
    - Test database query performance with large datasets
    - _Requirements: 2.1, 2.7, 2.8_


- [ ] 25. Deployment Preparation
  - [~] 25.1 Configure production environment variables
    - Set up all environment variables in Cloudflare Pages dashboard
    - Configure Stripe production keys
    - Configure Resend production API key
    - Configure R2 storage credentials
    - _Requirements: 18.2_

  - [~] 25.2 Set up Cloudflare D1 database
    - Create production D1 database instance
    - Run all migrations on production database
    - Verify schema integrity
    - _Requirements: 19.1_

  - [~] 25.3 Set up Cloudflare R2 storage
    - Create R2 buckets for media and backups
    - Configure bucket permissions
    - Test file uploads to R2 from local environment
    - _Requirements: 5.5, 19.6_

  - [~] 25.4 Configure Cloudflare Pages build settings
    - Set build command: `npm run build`
    - Set output directory: `.next`
    - Configure Node.js version
    - Enable edge runtime if needed
    - _Requirements: 18.6_

  - [~] 25.5 Set up monitoring and logging
    - Configure error logging with external service (Sentry or similar)
    - Set up uptime monitoring
    - Configure alerting for critical errors
    - _Requirements: 16.7_

  - [~] 25.6 Perform production deployment
    - Deploy to Cloudflare Pages
    - Verify deployment success
    - Test production site thoroughly
    - Monitor for errors in first 24 hours
    - _Requirements: 18.6_

- [~] 26. Final Checkpoint
  - Verify all features are implemented and working in production
  - Confirm all tests pass
  - Verify documentation is complete
  - Ensure backup and monitoring systems are operational
  - Ask the user if questions arise

## Notes

- **Implementation Order**: Tasks are ordered by dependency. Foundation tasks (architecture, database) must be completed before higher-level features (UI, campaigns).
- **Incremental Testing**: Each phase includes a checkpoint to verify implementation before proceeding. This ensures quality and prevents cascading errors.
- **Requirements Traceability**: Every task references the specific requirements it implements, ensuring complete coverage.
- **TypeScript First**: All code uses TypeScript with strict typing. Zod schemas provide runtime validation.
- **Accessibility Built-In**: WCAG AA compliance is integrated throughout UI implementation, not added as an afterthought.
- **Multilingual Core**: All user-facing content supports fr/en/es/he from the start, with RTL support for Hebrew.
- **Security by Design**: Authentication, RBAC, input validation, and audit logging are implemented early and used consistently.
- **Performance Optimized**: Image optimization, code splitting, caching, and database indexes are built in, not retrofitted.


## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1.1", "1.2", "1.3", "1.5"]
    },
    {
      "id": 1,
      "tasks": ["1.4", "2.1", "2.2"]
    },
    {
      "id": 2,
      "tasks": ["2.3", "2.4"]
    },
    {
      "id": 3,
      "tasks": ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6"]
    },
    {
      "id": 4,
      "tasks": ["4.1", "4.3", "4.5", "4.8"]
    },
    {
      "id": 5,
      "tasks": ["4.2", "4.4", "4.6", "4.7", "4.9"]
    },
    {
      "id": 6,
      "tasks": ["6.1"]
    },
    {
      "id": 7,
      "tasks": ["6.2", "6.3"]
    },
    {
      "id": 8,
      "tasks": ["6.4", "6.5"]
    },
    {
      "id": 9,
      "tasks": ["6.6", "6.7", "6.9", "6.11"]
    },
    {
      "id": 10,
      "tasks": ["6.8", "6.10"]
    },
    {
      "id": 11,
      "tasks": ["7.1", "7.5"]
    },
    {
      "id": 12,
      "tasks": ["7.2", "7.3", "7.6", "7.8"]
    },
    {
      "id": 13,
      "tasks": ["7.4", "7.7", "7.9"]
    },
    {
      "id": 14,
      "tasks": ["9.1"]
    },
    {
      "id": 15,
      "tasks": ["9.2", "9.3", "9.4", "9.5", "9.6", "9.7", "9.8"]
    },
    {
      "id": 16,
      "tasks": ["10.1", "10.2", "10.3", "10.7", "10.8", "10.9", "10.10", "10.11"]
    },
    {
      "id": 17,
      "tasks": ["10.4", "10.5"]
    },
    {
      "id": 18,
      "tasks": ["10.6"]
    },
    {
      "id": 19,
      "tasks": ["11.1", "11.3", "11.4", "11.5", "11.6", "11.7", "11.8", "11.9", "11.10"]
    },
    {
      "id": 20,
      "tasks": ["11.2"]
    },
    {
      "id": 21,
      "tasks": ["13.1", "13.3", "13.6", "13.8", "13.10", "13.12", "13.14", "13.15"]
    },
    {
      "id": 22,
      "tasks": ["13.2", "13.4", "13.5", "13.7", "13.9", "13.11", "13.13"]
    },
    {
      "id": 23,
      "tasks": ["14.1", "14.2", "14.3", "14.4", "14.5", "14.6"]
    },
    {
      "id": 24,
      "tasks": ["15.1", "15.3", "15.7"]
    },
    {
      "id": 25,
      "tasks": ["15.2", "15.4", "15.6"]
    },
    {
      "id": 26,
      "tasks": ["15.5"]
    },
    {
      "id": 27,
      "tasks": ["16.1"]
    },
    {
      "id": 28,
      "tasks": ["16.2", "16.3", "16.4", "16.5", "16.6", "16.7"]
    },
    {
      "id": 29,
      "tasks": ["18.1", "18.3", "18.5"]
    },
    {
      "id": 30,
      "tasks": ["18.2", "18.4", "18.6", "18.7"]
    },
    {
      "id": 31,
      "tasks": ["19.1", "19.2", "19.6"]
    },
    {
      "id": 32,
      "tasks": ["19.3", "19.4", "19.5", "19.7", "19.8"]
    },
    {
      "id": 33,
      "tasks": ["20.1"]
    },
    {
      "id": 34,
      "tasks": ["20.2", "20.3", "20.4", "20.6", "20.7", "20.8", "20.9", "20.10"]
    },
    {
      "id": 35,
      "tasks": ["20.5"]
    },
    {
      "id": 36,
      "tasks": ["21.1", "21.2", "21.3", "21.4", "21.5", "21.6", "21.7", "21.8", "21.9", "21.10"]
    },
    {
      "id": 37,
      "tasks": ["22.1", "22.4"]
    },
    {
      "id": 38,
      "tasks": ["22.2", "22.3", "22.5"]
    },
    {
      "id": 39,
      "tasks": ["23.1", "23.4", "23.6"]
    },
    {
      "id": 40,
      "tasks": ["23.2", "23.3", "23.5"]
    },
    {
      "id": 41,
      "tasks": ["24.1", "24.2"]
    },
    {
      "id": 42,
      "tasks": ["24.3", "24.4", "24.5"]
    },
    {
      "id": 43,
      "tasks": ["25.1", "25.2", "25.3"]
    },
    {
      "id": 44,
      "tasks": ["25.4", "25.5"]
    },
    {
      "id": 45,
      "tasks": ["25.6"]
    }
  ]
}
```
