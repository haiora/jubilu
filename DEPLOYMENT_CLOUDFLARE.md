# Déploiement Cloudflare Pages - Jubilé Israel

## Prérequis
- Compte Cloudflare (gratuit ou payant)
- Node.js et npm installés
- Compte GitHub (pour l'intégration Git)

## Configuration préalable

### 1. Variables d'environnement
Créer un fichier `.env` avec les variables suivantes (ou les configurer dans Cloudflare Dashboard) :

```env
# Site
NEXT_PUBLIC_SITE_URL=https://jubilee-israel.pages.dev

# Stripe (optionnel - mode démo si absent)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend (optionnel - mode démo si absent)
RESEND_API_KEY=re_...
RESEND_WEBHOOK_SECRET=whsec_...
EMAIL_FROM=contact@jubilee-israel.org

# Base de données D1 (Cloudflare)
# DATABASE_URL et TURSO_AUTH_TOKEN ne sont PAS utilisés sur Cloudflare Pages
# Le binding D1 est configuré dans wrangler.toml
```

### 2. Seed des données de démonstration
Avant le déploiement, exécuter localement pour peupler la base de données :

```bash
npm run db:seed          # Produits et variants
npm run db:seed:demo     # Utilisateurs admin/staff + client + ventes weekend
```

## Déploiement (Méthode recommandée : Intégration Git)

Cette méthode est recommandée pour Windows car elle évite les problèmes de compatibilité avec `@cloudflare/next-on-pages`.

### Étape 1: Créer un dépôt GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/jubilu.git
git push -u origin main
```

### Étape 2: Créer la base de données D1
```bash
npm run cf:login
npm run cf:d1:create
```
Notez le `database_id` retourné (ex: `6c438549-8a51-491a-98f5-61625057c050`).

### Étape 3: Mettre à jour wrangler.toml
Ouvrir `wrangler.toml` et remplacer `database_id` par l'ID retourné :

```toml
[[d1_databases]]
binding = "DB"
database_name = "jubilee-db"
database_id = "6c438549-8a51-491a-98f5-61625057c050"
```

### Étape 4: Appliquer les migrations
```bash
npm run cf:d1:migrate
```

### Étape 5: Créer le projet Cloudflare Pages via Dashboard
1. Aller sur [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Pages > Create a project > Connect to Git
3. Sélectionner le dépôt GitHub `jubilu`
4. Configuration du build :
   - **Framework preset** : Next.js
   - **Build command** : `npm run build`
   - **Build output directory** : `.next`
5. Configuration de l'environnement :
   - Ajouter les variables d'environnement (voir section 1)
6. Configuration des bindings :
   - **D1 database** : `jubilee-db` (binding: `DB`)
   - **R2 bucket** : `jubilee-media` (binding: `MEDIA`)
7. Déployer

### Étape 6: Seed des données en production
Via Cloudflare Dashboard > D1 > jubilee-db > Console, exécuter les seed scripts ou utiliser wrangler :

```bash
# Optionnel : seed via wrangler (nécessite adaptation pour D1 distant)
# Pour l'instant, les données sont seedées localement et synchronisées via migrations
```

## Déploiement (Méthode alternative : CLI)

**Note : Cette méthode nécessite Linux/macOS ou WSL sur Windows car @cloudflare/next-on-pages requiert bash.**

### Étape 1: Connexion Cloudflare
```bash
npm run cf:login
```

### Étape 2: Créer la base de données D1
```bash
npm run cf:d1:create
```

### Étape 3: Mettre à jour wrangler.toml
Remplacer `database_id` par l'ID retourné.

### Étape 4: Appliquer les migrations
```bash
npm run cf:d1:migrate
```

### Étape 5: Builder pour Cloudflare Pages
```bash
npm run cf:build
```

### Étape 6: Déployer
```bash
npm run cf:deploy
```

## Commandes utiles

- **Preview local** : `npm run cf:preview` (nécessite WSL sur Windows)
- **Logs** : Via Cloudflare Dashboard > Pages > jubilee-israel > Functions
- **Base de données** : Via Cloudflare Dashboard > D1 > jubilee-db

## Utilisateurs de démonstration

Après le déploiement, vous pouvez vous connecter avec :

- **Admin** : admin@jubilee-israel.org / admin123
- **Staff boutique** : user@jubilee-israel.org / user123
- **Client démo** : jean.dupont@example.fr (consultation via page compte)

## Notes importantes

1. **Windows et @cloudflare/next-on-pages** : Sur Windows, utilisez l'intégration Git (méthode recommandée) ou WSL pour la méthode CLI.

2. **OpenNext** : Cloudflare recommande maintenant d'utiliser [OpenNext](https://opennext.js.org/cloudflare) au lieu de @cloudflare/next-on-pages. Migration future recommandée.

3. **Stock** : Les pages boutique sont en `force-dynamic` pour afficher le stock en temps réel depuis D1.

4. **Mode démo** : Sans clés Stripe/Resend, le site fonctionne en mode démo (paiements simulés, emails non envoyés).

5. **Domaine personnalisé** : Configurer dans Cloudflare Dashboard > Pages > jubilee-israel > Custom domains (ex: jubilee-israel.org).

## Dépannage

- **Erreur "database not found"** : Vérifiez que `database_id` dans `wrangler.toml` correspond à celui créé.
- **Erreur de build** : Exécuter `npm run build` localement pour vérifier les erreurs.
- **Problèmes de stock** : Vérifiez que les migrations ont été appliquées avec `npm run cf:d1:migrate`.
- **Windows CLI error "spawn bash ENOENT"** : Utilisez l'intégration Git (méthode recommandée) ou WSL.
