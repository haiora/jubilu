# Phase 1 & 2 — Audit du site actuel & migration de contenu

> Site audité : https://www.jubilee-israel.org/ (plateforme Wix)
> Date : voir historique Git.

## 1. Constat global

Le site actuel est un **site de collecte de dons** (et non une boutique), construit sur **Wix**, **uniquement en anglais**, destiné à un public **chrétien évangélique** soutenant la « rédemption de la Terre Sainte » pour le peuple juif.

Il existe donc un **écart de modèle** avec le brief :

| Dimension | Site actuel | Cible demandée |
|---|---|---|
| Nature | Vitrine de dons | Plateforme associative **+ e-commerce + CRM** |
| Produits | Aucun | Vins (blanc/rouge/rosé) + parchemins de Jérusalem |
| Langues | EN uniquement | FR / EN / HE (RTL) / ES |
| Gestion interne | Aucune (Wix) | CRM, commandes, stock, campagnes email |
| Hébergement | Wix | Cloudflare Pages + Workers |
| Emails | Aucun système | Resend (transactionnel + campagnes) |

## 2. Arborescence actuelle

- `/` Accueil — « Redeem the land of Israel »
- `/about` — « The origins »
- `/donate/qasr-al-yahud/baptismalsiteredemption` — Projet site baptismal
- `/donate/old-city-jerusalem` — Vieille ville de Jérusalem
- `/donate/jerusalem-and-surrounding` — Alentours de Jérusalem
- `/blog` (News) + articles `/post/...`
- `/contact`

## 3. Diagnostic

### Forces (à conserver)
- **Mission claire et émotionnelle**, ancrée dans les versets bibliques (Genèse 17:8, Galates 3:29, Psaume 122:6, Psaume 48:2, Luc 19:41-42).
- **Positionnement unique** : « pont entre sionistes et chrétiens évangéliques ».
- **Storytelling fort** autour de Jérusalem et de la restauration d'Israël.
- 4 articles de blog SEO existants (agriculture/prophétie, foi, rédemption biblique, médias évangéliques).

### Faiblesses
- **Monolingue** (perte d'audience FR/HE/ES).
- **Aucune capacité de vente** ni de gestion (tout est externalisé à Wix).
- **SEO limité** : structure Wix, pas de hreflang, pas de données structurées produit.
- **CTA unique = "Donate"**, pas de parcours d'achat ni de conversion produit.
- **Performance** : surcharge JS Wix, Core Web Vitals médiocres typiques de Wix.
- Pas de mentions légales / CGV / politique de confidentialité visibles.

### Risques de la refonte
- **Cohérence doctrinale/ton** : public sensible, le ton doit rester respectueux et authentique.
- **Migration SEO** : changement d'URLs → redirections 301 obligatoires.
- **RTL hébreu** : nécessite une vraie gestion bidirectionnelle, pas juste une traduction.
- **Conformité** : vente d'alcool (vins) → mentions légales, restrictions d'âge/pays, TVA, expédition.
- **Paiement** : besoin d'un PSP (Stripe recommandé) — à confirmer.

## 4. Contenu à conserver / réécrire / supprimer

### À CONSERVER (et enrichir)
- Récit fondateur « The origins » → page **À propos** (FR/EN/HE/ES).
- Les **versets** et le vocabulaire spirituel (identité de marque).
- Les 3 projets de rédemption → section **Mission / Impact**.
- Les 4 articles de blog → migrés vers **Actualités / Blog** + traduits.

### À RÉÉCRIRE / RESTRUCTURER
- Le discours « dons » à élargir : mission + boutique (les achats soutiennent la mission).
- Reformulation multilingue professionnelle (pas de traduction automatique brute).

### À AJOUTER (manquant)
- Boutique, fiches produits, panier, checkout, suivi de commande.
- Parchemins personnalisés (texte manuscrit depuis Jérusalem).
- Témoignages, FAQ, pages légales (mentions, confidentialité, CGV, cookies).
- Back-office : CRM, commandes, stock, produits, campagnes, traductions, dashboard.

## 5. Plan de redirections (301)

| Ancienne URL (Wix) | Nouvelle URL |
|---|---|
| `/` | `/{lang}` |
| `/about` | `/{lang}/a-propos` (FR), `/en/about`, etc. |
| `/donate/qasr-al-yahud/baptismalsiteredemption` | `/{lang}/mission/qasr-al-yahud` |
| `/donate/old-city-jerusalem` | `/{lang}/mission/vieille-ville-jerusalem` |
| `/donate/jerusalem-and-surrounding` | `/{lang}/mission/alentours-jerusalem` |
| `/blog` | `/{lang}/actualites` |
| `/post/{slug}` | `/{lang}/actualites/{slug}` |
| `/contact` | `/{lang}/contact` |

> Les redirections seront servies par Cloudflare (`_redirects` / Workers) pour préserver le SEO.

## 6. Améliorations immédiates (priorités)

1. Fonder la nouvelle identité visuelle premium (palette, typographie, composants).
2. Structure multilingue FR/EN/HE/ES + RTL dès le socle.
3. Page d'accueil de présentation forte (mission d'abord, boutique ensuite).
4. Boutique fonctionnelle (catalogue, panier, checkout, emails de confirmation).
5. Back-office CRM/commandes/stock exploitable (non décoratif).
6. SEO technique : hreflang, sitemap, données structurées, Core Web Vitals.
