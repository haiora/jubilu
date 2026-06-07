# Phases 3–16 — Architecture, spécifications & plan de mise en œuvre

## A. Arborescence cible (sitemap)

### Espace public (`/{lang}/...`, lang ∈ fr|en|he|es)
1. **Accueil** `/`
2. **À propos** `/a-propos`
3. **Mission / Impact** `/mission` (+ sous-pages projets : `/mission/qasr-al-yahud`, `/mission/vieille-ville-jerusalem`, `/mission/alentours-jerusalem`)
4. **Boutique** `/boutique`
5. Vin blanc `/boutique/vin-blanc`
6. Vin rouge `/boutique/vin-rouge`
7. Vin rosé `/boutique/vin-rose`
8. Parchemins de Jérusalem `/boutique/parchemins`
9. **Témoignages** `/temoignages`
10. **Actualités / Blog** `/actualites` (+ `/actualites/{slug}`)
11. **Contact** `/contact`
12. **FAQ** `/faq`
13. **Mentions légales** `/mentions-legales`
14. **Confidentialité** `/confidentialite`
15. **CGV** `/cgv`
16. **Cookies** `/cookies`
17. Panier `/panier`, Checkout `/commande`, Confirmation `/commande/confirmation`, Suivi `/commande/suivi`
18. Compte client `/compte` (commandes, profil)

### Espace admin (`/admin`, hors index, auth requise)
- **Connexion** `/admin/login`
- **Tableau de bord** `/admin`
- **CRM** `/admin/crm` (contacts, clients, segments, tags, notes)
- **Commandes** `/admin/commandes`
- **Stock** `/admin/stock`
- **Produits** `/admin/produits`
- **Clients** `/admin/clients`
- **Campagnes email** `/admin/campagnes`
- **Traductions / CMS** `/admin/contenu`
- **Paramètres / rôles** `/admin/parametres`

## B. Stack technique (compatible Cloudflare)

| Couche | Choix | Justification |
|---|---|---|
| Framework | **Next.js (App Router)** sur **Cloudflare Pages** (`@cloudflare/next-on-pages`, runtime edge) | SSR/ISR, SEO, i18n routing, écosystème riche |
| i18n | **next-intl** | routing par locale, messages, RTL, fallback |
| Styling | **Tailwind CSS** + **shadcn/ui** + **lucide-react** | UI premium, accessible, composants réutilisables |
| Base de données | **Cloudflare D1** (SQLite) via **Drizzle ORM** | natif Cloudflare, typé, migrations |
| Stockage média | **Cloudflare R2** | images produits/parchemins, natif CF |
| Emails | **Resend** (via Workers/API routes) | transactionnel + campagnes |
| Auth | Sessions **Lucia-like** (cookies httpOnly) + RBAC | sécurité, rôles fins |
| Paiement | **Stripe** (Checkout/Payment Intents) | à confirmer — alcool/expédition |
| Déploiement | Cloudflare Pages + Workers | exigence du brief |

> **Base email existante** : à brancher (import → table `contacts` + `email_consent`). Source/format à fournir (CSV, API, autre DB).

## C. Modèle de données (Drizzle / D1)

Tables (Phase 14) :
- `users` (id, email, password_hash, name, locale, role_id, active, created_at)
- `roles` (id, key, name) — super_admin, admin, shop, crm, content, marketing, support
- `permissions` (id, key) + `role_permissions` (role_id, permission_id)
- `contacts` (id, first_name, last_name, email, phone, country, locale, status, source, email_consent, created_at)
- `contact_tags` (contact_id, tag_id) + `tags` (id, name, color)
- `contact_notes` (id, contact_id, author_id, body, created_at)
- `clients` = vue/extension de `contacts` ayant au moins une commande (flag + agrégats : total_spent, orders_count, avg_cart, last_order_at)
- `segments` (id, name, definition_json) — segmentation dynamique
- `products` (id, slug, category, status, featured, base_price, currency, created_at)
- `product_translations` (product_id, locale, name, short_desc, long_desc)
- `product_variants` (id, product_id, sku, name, price, stock, active)
- `media_assets` (id, product_id, url, alt, position)
- `orders` (id, number, contact_id, status, subtotal, shipping, tax, total, currency, locale, shipping_address_json, created_at)
- `order_items` (id, order_id, variant_id, name_snapshot, unit_price, qty, custom_text) — `custom_text` pour parchemins
- `stock_movements` (id, variant_id, delta, reason, author_id, created_at)
- `campaigns` (id, name, subject, template_id, segment_id, status, scheduled_at, sent_at, stats_json)
- `email_templates` (id, key, name, locale, subject, html, updated_at)
- `email_logs` (id, campaign_id, contact_id, type, resend_id, status, opened_at, clicked_at, bounced_at, created_at)
- `pages` (id, key, locale, title, body, seo_json, status) — CMS
- `translations` (id, namespace, key, locale, value) — libellés UI éditables
- `testimonials` (id, author, country, locale, body, rating, published)
- `blog_posts` (id, slug) + `blog_post_translations` (post_id, locale, title, excerpt, body, seo_json, published_at)
- `audit_logs` (id, user_id, action, entity, entity_id, meta_json, ip, created_at)
- `settings` (key, value_json)

Order status : `pending → paid → prepared → shipped → delivered` (+ `cancelled`, `refunded`).
Parchemin status (production) : `to_produce → in_production → quality_check → ready → shipped`.

## D. Rôles & permissions (Phase 15)

Actions : `read, create, update, delete, export, publish, send, configure, archive`.

| Rôle | Périmètre |
|---|---|
| super_admin | tout + configure rôles |
| admin | tout sauf gestion des super_admins |
| shop | produits, stock, commandes (read/create/update/export) |
| crm | contacts, clients, segments, notes (read/create/update/export) |
| content | pages, blog, témoignages, traductions (read/create/update/publish) |
| marketing | campagnes, templates, segments (read/create/update/send/archive) |
| support | commandes & contacts (read + notes), pas de delete/export |

## E. Multilingue (Phase 10)

- 4 locales : `fr` (défaut), `en`, `he` (RTL), `es`.
- Routing `/{lang}/...`, `hreflang` + `x-default`, `<html lang dir>` dynamique.
- UI via next-intl messages ; contenu (produits/pages/blog) traduit en base.
- RTL hébreu : `dir="rtl"`, mirroring layout (logical CSS properties).
- Fallback : locale manquante → `fr`. Sélecteur de langue persistant (cookie).
- Traductions humaines/professionnelles (pas de MT brute).

## F. SEO (Phase 12)

- H1 unique/page, hiérarchie H2/H3, `title`/`meta description` par locale.
- URLs propres localisées, maillage interne, fil d'Ariane.
- Données structurées : `Organization`, `Product`+`Offer`, `Article`, `BreadcrumbList`, `FAQPage`.
- `sitemap.xml` (multilingue, alternates), `robots.txt`, redirections 301.
- Images optimisées (next/image + R2), Core Web Vitals (edge SSR, lazy load).
- Admin en `noindex`.

## G. Sécurité & conformité (Phases 13, 16)

- Auth sessions cookies `httpOnly/Secure/SameSite`, hash Argon2/bcrypt.
- RBAC à chaque route admin + vérif côté serveur (jamais uniquement client).
- Protection formulaires : honeypot + rate limiting (Workers) + validation Zod.
- `audit_logs` (audit trail), logs d'événements, sauvegardes D1.
- Consentement email (RGPD), gestion désabonnement, mentions légales, CGV.
- Vente d'alcool : contrôle d'âge + restrictions pays à prévoir.

## H. Dashboard (Phase 9)

CA (jour/mois/année), nb commandes, commandes par statut, stock faible, top produits,
clients actifs, nouveaux contacts, perf campagnes (envoyés/ouverts/clics/désabos/rebonds),
perf par langue/canal, panier moyen, taux de conversion.

## I. Emails (Phase 8)

- Moteur d'envoi Resend : unitaire, transactionnel, masse, newsletter, ciblé.
- Interface de création de campagne (contenu **saisi par l'équipe**, pas généré auto).
- Segmentation, planification, test avant envoi, duplication, archivage, brouillons.
- Templates multilingues. Webhooks Resend → `email_logs` (delivered/opened/clicked/bounced).
- Stats par campagne / segment / langue.

## J. Plan de mise en œuvre (roadmap)

- **Lot 0 — Socle** : scaffold Next.js + Tailwind + shadcn + next-intl (4 langues + RTL), design system, layout (header/footer/sélecteur de langue), thème Jubilé.
- **Lot 1 — Site public** : Accueil, À propos, Mission, Témoignages, FAQ, Contact, pages légales, Blog. SEO (sitemap, hreflang, redirections).
- **Lot 2 — Boutique** : catalogue, fiches produits (dont parchemins personnalisés), panier, checkout Stripe, emails de confirmation, suivi commande.
- **Lot 3 — Back-office** : auth + RBAC, dashboard, produits, stock, commandes.
- **Lot 4 — CRM** : contacts/clients, segments, tags, notes, import/export CSV, fusion doublons.
- **Lot 5 — Emailing** : campagnes Resend, templates, stats, webhooks.
- **Lot 6 — Finitions** : audit trail, perfs, accessibilité, hardening sécurité, contenus définitifs.

## K. Modèle de données et schéma DB

Voir section C ; implémentation Drizzle dans `db/schema.ts`, migrations `db/migrations`.
