# Guide du site Moment

Pour l'équipe de Moment : ce que vous modifiez vous-mêmes, où, et les quelques
pièges à connaître. Mise à jour : 5 novembre 2026.

---

## 1. Ce que vous modifiez vous-mêmes

### Dans le Studio — `/studio` sur le site, en français

| Contenu | Où |
|---|---|
| Menus traiteur | Menus traiteur |
| Actualités | Actualités |
| Partenaires (carte « Où nous trouver ») | Partenaires |
| Photo d'ouverture et les deux panneaux de la page d'accueil | Page d'accueil |

**Actualités** : ne mettez que le titre dans le champ titre, sans « \| Moment » —
le site ajoute le nom tout seul. L'onglet *Référencement* → « Titre pour Google »
permet un titre différent dans Google uniquement ; laissé vide, le titre normal
est utilisé.

**Partenaires** : Nouveau → nom, type, adresse, lien éventuel. Le site place
le point sur la carte tout seul à partir de l'adresse. Pour masquer un
partenaire sans le supprimer, décochez « Afficher sur la carte ». Si un point
tombe au mauvais endroit, remplissez « Position sur la carte » (clic droit sur
l'établissement dans Google Maps, puis copier les coordonnées).

### Dans l'admin Shopify

- **Produits, prix, stock, commandes.** Les traductions des fiches produits se
  font dans l'app gratuite *Translate & Adapt*.
- **Réglages de livraison** — Contenu → Métaobjets :

| Réglage | Métaobjet |
|---|---|
| Préavis (48 h), heure limite (16 h), jours fermés, horaires et minimum de retrait | `delivery_settings` |
| Jours ou périodes de fermeture (une entrée pour trois semaines, pas vingt-et-une) | `delivery_closure` |
| Zones : frais, minimum de commande, livraison offerte à partir de…, distance | `delivery_zone` |
| Créneaux de livraison et leur capacité (2 commandes par défaut, `0` pour fermer un créneau) | `delivery_slot` |

Sans entrée, le site applique vos règles du 3 novembre 2026. Vous n'ajoutez une
entrée que pour **changer** quelque chose.

- **Commande prise par téléphone** : pour qu'elle occupe un créneau, ajoutez-lui
  deux tags, par exemple `livraison-2026-11-07` et `creneau-0900`. Annuler la
  commande ou retirer les tags libère le créneau.
- **Comptes professionnels** : un client devient « pro » quand vous lui ajoutez
  le tag `pro` dans Shopify.

---

## 2. Le piège : les frais de livraison sont à deux endroits

Le site **affiche** les frais depuis le métaobjet `delivery_zone`. Shopify les
**encaisse** depuis Paramètres → Expédition et livraison. Si vous changez un
frais, un minimum ou le seuil de livraison offerte, **changez-le aux deux
endroits, dans la même séance**. Sinon le client voit 20 € sur le site et paie
35 € au paiement.

---

## 3. Ce qui demande un développeur

- Les textes des pages (accueil, à propos, services…), dans les trois langues
- Les coordonnées de l'entreprise (adresse, téléphone, e-mail, TVA, horaires)
- Les pages légales
- La mise en page, le design, toute nouvelle fonction

---

## 4. Pour un bon référencement

- **Une vraie description par produit** (quelques phrases) : les premiers mots
  apparaissent dans Google.
- **Au moins une bonne photo par produit** : c'est aussi l'aperçu partagé sur
  WhatsApp ou Instagram.
- **Ingrédients, allergènes, conservation** : les champs existent sur les
  produits. C'est attendu pour de l'alimentaire, et peu de concurrents les
  remplissent.
- **Fiche Google Business** : à créer de votre côté une fois le domaine
  branché. Pour les recherches « traiteur près de moi », c'est elle qui
  apparaît, pas le site.

---

## 5. Ce qui est à votre charge

| | Coût indicatif |
|---|---|
| Domaine `moment-lab.be` | ~15 €/an |
| Hébergement du site (Vercel) | gratuit à ~20 €/mois selon le trafic |
| Abonnement Shopify | votre plan actuel |
| Sanity (le Studio) | offre gratuite probablement suffisante |
| Geoapify (recherche d'adresse) | gratuit jusqu'à 3 000 recherches/jour |
| App de factures TVA, si vous en voulez une | ~20–50 €/mois |

Le site est livré sans contrat de maintenance. Les mises à jour, les
changements de Shopify et les nouvelles demandes se font sur devis, au besoin.
