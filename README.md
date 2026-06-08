# Jubilé — Plateforme associative & e-commerce

Plateforme multilingue (FR / EN / HE-RTL / ES) pour l'association **Jubilé** : présentation, boutique (vins & parchemins de Jérusalem), espace client, back-office (CRM, commandes, stock, produits, campagnes email).

## Stack

- **Next.js 14** (App Router) + **next-intl** (i18n, RTL)
- **Tailwind CSS** + composants shadcn-style + **lucide-react**
- **Cloudflare Pages/Workers** (cible de déploiement), **D1** (base de données, Drizzle ORM), **R2** (médias)
- **Resend** (emails transactionnels + campagnes)
- **Stripe** (paiement)

## Démarrage

```bash
npm install
cp .env.example .env.local   # renseigner les clés
npm run dev                  # http://localhost:3000
```

## Structure

```
docs/                 Audit + architecture (livrables stratégiques)
db/schema.ts          Modèle de données Cloudflare D1 (Drizzle)
messages/             Traductions FR/EN/HE/ES
src/
  app/[locale]/       Site public localisé (accueil, boutique, compte, ...)
  app/admin/          Back-office (auth, dashboard, CRM, commandes, ...)
  app/api/            Routes API (orders, contact, newsletter, admin/login)
  components/         site/ shop/ admin/ ui/
  i18n/               Configuration next-intl (routing, navigation, request)
  lib/                catalog, demo-data, auth, email, blog, utils
```

## Variables d'environnement

| Variable | Usage |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL publique (success/cancel Stripe, liens email) |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe (création des sessions Checkout) |
| `STRIPE_WEBHOOK_SECRET` | Secret du endpoint webhook `/api/webhooks/stripe` (`whsec_...`) |
| `RESEND_API_KEY` | Clé API Resend (emails transactionnels + campagnes) |
| `RESEND_WEBHOOK_SECRET` | Secret Svix du webhook `/api/webhooks/resend` (optionnel) |
| `EMAIL_FROM` | Expéditeur par défaut, ex: `Jubilé <noreply@jubilee-israel.org>` |

### Webhooks à configurer

- **Stripe** → `https://<domaine>/api/webhooks/stripe`, événement `checkout.session.completed`. Confirme la commande (statut `paid`), promeut le contact en `client`, met à jour les totaux/stock et envoie l'email de confirmation.
- **Resend** → `https://<domaine>/api/webhooks/resend`, événements `email.delivered/opened/clicked/bounced`. Met à jour `email_logs` et recalcule les statistiques de campagne.

> En l'absence de clés, l'application fonctionne en **mode démo** (commande marquée payée sans paiement réel, emails simplement journalisés).

## Accès back-office (démo)

`/admin/login` — identifiants de démonstration :

| Rôle | Email | Mot de passe |
|---|---|---|
| Super admin | `admin@jubilee.org` | `jubilee2026` |
| Boutique | `boutique@jubilee.org` | `boutique2026` |
| CRM | `crm@jubilee.org` | `crm2026` |
| Marketing | `marketing@jubilee.org` | `marketing2026` |

> ⚠️ Authentification de démonstration (mots de passe en clair). À remplacer par des sessions signées + hash + D1 avant la mise en production.

## Base de données (Cloudflare D1)

```bash
npx wrangler d1 create jubilee-db          # récupérer database_id -> wrangler.toml
npm run db:generate                        # générer les migrations depuis db/schema.ts
npx wrangler d1 migrations apply jubilee-db
```

## Déploiement Cloudflare Pages

```bash
npx @cloudflare/next-on-pages              # build
npx wrangler pages deploy .vercel/output/static
```

Renseigner les variables d'environnement (Resend, Stripe, etc.) dans le tableau de bord Cloudflare Pages, et les bindings **DB** (D1) et **MEDIA** (R2) via `wrangler.toml`.

## État d'avancement

Voir `docs/02-architecture.md` (roadmap par lots). Lots 0→4 livrés (socle, site public, boutique, back-office, CRM) ; emailing Resend + persistance D1 + Stripe en cours de branchement.
