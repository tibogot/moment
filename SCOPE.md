# Périmètre du projet — état des lieux

Ce document fait le point entre ce qui était prévu au départ, ce qui a été
construit depuis, et ce qui reste demandé mais pas encore chiffré.

Il n'est adressé à personne en particulier et ne reproche rien : le besoin a
évolué au fil des échanges, ce qui est normal. L'objet est simplement de rendre
visible un travail qui, par nature, ne se voit pas — un site bien fait a
toujours l'air d'avoir été simple à faire.

---

## 1. Ce qui était prévu

**Site vitrine, 5 à 6 pages, 1 800 € HTVA.**

Une présentation de l'activité, quelques pages de contenu, un formulaire de
contact. Pas de vente en ligne, pas de compte client, une seule langue.

À ce périmètre, le devis était cohérent : environ une semaine de travail.

---

## 2. Ce qui a été construit

### Boutique en ligne complète

- Catalogue connecté à Shopify, fiches produits, collections
- Panier, préférences de commande, passage au paiement Shopify
- Comptes clients (connexion sécurisée OAuth/PKCE)
- Commande possible sans compte, comme demandé

### Moteur de livraison sur mesure

C'est la pièce la plus lourde, et elle n'existe dans aucun outil du marché sous
cette forme.

- Recherche d'adresse sur toute la Belgique, avec autocomplétion
- Calcul de la distance réelle depuis l'atelier
- Application automatique de la grille : 4 zones, frais et minimum de commande
- Blocage du paiement tant que le minimum de la zone n'est pas atteint, avec le
  montant manquant affiché
- Bascule automatique en « sur devis » au-delà de 50 km, avec un formulaire
  pré-rempli (adresse, distance, contenu du panier)

### Calendrier de réservation

- Choix de la date de livraison, avec délai de préavis
- Dimanches fermés, plus les jours que le traiteur ferme lui-même depuis Shopify
- Vérification côté serveur : une page laissée ouverte la nuit ne peut pas
  réserver un jour fermé entre-temps
- Retrait à l'atelier en alternative, sans frais ni minimum

### Site en trois langues — français, néerlandais, anglais

- 165 pages générées, une version par langue
- URLs, balises hreflang et plan de site par langue, pour le référencement
- Dates, prix et formats adaptés à chaque langue
- Sélecteur de langue, mémorisation du choix

### Comptes professionnels

- Page de connexion à deux entrées, particulier et professionnel
- Formulaire de demande de compte pro avec vérification du numéro de TVA belge

### Le reste

- CMS (Sanity) pour les menus et les actualités
- Référencement : données structurées, page FAQ enrichie, plan de site
- Bandeau cookies conforme, pages légales belges

---

## 3. Pourquoi l'écart est si important

Une question revient légitimement : pourquoi ne pas avoir installé des
applications Shopify plutôt que de tout construire ?

**Parce qu'une application Shopify s'installe dans un thème, et que ce site n'en
a pas.**

Le moment où le design sur mesure a été retenu plutôt qu'un thème du commerce,
le site est passé en architecture *headless* : Shopify gère l'argent, le
paiement et la sécurité, mais toute la boutique visible est une application
développée séparément. C'est ce qui permet le design, les animations et la
liberté de mise en page — et c'est aussi ce qui rend les applications Shopify
inutilisables, puisqu'elles s'injectent dans un thème qui n'existe pas.

Chaque fonction a donc dû être développée. Ce n'était pas un choix de confort,
c'était une conséquence.

---

## 4. Équivalents du marché

À titre indicatif, sur une boutique Shopify classique avec un thème, les mêmes
fonctions passeraient par des abonnements mensuels :

| Fonction | Équivalent du marché |
|---|---|
| Calendrier de livraison et retrait | Application dédiée, abonnement mensuel |
| Frais de livraison selon la distance | Application, ou passage à un plan Shopify supérieur |
| Minimum de commande par zone | Application |
| Site multilingue | Supplément payant sur Webflow, licence annuelle sur WordPress |
| Autocomplétion d'adresse | Facturée à l'usage chez Google |
| Comptes entreprises, paiement sur facture | Shopify Plus uniquement |
| Factures TVA téléchargeables | Application dédiée — **celle-ci reste à prévoir** |

> Les montants exacts changent régulièrement selon les éditeurs et les plans
> Shopify. À vérifier au moment d'un chiffrage : ce tableau donne la nature des
> coûts, pas leur total.

L'important n'est pas l'économie réalisée, mais ce qu'elle révèle : ces
fonctions coûtent cher en abonnement **parce qu'elles sont coûteuses à
produire**. Elles ont été produites ici.

---

## 5. Ce qui est demandé et n'est pas encore chiffré

Ces éléments figurent dans les dernières demandes et ne sont ni construits ni
devisés :

- **Créneaux horaires** — choisir une heure, et ne voir que celles encore
  libres. Suppose une notion de capacité par créneau. *En attente des horaires
  et de la capacité du traiteur.*
- **Historique des commandes** détaillé, avec statut de livraison
- **Recommander en un clic** à partir d'une commande précédente
- **Carnet d'adresses** enregistrées (siège social, bureaux…)
- **Note de commande** (ex. « sonner à l'accueil »)
- **Paiement sur facture pour les entreprises** — fonction Shopify Plus ;
  décision de plan à prendre avant tout développement
- **Informations de facturation enregistrées** : société, TVA, contact, adresse
  de facturation distincte
- **Factures téléchargeables** — nécessite une application Shopify
- Traduction professionnelle des **pages légales** (conditions de vente,
  confidentialité, cookies, livraison) — elles engagent juridiquement et
  contiennent désormais la grille tarifaire
- Traduction des **fiches produits** dans Shopify

---

## 6. La maintenance

Ce point n'est pas une option commerciale, c'est une caractéristique de
l'architecture.

**Les versions de l'API Shopify cessent d'être supportées après environ douze
mois.** Le site fonctionne aujourd'hui sur la version `2026-01`. Sans mise à
jour, il cessera de fonctionner début 2027. Un site construit sur un thème
Shopify ne connaît jamais ce problème ; un site headless, si.

S'y ajoutent :

- **La grille tarifaire existe à deux endroits** : dans le site, qui l'annonce,
  et dans Shopify, qui la facture. Toute modification doit être répercutée des
  deux côtés, faute de quoi le client voit un prix et en paie un autre.
- **Trois langues** : chaque nouveau texte s'écrit trois fois, et les
  traductions font partie du code. Ajouter une question à la FAQ demande une
  mise en ligne.
- **Trois systèmes imbriqués** — Shopify, Sanity, l'application. Renommer une
  collection dans Shopify peut casser une page.
- **Mises à jour de sécurité** du socle technique.
- **Services tiers à surveiller** : quotas de la recherche d'adresse, envoi des
  e-mails, CMS.

---

## 7. Proposition

1. **Un complément pour le travail déjà réalisé**, correspondant à l'écart entre
   le site vitrine devisé et l'application livrée.
2. **Un devis séparé pour les fonctions restantes** de la section 5, à valider
   avant développement plutôt qu'après.
3. **Un forfait de suivi mensuel** couvrant les mises à jour d'API et de
   sécurité, la cohérence entre le site et Shopify, les petites modifications de
   contenu et les corrections. Les nouvelles fonctionnalités restent devisées à
   part.

Le point 3 est le plus important des trois. Sans lui, le site fonctionnera
parfaitement pendant quelques mois, puis se dégradera sans que personne ne
comprenne pourquoi.
