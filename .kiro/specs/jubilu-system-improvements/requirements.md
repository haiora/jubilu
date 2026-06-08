# Requirements Document

## Introduction

Cette spécification définit les améliorations complètes du système Jubilu, une plateforme Next.js existante pour une association chrétienne dédiée à la Terre Sainte. Le système actuel dispose d'une base fonctionnelle (boutique, CRM basique, admin) mais nécessite des améliorations significatives en termes d'architecture, performance, fonctionnalités CRM, système d'emailing, design, et contenu multilingue (fr, en, es, he avec support RTL).

Les objectifs principaux sont :
1. Analyser et optimiser l'architecture existante
2. Améliorer les performances et la maintenabilité du code
3. Développer les fonctionnalités manquantes identifiées
4. Vérifier et compléter les traductions multilingues
5. Enrichir le contenu visuel (images, design moderne)
6. Améliorer le système CRM pour gérer clients, donateurs et acheteurs
7. Étendre l'administration CRM avec emailing avancé, templates, et options d'administration

## Glossary

- **System**: L'application Next.js Jubilu dans son ensemble (frontend + backend + admin)
- **Admin_Panel**: L'interface d'administration accessible via `/admin`
- **CRM_Module**: Le module de gestion des contacts, clients et donateurs
- **Email_Engine**: Le système d'envoi d'emails basé sur Resend
- **Translation_System**: Le système de traductions multilingues basé sur next-intl
- **Database**: La base de données SQLite gérée par Drizzle ORM
- **Public_Site**: Les pages publiques accessibles via `/{locale}/...`
- **Design_System**: L'ensemble des composants UI, styles et thème basé sur Tailwind CSS et shadcn/ui
- **Product_Catalog**: Le catalogue de produits (vins et parchemins)
- **Order_Management**: Le système de gestion des commandes
- **Media_Asset**: Fichier image ou média stocké dans le système
- **Campaign**: Une campagne d'emailing ciblée
- **Template**: Un modèle d'email réutilisable
- **Segment**: Un groupe de contacts filtré selon des critères
- **Audit_Trail**: Journal des actions administratives

## Requirements

### Requirement 1: Code Architecture Analysis and Optimization

**User Story:** En tant que développeur, je veux analyser l'architecture existante du code, afin d'identifier les points d'amélioration en termes de structure, patterns et maintenabilité.

#### Acceptance Criteria

1. THE System SHALL provide a comprehensive architecture analysis report identifying code smells, anti-patterns, and technical debt
2. WHEN duplicate code is detected, THE System SHALL consolidate it into reusable components or utilities
3. THE System SHALL refactor components to follow single responsibility principle
4. THE System SHALL implement consistent error handling patterns across all API routes
5. THE System SHALL establish clear separation of concerns between business logic, data access, and presentation layers
6. THE System SHALL document architectural decisions and patterns in architecture documentation
7. THE System SHALL ensure all TypeScript types are properly defined without using `any` type

### Requirement 2: Performance Optimization

**User Story:** En tant qu'utilisateur, je veux que l'application soit rapide et performante, afin d'avoir une expérience utilisateur optimale.

#### Acceptance Criteria

1. THE System SHALL achieve Core Web Vitals scores above 90 for all public pages
2. WHEN images are loaded, THE System SHALL use Next.js Image optimization with appropriate sizing and lazy loading
3. THE System SHALL implement code splitting for admin panel routes
4. THE System SHALL minimize bundle size by removing unused dependencies
5. THE Database SHALL use appropriate indexes on frequently queried columns
6. THE System SHALL implement caching strategies for static content and translations
7. WHEN API routes are called, THE System SHALL respond within 200ms for 95th percentile requests
8. THE System SHALL implement database query optimization to avoid N+1 problems

### Requirement 3: Missing Features Development

**User Story:** En tant qu'administrateur, je veux que toutes les fonctionnalités prévues soient complètement implémentées, afin de pouvoir gérer efficacement l'association.

#### Acceptance Criteria

1. THE System SHALL implement complete CRUD operations for all entities (products, orders, contacts, campaigns)
2. WHEN a product variant stock reaches zero, THE Admin_Panel SHALL display a stock alert
3. THE System SHALL implement CSV import functionality for contacts with duplicate detection
4. THE System SHALL implement CSV export functionality for contacts, orders, and campaigns
5. THE Order_Management SHALL support complete order lifecycle from pending to delivered
6. THE System SHALL implement parchment production tracking with status updates (to_produce → in_production → quality_check → ready → shipped)
7. THE Admin_Panel SHALL display dashboard analytics with revenue, orders, and conversion metrics
8. THE System SHALL implement contact merge functionality to handle duplicates
9. THE System SHALL implement product search and filtering in the public catalog
10. THE System SHALL implement order tracking functionality for customers

### Requirement 4: Multilingual Translation Verification

**User Story:** En tant qu'utilisateur international, je veux que toutes les traductions soient cohérentes et complètes dans les quatre langues supportées, afin de comprendre parfaitement le contenu.

#### Acceptance Criteria

1. THE Translation_System SHALL provide complete translations for all UI strings in French, English, Spanish, and Hebrew
2. WHEN a translation key is missing in a locale, THE Translation_System SHALL log a warning and fall back to French
3. THE System SHALL verify translation consistency across all locales for identical features
4. THE System SHALL support RTL (right-to-left) layout for Hebrew locale with proper CSS logical properties
5. THE System SHALL implement a translation verification tool to detect missing or outdated translations
6. THE Database SHALL store product descriptions, blog posts, and page content in all four locales
7. THE Admin_Panel SHALL allow editing translations directly from the interface
8. THE System SHALL implement proper pluralization rules for each locale

### Requirement 5: Visual Content Enhancement

**User Story:** En tant qu'utilisateur, je veux voir des images de qualité et un design visuellement attractif, afin d'être engagé par le contenu de la mission.

#### Acceptance Criteria

1. THE System SHALL include high-quality images for all products with at least 3 images per product
2. THE Public_Site SHALL display hero images optimized for different viewport sizes
3. THE System SHALL implement image galleries for mission projects with lightbox functionality
4. THE Media_Asset SHALL support alt text in all four locales for accessibility
5. THE System SHALL implement image upload with automatic optimization and resizing
6. THE Admin_Panel SHALL allow managing media assets with tagging and categorization
7. THE Public_Site SHALL display testimonial photos when available
8. THE System SHALL implement favicon and social media share images (og:image, twitter:image)

### Requirement 6: Design System Modernization

**User Story:** En tant qu'utilisateur, je veux une interface moderne, cohérente et esthétique, afin d'avoir une expérience premium reflétant les valeurs de Jubilé.

#### Acceptance Criteria

1. THE Design_System SHALL implement a consistent color palette reflecting Jubilé's brand identity (gold, wine colors, parchment tones)
2. THE Design_System SHALL use a premium serif font for headings and clear sans-serif for body text
3. THE System SHALL implement smooth animations and transitions using Framer Motion
4. THE Design_System SHALL provide consistent spacing, border radius, and shadow utilities
5. THE Public_Site SHALL implement responsive layouts optimized for mobile, tablet, and desktop
6. THE Admin_Panel SHALL use consistent card-based layouts with clear visual hierarchy
7. THE System SHALL implement accessible focus states and keyboard navigation
8. THE Design_System SHALL provide loading states and skeleton screens for async operations
9. THE System SHALL implement toast notifications for user feedback using Sonner
10. THE Public_Site SHALL implement a premium footer with newsletter signup and verse citation

### Requirement 7: CRM Enhancement

**User Story:** En tant qu'administrateur CRM, je veux gérer efficacement les clients, donateurs et prospects, afin de maintenir des relations de qualité et suivre leur parcours.

#### Acceptance Criteria

1. THE CRM_Module SHALL distinguish between three contact statuses: lead, client, donateur
2. WHEN a contact makes their first purchase, THE CRM_Module SHALL automatically update their status to client
3. THE CRM_Module SHALL track total spent and order count for each contact with automatic updates
4. THE CRM_Module SHALL support custom tags with color coding for contact categorization
5. THE CRM_Module SHALL allow adding timestamped internal notes to any contact
6. THE CRM_Module SHALL implement contact search by name, email, country, status, and tags
7. THE CRM_Module SHALL display contact activity timeline showing orders, emails, and notes
8. THE CRM_Module SHALL calculate and display customer lifetime value (CLV) metrics
9. THE CRM_Module SHALL implement contact segmentation builder with multiple filter criteria
10. THE CRM_Module SHALL track email consent status with timestamp and source
11. THE CRM_Module SHALL support bulk actions (tag assignment, status change, export)
12. THE CRM_Module SHALL display aggregate statistics (total contacts, conversion rates, average order value)

### Requirement 8: Admin CRM Options Enhancement

**User Story:** En tant qu'administrateur, je veux des options d'administration avancées pour le CRM, afin de gérer finement les permissions, les intégrations et l'audit trail.

#### Acceptance Criteria

1. THE Admin_Panel SHALL implement role-based access control (RBAC) with seven roles: super_admin, admin, shop, crm, content, marketing, support
2. WHEN a user accesses a restricted page, THE Admin_Panel SHALL verify permissions and redirect if unauthorized
3. THE Admin_Panel SHALL provide a roles and permissions management interface
4. THE Audit_Trail SHALL log all administrative actions with user, timestamp, entity, and changes
5. THE Admin_Panel SHALL display audit log with filtering by user, entity type, date range, and action
6. THE Admin_Panel SHALL provide settings interface for API keys (Stripe, Resend, R2)
7. THE Admin_Panel SHALL implement session management with secure httpOnly cookies
8. THE Admin_Panel SHALL allow super_admin to create and manage admin users
9. THE Admin_Panel SHALL implement IP-based access restrictions for enhanced security
10. THE Admin_Panel SHALL provide data export capabilities with GDPR compliance

### Requirement 9: Email System Enhancement

**User Story:** En tant qu'administrateur marketing, je veux un système d'emailing complet avec templates et campagnes, afin de communiquer efficacement avec les contacts segmentés.

#### Acceptance Criteria

1. THE Email_Engine SHALL support transactional emails (order confirmation, shipping notification, password reset)
2. THE Email_Engine SHALL support campaign emails to segmented contact lists
3. THE Admin_Panel SHALL provide a template editor for creating reusable email templates
4. THE Email_Engine SHALL support template variables for personalization (name, order details, custom fields)
5. WHEN a campaign is created, THE Admin_Panel SHALL allow selecting target segment and template
6. THE Admin_Panel SHALL support campaign scheduling for future sending
7. THE Email_Engine SHALL track email delivery status, opens, clicks, and bounces via Resend webhooks
8. THE Admin_Panel SHALL display campaign analytics (sent count, delivery rate, open rate, click rate, unsubscribe rate)
9. THE Email_Engine SHALL support multilingual templates with locale-specific content
10. THE Admin_Panel SHALL allow testing emails before sending campaigns
11. THE Email_Engine SHALL implement unsubscribe functionality with one-click unsubscribe links
12. THE Admin_Panel SHALL provide email template preview in multiple email clients
13. THE Email_Engine SHALL implement rate limiting to avoid spam classification
14. THE Admin_Panel SHALL allow duplicating campaigns for quick reuse
15. WHEN an email bounces permanently, THE CRM_Module SHALL flag the contact email as invalid

### Requirement 10: Email Template Management

**User Story:** En tant qu'administrateur marketing, je veux créer et gérer des templates d'email réutilisables, afin de maintenir une cohérence dans les communications.

#### Acceptance Criteria

1. THE Admin_Panel SHALL provide WYSIWYG editor for email template creation
2. THE Email_Engine SHALL support HTML email templates with inline CSS
3. THE Admin_Panel SHALL allow organizing templates by category (transactional, promotional, newsletter)
4. THE Admin_Panel SHALL provide template versioning to track changes
5. THE Admin_Panel SHALL allow preview of templates with sample data
6. THE Email_Engine SHALL validate templates before saving to prevent rendering issues
7. THE Admin_Panel SHALL provide a template library with predefined layouts
8. THE Email_Engine SHALL support conditional content blocks based on contact attributes
9. THE Admin_Panel SHALL allow A/B testing of email templates
10. THE Email_Engine SHALL implement fallback plain-text version for all HTML templates

### Requirement 11: Contact Segmentation

**User Story:** En tant qu'administrateur marketing, je veux créer des segments de contacts dynamiques, afin de cibler précisément mes campagnes.

#### Acceptance Criteria

1. THE CRM_Module SHALL allow creating segments based on contact status, tags, country, locale, and email consent
2. THE CRM_Module SHALL support compound filters with AND/OR logic
3. THE CRM_Module SHALL allow creating segments based on order history (total spent, order count, last order date)
4. THE CRM_Module SHALL automatically update segment membership when contact data changes
5. THE Admin_Panel SHALL display segment member count in real-time
6. THE CRM_Module SHALL allow saving segment definitions for reuse
7. THE Admin_Panel SHALL provide segment analytics (average order value, conversion rate)
8. THE CRM_Module SHALL support negative filters (e.g., "has not purchased in 6 months")
9. THE Admin_Panel SHALL allow exporting segment members as CSV
10. THE CRM_Module SHALL implement segment templates for common use cases (VIP clients, dormant leads, recent donors)

### Requirement 12: Product Management Enhancement

**User Story:** En tant qu'administrateur boutique, je veux gérer facilement les produits et leurs variantes, afin de maintenir un catalogue à jour.

#### Acceptance Criteria

1. THE Admin_Panel SHALL provide complete product CRUD with name, description, category, price, and status
2. THE Admin_Panel SHALL support product variants with SKU, price, and stock for each variant
3. THE Admin_Panel SHALL allow uploading multiple images per product with drag-and-drop reordering
4. THE Admin_Panel SHALL support multilingual product content (name, short_desc, long_desc)
5. THE Admin_Panel SHALL implement product status management (active, draft, archived)
6. THE Admin_Panel SHALL allow marking products as featured for homepage display
7. THE Admin_Panel SHALL track stock movements with reason and author
8. WHEN stock is manually adjusted, THE Admin_Panel SHALL create a stock movement entry
9. THE Admin_Panel SHALL display low stock alerts on dashboard
10. THE Product_Catalog SHALL support customizable products (parchments with custom text)

### Requirement 13: Order Management Enhancement

**User Story:** En tant qu'administrateur boutique, je veux suivre et gérer les commandes efficacement, afin d'assurer une livraison rapide et un service client de qualité.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display orders with filtering by status, date range, and customer
2. THE Order_Management SHALL support order status workflow (pending → paid → prepared → shipped → delivered)
3. WHEN order status changes, THE Email_Engine SHALL send notification to customer
4. THE Admin_Panel SHALL display order details with items, pricing, shipping address, and payment status
5. THE Admin_Panel SHALL allow adding internal notes to orders
6. THE Order_Management SHALL support order cancellation with automatic stock restoration
7. THE Order_Management SHALL support partial refunds via Stripe integration
8. THE Admin_Panel SHALL display production status for parchment items
9. THE Admin_Panel SHALL allow printing order picking lists for warehouse
10. THE Order_Management SHALL calculate shipping costs based on destination country
11. THE Admin_Panel SHALL track order fulfillment time and display performance metrics
12. THE Order_Management SHALL support order search by order number, customer email, or customer name

### Requirement 14: Dashboard Analytics

**User Story:** En tant qu'administrateur, je veux visualiser des indicateurs clés de performance, afin de prendre des décisions éclairées sur l'activité de l'association.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display total revenue with comparison to previous period
2. THE Admin_Panel SHALL display order count by status with visual breakdown
3. THE Admin_Panel SHALL display new contacts count with growth trend
4. THE Admin_Panel SHALL calculate and display average cart value
5. THE Admin_Panel SHALL display email campaign performance metrics (open rate, click rate)
6. THE Admin_Panel SHALL show top-selling products with units sold
7. THE Admin_Panel SHALL display revenue by product category
8. THE Admin_Panel SHALL show customer acquisition metrics (new vs returning)
9. THE Admin_Panel SHALL display conversion funnel (visits → cart → checkout → purchase)
10. THE Admin_Panel SHALL allow selecting date range for all metrics
11. THE Admin_Panel SHALL display real-time activity feed of recent orders and contacts
12. THE Admin_Panel SHALL show geographic distribution of customers on a map

### Requirement 15: Accessibility Compliance

**User Story:** En tant qu'utilisateur ayant des besoins d'accessibilité, je veux que l'application soit utilisable avec technologies d'assistance, afin d'accéder au contenu de manière équitable.

#### Acceptance Criteria

1. THE System SHALL meet WCAG 2.1 Level AA standards for all public pages
2. THE System SHALL provide keyboard navigation for all interactive elements
3. THE System SHALL implement proper ARIA labels and roles for complex components
4. THE System SHALL maintain minimum 4.5:1 color contrast ratio for text
5. THE System SHALL provide skip navigation links for screen readers
6. THE System SHALL implement focus visible styles for keyboard users
7. THE System SHALL provide text alternatives for all images via alt attributes
8. THE System SHALL support screen reader announcements for dynamic content updates
9. THE System SHALL avoid using color alone to convey information
10. THE System SHALL provide form validation with clear error messages

### Requirement 16: Security Hardening

**User Story:** En tant qu'administrateur système, je veux que l'application soit sécurisée contre les vulnérabilités courantes, afin de protéger les données des utilisateurs et de l'association.

#### Acceptance Criteria

1. THE System SHALL hash all passwords using bcrypt with minimum 10 rounds
2. THE System SHALL implement CSRF protection for all state-changing operations
3. THE System SHALL validate and sanitize all user inputs using Zod schemas
4. THE System SHALL implement rate limiting on authentication endpoints
5. THE System SHALL use httpOnly, Secure, and SameSite cookies for session management
6. THE System SHALL implement SQL injection protection via parameterized queries (Drizzle ORM)
7. THE System SHALL log security events (failed login attempts, permission violations)
8. THE System SHALL implement Content Security Policy (CSP) headers
9. THE System SHALL validate file uploads for type and size restrictions
10. THE System SHALL implement honeypot fields in public forms to prevent spam
11. THE Admin_Panel SHALL enforce strong password requirements
12. THE System SHALL implement automatic session expiration after inactivity

### Requirement 17: Testing Coverage

**User Story:** En tant que développeur, je veux une couverture de tests complète, afin d'assurer la fiabilité du système et faciliter la maintenance.

#### Acceptance Criteria

1. THE System SHALL include unit tests for all business logic functions with minimum 80% coverage
2. THE System SHALL include integration tests for all API routes
3. THE System SHALL include component tests for critical UI components
4. THE System SHALL include E2E tests for main user flows (checkout, admin login, order creation)
5. THE System SHALL validate all Zod schemas with property-based tests
6. THE System SHALL test email template rendering with multiple data scenarios
7. THE System SHALL test authentication and authorization logic thoroughly
8. THE System SHALL test multilingual content with all four locales
9. THE System SHALL test RTL layout for Hebrew locale
10. THE System SHALL include performance tests for database queries

### Requirement 18: Documentation Completeness

**User Story:** En tant que nouveau développeur ou administrateur, je veux une documentation complète, afin de comprendre rapidement le système et ses fonctionnalités.

#### Acceptance Criteria

1. THE System SHALL provide README with setup instructions and architecture overview
2. THE System SHALL document all environment variables with example values
3. THE System SHALL provide API documentation for all routes with request/response examples
4. THE System SHALL document database schema with entity relationship diagrams
5. THE System SHALL provide user guide for admin panel features
6. THE System SHALL document deployment process for Cloudflare Pages
7. THE System SHALL document email template syntax and available variables
8. THE System SHALL provide troubleshooting guide for common issues
9. THE System SHALL document RBAC permissions matrix
10. THE System SHALL maintain changelog for all releases

### Requirement 19: Backup and Recovery

**User Story:** En tant qu'administrateur système, je veux des sauvegardes automatiques, afin de pouvoir restaurer les données en cas d'incident.

#### Acceptance Criteria

1. THE System SHALL implement automated daily database backups
2. THE System SHALL retain backups for minimum 30 days
3. THE System SHALL store backups in a separate location from primary database
4. THE System SHALL provide one-click restore functionality for backups
5. THE System SHALL test backup restoration process monthly
6. THE System SHALL backup uploaded media assets separately
7. THE System SHALL log all backup operations with success/failure status
8. THE Admin_Panel SHALL display backup status and last backup date
9. THE System SHALL send alerts when backup fails
10. THE System SHALL implement point-in-time recovery capability

### Requirement 20: Migration and Data Import

**User Story:** En tant qu'administrateur, je veux importer des données existantes depuis l'ancien système, afin de conserver l'historique et les contacts.

#### Acceptance Criteria

1. THE System SHALL provide CSV import for contacts with field mapping interface
2. THE System SHALL validate imported data before insertion
3. THE System SHALL detect and handle duplicate contacts during import
4. THE System SHALL provide import preview showing success/error counts
5. THE System SHALL implement rollback capability for failed imports
6. THE System SHALL import blog posts from existing Wix site with content preservation
7. THE System SHALL implement 301 redirects for all old URLs to new URL structure
8. THE System SHALL preserve SEO metadata (title, description) during migration
9. THE System SHALL import and optimize images from old site
10. THE System SHALL provide import report with statistics and error details
