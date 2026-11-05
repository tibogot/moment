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
| **Adresse de l'atelier** : rue des Glands **21** ou **21A** ? Les distances partent de là | Moment | question posée le 5 nov. |

Après le branchement du domaine, dans cet ordre : `NEXT_PUBLIC_SITE_URL`
(ouvre le site à Google), origines CORS Sanity, Search Console, fiche Google
Business (créée par Moment), Google Analytics.

---

## 2. Questions envoyées le 5 novembre

1. **4 pièces minimum** : minimum (5 accepté) ou multiples de 4 ? Épicerie incluse ?
2. **Minimum en retrait** : 100 € pour le retrait standard et 50 € pour le retrait la veille ?
3. **Panier mixte** (produits « veille » + traiteur) : tout passe en 48 h ?
4. **Créneaux de retrait** (11 h 30 → 15 h) : aussi pour le retrait standard ? Premier créneau 11 h ou 11 h 30 ?
5. **Dimanche** : livraisons **et** retraits ?
6. **Adresse** 21 ou 21A (voir §1).
7. **Collaborations** : fusion avec la page Pro, ou page séparée ?
8. **Où nous trouver** : ils peuvent saisir eux-mêmes leurs partenaires dans le Studio (rubrique « Partenaires »), plus besoin de nous envoyer la liste.
9. **Pages légales** : accord écrit (voir §1).

---

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
- [ ] **Livraison offerte par zone** : 250 / 300 / 400 / 450 € (aujourd'hui un seul seuil, 300 €)
- [ ] **Distance routière** au lieu de la ligne droite
- [ ] **Minimum 4 pièces par produit** — attend la question 1
- [ ] **Retrait la veille** : produits concernés (cookies, banana bread, cake citron-pavot, carrot cake, healthy snacks, épicerie, jus), commande avant 15 h, 8 créneaux de 30 min, 1 commande chacun, minimum 50 € — attend les questions 2 à 4
- [ ] **Page Collaborations** avec formulaire — attend la question 7
- [x] **Partenaires dans le Studio** (rubrique « Partenaires » : nom, type, adresse, lien, visible ; le point est placé automatiquement depuis l'adresse)
- [ ] **Page et carte « Où nous trouver »** — les partenaires peuvent déjà être saisis ; reste la page, la carte et l'onglet
- [ ] **Webhook Sanity** : ajouter `"partner"` au filtre du webhook de revalidation dans sanity.io/manage (`_type in [...]`), sinon un partenaire ajouté met jusqu'à 24 h à apparaître

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
- **Pages légales** : réécrites en FR/NL/EN le 5 novembre 2026. À confirmer :
  la division du tribunal de l'entreprise (francophone supposée, `lib/legal.ts`),
  les durées de conservation, la liste des sous-traitants, et une relecture par
  un juriste avant la mise en ligne.
