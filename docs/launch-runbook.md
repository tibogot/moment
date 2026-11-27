# Mise en ligne de moment-lab.be — le plan du jour J

À suivre dans l'ordre, en cochant. Préparé le 26 novembre 2026. Aucun secret
dans ce fichier : les valeurs sont dans le projet Vercel de test
(`tibos-projects/moment`) et dans `.env.local`.

Durée : une demi-journée, plus le temps de propagation du DNS (de quelques
minutes à une heure).

---

## La veille (J-1)

- [ ] **Moment a terminé ses produits**, et la relecture complète est faite
      (allergènes, régimes, prix, traductions). Aucun produit actif à 0 €.
- [ ] **Bancontact confirmé** dans Shopify → si oui, l'ajouter à
      `LOCAL_METHODS` dans `lib/shopify/payments.ts`.
- [ ] **Ononto a répondu** : Café (horaires publiés à Google), facture avec TVA
      (page Pro), crédit Rond Carré.
- [ ] **Baisser le TTL du DNS** chez Combell sur les enregistrements de
      `moment-lab.be` et `www` (3600 → 300) : la bascule sera visible plus vite.
- [ ] **Nettoyer les pages de test** : supprimer `/v1` (ancienne home) et les
      pages `/v2/*` qui ne servent plus.
- [ ] **Accès au code pour le Vercel de Moment** : le dépôt GitHub doit être
      visible depuis leur équipe Vercel « Moment lab ». Soit on transfère le
      dépôt à `sofiane-moment` maintenant, soit on les ajoute comme
      collaborateurs le temps du lancement.

## Jour J — 1. Le projet Vercel de Moment

Dans l'équipe Vercel **Moment lab** (Pro) :

- [ ] **New Project** → importer le dépôt GitHub du site.
- [ ] **Settings → General → Node.js Version : 26.x.**
- [ ] **Settings → Environment Variables**, environnement *Production*.
      Créer les clés, secrets et tokens en type **Secret** (pas « Config ») :
      dans le projet de test, Vercel les signale « Needs Attention » parce
      qu'ils ont été créés en clair. Copier depuis le projet de test, sauf les
      lignes marquées ⚠ :

| Variable | Valeur |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | ⚠ `https://www.moment-lab.be` (sans `/` final) |
| `SHOPIFY_APP_URL` | ⚠ `https://www.moment-lab.be` — dans le test elle vaut l'adresse vercel.app : l'oublier renverrait la connexion client vers le site de test |
| `SHOPIFY_STORE_DOMAIN` | `hhfesf-40.myshopify.com` (ne change pas) |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | copier |
| `SHOPIFY_API_VERSION` | `2026-10` |
| `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` | copier |
| `SHOPIFY_ADMIN_CLIENT_ID` | copier |
| `SHOPIFY_ADMIN_CLIENT_SECRET` | copier |
| `SHOPIFY_WEBHOOK_SECRET` | copier |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | copier |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `SANITY_REVALIDATE_SECRET` | copier (le même que dans le webhook Sanity) |
| `GEOAPIFY_API_KEY` | ⚠ **pas dans le projet de test** : la prendre dans `.env.local` ou dans le tableau de bord Geoapify (projet « moment »). Sans elle, la recherche d'adresse ne connaît que Bruxelles (Urbis) : un client de Waterloo ou de Louvain ne peut pas commander |
| `GEOAPIFY_MAP_KEY` | ⚠ la clé « navigateur » de la carte « Où nous trouver », limitée aux adresses du site. Sans elle, la page n'affiche que la liste |
| `RESEND_API_KEY` | ⚠ à créer dans le compte Resend de Moment (équipe moment-lab, domaine moment-lab.be déjà vérifié) |
| `CONTACT_EMAIL_FROM` | ⚠ une adresse du domaine vérifié, par ex. `Moment <site@moment-lab.be>` |
| `CONTACT_EMAIL_TO` | ⚠ `info@moment-lab.be` (où arrivent les formulaires et la newsletter) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | ⚠ l'identifiant GA4 de Moment (`G-…`), si l'analyse est activée |

- [ ] **Settings → Domains** : ajouter `www.moment-lab.be` (principal) et
      `moment-lab.be` (redirigé vers www). Vercel affiche les enregistrements DNS
      à créer — les noter.
- [ ] Déployer une première fois (Deployments → Redeploy), **après** avoir mis
      les variables : `NEXT_PUBLIC_*` est figé au moment de la construction.

## Jour J — 2. Le DNS chez Combell

- [ ] **Retirer la redirection web** de `moment-lab.be` vers Instagram
      (DNS & redirections → redirections).
- [ ] Créer les enregistrements que Vercel a indiqués : en général un **A**
      pour `moment-lab.be` et un **CNAME** `www` → la cible Vercel.
- [ ] **Ne pas toucher** aux autres : MX (Google), SPF, DKIM (`google._domainkey`,
      `resend._domainkey`, les deux `…_domainkey` de Shopify), `_dmarc`, `send`,
      `rsend`, **`shop` (paiement Shopify)** et `shopify_verification_shop`.
- [ ] Attendre que Vercel affiche les deux domaines en « Valid Configuration ».

## Jour J — 3. Shopify

- [ ] **Paramètres → Notifications → Webhooks** : changer l'adresse des 10
      webhooks (produits, collections, stock, commandes) en
      `https://www.moment-lab.be/api/revalidate/shopify`.
- [ ] Repointer les 15 webhooks des réglages de livraison (fermetures, zones,
      créneaux) :
      `npm run shopify:webhooks -- https://www.moment-lab.be --prune`
- [ ] **Retirer le mot de passe de la boutique** (Préférences → protection par
      mot de passe).
- [ ] **Désinstaller le canal « Boutique en ligne »** : sinon l'ancienne
      vitrine Shopify (thème Horizon) devient visible sur `shop.moment-lab.be`.
      Le paiement continue de fonctionner sur ce domaine.
- [ ] Vérifier que les adresses de retour du compte client contiennent
      `https://www.moment-lab.be/api/auth/callback` (Headless → Customer Account
      API ; déjà ajoutée le 21 novembre).

## Jour J — 4. Sanity

- [ ] **sanity.io/manage → API → Webhooks** : changer l'adresse en
      `https://www.moment-lab.be/api/revalidate/sanity` (garder le secret ;
      le filtre doit contenir `"eventsPage"` et `"coffeePage"`, ajoutés le 27 novembre — sinon
      les photos de la page Événements mettent jusqu'à 24 h à changer).
- [ ] **API → CORS origins** : ajouter `https://www.moment-lab.be` avec
      « Allow credentials » (le Studio est à `/studio` et `/admin`).
- [ ] Dans le Studio, **éteindre le bandeau d'annonce de test** (« Fermé du 24
      décembre au 2 janvier »).

- [ ] **Studio hébergé** : dans `sanity/actions/viewOnSite.ts`, passer
      `SITE_IS_LIVE` à `true`, pousser, puis `npm run studio:deploy` — le
      bouton « Voir sur le site » du Studio hébergé ouvre alors www au lieu
      du site de test.

## Jour J — 5. Les vérifications

- [ ] `https://www.moment-lab.be` s'ouvre, `moment-lab.be` et l'adresse
      vercel.app redirigent vers www.
- [ ] Le site s'ouvre **dans une fenêtre privée, sans être connecté à
      Vercel**. Le nouveau projet doit rester en *Deployment Protection →
      Standard Protection* (le réglage par défaut). Le projet de test, lui, est
      en *All Deployments* depuis le 27 novembre : il ne sert pas pour le
      lancement et reste privé.
- [ ] `/robots.txt` autorise l'indexation et donne la ligne `Sitemap:` ;
      `/sitemap.xml` ne contient que des adresses en `www.moment-lab.be`.
- [ ] Une page au hasard : `<meta name="robots">` vaut `index, follow`.
- [ ] **Vraie commande payée, en livraison** : le paiement passe sur
      `shop.moment-lab.be`, la TVA vaut 6 %, l'e-mail de confirmation arrive, la
      commande apparaît dans Shopify avec le jour et le créneau. Rembourser
      ensuite.
- [ ] Un panier en **click & collect** jusqu'au paiement (sans payer).
- [ ] **Formulaire de contact** et **newsletter** : l'e-mail arrive à
      `info@moment-lab.be`.
- [ ] Le **Studio** s'ouvre à `www.moment-lab.be/admin` et une publication
      apparaît sur le site en une minute.
- [ ] Les pages en **NL et EN** s'affichent, la **carte** « Où nous trouver »
      aussi.
- [ ] Une page qui n'existe pas affiche la page 404.

## À savoir — le Studio hébergé

Le Studio existe aussi chez Sanity : **https://moment-lab.sanity.studio**
(déployé le 27 novembre, pour éditer sans accès au site de test). Après
chaque changement de champ ou de schéma, le republier : `npx sanity deploy`,
connecté avec tiboguerydev. Le Studio à `/studio` sur le site, lui, suit
chaque déploiement Vercel.

## Après le lancement

- [ ] **Google Search Console** : ajouter le domaine (vérification par TXT chez
      Combell), envoyer `https://www.moment-lab.be/sitemap.xml`.
- [ ] **Google Analytics** : vérifier que les visites arrivent.
- [ ] **Fiche Google Business** de Moment : catégorie « Traiteur », lien vers le
      site, mêmes horaires que dans « Infos pratiques ».
- [ ] **PageSpeed Insights** sur la home, la boutique et une fiche produit.
- [ ] Remettre le TTL du DNS à 3600.
- [ ] **Transférer le dépôt GitHub** à `sofiane-moment` (si ce n'est pas fait).
- [ ] Arrêter ou supprimer le projet Vercel de test, une fois tout vérifié.
