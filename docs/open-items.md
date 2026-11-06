# Ce qui reste ouvert

La seule liste à jour de ce qui attend une réponse ou une action. Elle remplace
`CLIENT-QUESTIONS.md`, `SEO-CLIENT-CHECKLIST.md`, `AFTER-LAUNCH.md` et `SCOPE.md`
(supprimés le 5 novembre 2026 ; ils restent dans l'historique git).

Mise à jour : **5 novembre 2026**.

Rappel du cadre : Rond Carré Studio (Bruxelles) commande le site pour son
client Moment (MOMENT LAB SRL). Pas de contrat de maintenance — on construit ce
qui est demandé, rien de plus.

---

## 1. Avant la mise en ligne

| | Qui | Statut |
|---|---|---|
| **Domaine `moment-lab.be`** : accès DNS, et choix `www.moment-lab.be` ou `moment-lab.be` | Moment | en attente |
| **Pages légales** : accord écrit sur les versions rédigées | Moment | promis le 3 nov., pas encore reçu |
| **Brancher leur boutique Shopify** (aujourd'hui : boutique d'exemple) + une commande test | nous, avec leurs accès | à faire |
| **App Admin + webhooks** sur leur boutique, pour les créneaux pleins — voir `shopify-setup.md` | nous | à faire avec la boutique |
| **Tarifs d'expédition Shopify** alignés sur la grille du 3 nov. (20 € / 35 €, nouveaux minimums) | nous ou Moment | à faire avec la boutique |
| **Hébergement et comptes au nom du client** : le site tourne sur le compte Vercel du développeur. Sans maintenance, Vercel, Sanity, Geoapify et Resend doivent passer sur des comptes au nom de Moment ou de Rond Carré | Rond Carré / Moment | à décider |

Après le branchement du domaine, dans cet ordre : `NEXT_PUBLIC_SITE_URL`
(ouvre le site à Google), origines CORS Sanity, Search Console, fiche Google
Business (créée par Moment), Google Analytics.

---

## 2. Décisions prises sans leur poser la question (6 novembre)

Leur mail du 3 novembre y répondait déjà, ou la règle est la seule logique.
Rien n'est demandé au client là-dessus.

- **4 pièces** : un *minimum* de 4 pièces identiques, pour **tous** les produits
  (« chaque produit doit être commandé en minimum 4 pièces »).
- **Minimum en retrait** : 100 € pour un retrait classique (« dans tous les cas
  … livraison ou retrait »), 50 € pour le retrait la veille (règle spécifique).
  Les 100 € sont en place (`pickup_minimum_order`).
- **Panier mixte** (produits « veille » + traiteur) : la règle la plus stricte
  s'applique à tout le panier (48 h, minimum standard).
- **Créneaux de retrait** : les 8 créneaux de 30 min (11 h 30 → 15 h, une
  commande chacun) valent pour **tous** les retraits (« 8 commandes de retrait
  MAX/jour »). Fenêtre de retrait passée à 11 h–15 h.
- **Dimanche** : ouvert pour la livraison et le retrait.
- **Adresse** : **21A** rue des Glands, confirmée par la BCE (unité
  d'établissement 2.388.047.057). Le **siège social** est Humbeekstraat 17,
  1860 Meise : corrigé sur les mentions légales et la politique de
  confidentialité le 6 novembre.

- **Distance** : on garde la mesure **à vol d'oiseau**, avec les limites
  actuelles (10 / 25 / 50 / 70 km). « Distance routière » dans leur mail se lit
  comme une façon de parler, pas une exigence : c'est aussi la règle par défaut
  de Shopify, la route n'existant qu'avec des apps payantes et une clé Google
  Maps. Les conditions de livraison l'annoncent déjà. Moment peut ajuster les
  limites eux-mêmes dans Shopify (`delivery_zone`). Rien à leur demander.

**Envoyé au client (6 novembre)** : les accès aux comptes uniquement. **Pour la
fin** : l'accord écrit sur les pages légales.

## 3. Demandes du 3 novembre, à construire

Dans le périmètre convenu. Les cases cochées sont faites.

- [x] MOMENT LAB SRL sur les mentions légales
- [x] Instagram et Facebook `@moment.brussels`
- [x] Ouvert le dimanche
- [x] Nouveaux frais et minimums par zone
- [x] Créneaux de livraison qui se ferment à 2 commandes (actif dès que l'app Admin est branchée)
- [x] Historique des commandes + recommander en un clic
- [x] **Google Analytics** `G-43F991WPBG` côté site : consentement RGPD, fréquentation, sources, conversions (produit vu, panier, paiement, demande de devis)
- [ ] **Google Analytics — mise en route** : variable en production, pixel d'achat dans Shopify, réglages GA4 — voir `shopify-setup.md` § Google Analytics. Demande leur boutique branchée et une commande test
- [x] **Livraison offerte par zone** : 250 / 300 / 400 / 450 €, réglable par zone dans Shopify (`delivery_zone`). Reste à reporter dans les tarifs d'expédition de leur boutique.
- [x] ~~Distance routière~~ — non retenue, zones à vol d'oiseau conservées (voir §2)
- [ ] **Minimum 4 pièces par produit** — attend la question 1
- [ ] **Retrait la veille** : produits concernés (cookies, banana bread, cake citron-pavot, carrot cake, healthy snacks, épicerie, jus), commande avant 15 h, 8 créneaux de 30 min, 1 commande chacun, minimum 50 € — attend les questions 2 à 4
- [x] **Page Collaborations** (`/collaborations`, menu « À propos ») : leur texte, formulaire dédié (nouveau partenariat / approvisionnement / réapprovisionnement, nom et adresse de l'établissement, TVA facultative), distincte de la page Pro
- [x] **Partenaires dans le Studio** (rubrique « Partenaires » : nom, type, adresse, lien, visible ; le point est placé automatiquement depuis l'adresse)
- [x] **Page « Où nous trouver »** (`/find-us`, dans le menu « À propos ») : carte, atelier, liste des partenaires par commune, lien vers le contact
- [ ] **Clé Geoapify pour la carte** (`GEOAPIFY_MAP_KEY`, limitée au domaine) en production — sans elle, la page montre la liste sans carte
- [x] **Webhook Sanity** : `"partner"` ajouté au filtre de revalidation (5 nov.)

---

## 4. Plus ancien, toujours ouvert

- **Prix professionnels** : un seul prix pour tous, un tarif pro, ou des
  conditions par client ? (Le B2B natif de Shopify gère jusqu'à 3 catalogues
  sur leur plan.) Qui valide une demande de compte pro, et en combien de temps ?
- **Factures TVA** : page de commande Shopify (gratuit, pas une vraie facture),
  ou une app de facturation (~20–50 €/mois, à leur charge).
- **Plusieurs adresses de livraison par société** : la FAQ l'annonce, ce n'est
  **pas construit**. Retirer la phrase ou la construire.
- **Réalisations** : le Studio permet de les saisir (schéma `pastEvent`), mais
  **aucune page ne les affiche** (le code `lib/events.ts` existe, pas branché à
  `/events`). Les afficher, ou retirer l'entrée du Studio.
- **Actualités** : écrites dans les trois langues, ou en français d'abord ?
- **Relecture** des textes français et néerlandais du site par Moment.
- **Crédit Rond Carré Studio** (au moment du SEO, après le domaine) : « Design :
  Rond Carré Studio » en bas de page et/ou dans les mentions légales, avec lien,
  et Rond Carré déclaré comme `designer` dans les données structurées. **À faire
  valider par Moment.** En retour : étude de cas « Moment » sur le nouveau site
  de Rond Carré, et un post sur leur fiche Google, avec lien vers moment-lab.be.
  Pas sur la carte « Où nous trouver », qui ne liste que les points de vente.
- **Pages légales** : réécrites en FR/NL/EN le 5 novembre 2026. À confirmer :
  la division du tribunal de l'entreprise (francophone supposée, `lib/legal.ts`),
  les durées de conservation, la liste des sous-traitants, et une relecture par
  un juriste avant la mise en ligne.
