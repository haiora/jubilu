# Configuration GitHub Actions pour déploiement automatique

## Secrets GitHub à configurer

Aller sur : https://github.com/haiora/jubilu/settings/secrets/actions

### 1. CLOUDFLARE_API_TOKEN
- Nom : `CLOUDFLARE_API_TOKEN`
- Valeur : [Token Cloudflare créé précédemment]

### 2. CLOUDFLARE_ACCOUNT_ID
- Nom : `CLOUDFLARE_ACCOUNT_ID`
- Valeur : `4fb3f53a2fc22d144537bc732863498e`

## Fonctionnement

Le workflow `.github/workflows/deploy.yml` s'exécute automatiquement à chaque push sur la branche `main` :

1. Checkout du code
2. Installation des dépendances
3. Build avec `@cloudflare/next-on-pages` (génère `.vercel/output/static`)
4. Déploiement sur Cloudflare Pages via wrangler

## Déploiement manuel

Pour déclencher un déploiement manuel :
- Aller sur https://github.com/haiora/jubilu/actions
- Sélectionner le workflow "Deploy to Cloudflare Pages"
- Cliquer sur "Run workflow"
