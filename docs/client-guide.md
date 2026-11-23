# Guide du site Moment

Pour l'équipe de Moment : ce que vous modifiez vous-mêmes, où, et les quelques
pièges à connaître. Mise à jour : 5 novembre 2026.

---

## 1. Ce que vous modifiez vous-mêmes

### Dans le Studio — `/studio` sur le site, en français

Aucun lien n'y mène depuis le site : ouvrez `moment-lab.be/studio` et
enregistrez-le dans vos favoris.

| Contenu | Où |
|---|---|
| Menus traiteur | Menus traiteur |
| Actualités | Actualités |
| Partenaires (carte « Où nous trouver ») | Partenaires |
| Bandeau en haut du site (fermeture, nouveauté…) | Bandeau d'annonce |
| Photo d'ouverture et les deux panneaux de la page d'accueil | Page d'accueil |
| Étapes de commande et questions fréquentes (page « Comment ça marche ? ») | Comment ça marche ? |

**Actualités** : ne mettez que le titre dans le champ titre, sans « \| Moment » —
le site ajoute le nom tout seul. L'onglet *Référencement* → « Titre pour Google »
permet un titre différent dans Google uniquement ; laissé vide, le titre normal
est utilisé.

**Bandeau d'annonce** : écrivez une phrase courte (« Fermé du 24 décembre au
2 janvier »), ajoutez si vous voulez un lien (texte + adresse, par exemple
`/menus`), allumez « Afficher le bandeau » et publiez. Il apparaît en haut de
toutes les pages en quelques secondes. Pour le retirer, éteignez l'interrupteur
et publiez : le texte reste enregistré pour la prochaine fois.

**Partenaires** : Nouveau → nom, type, adresse, lien éventuel. Le site place
le point sur la carte tout seul à partir de l'adresse. Pour masquer un
partenaire sans le supprimer, décochez « Afficher sur la carte ». Si un point
tombe au mauvais endroit, remplissez « Position sur la carte » (clic droit sur
l'établissement dans Google Maps, puis copier les coordonnées).

**Comment ça marche ?** : la première fois que vous l'ouvrez, le formulaire
contient déjà les textes affichés sur le site — cliquez sur **Publier** pour
qu'ils deviennent les vôtres. Ensuite : modifiez une étape ou une question,
ajoutez-en (« Ajouter un élément »), glissez pour changer l'ordre, ou cochez
« Masquer sur le site » pour retirer une question sans la supprimer. Le
français est obligatoire ; si le néerlandais ou l'anglais manque, le site
affiche le français à la place. **N'écrivez ni prix, ni minimum, ni délai, ni
horaire dans ces textes** : la page les affiche elle-même dans « La livraison en
bref », à partir de vos réglages Shopify (ci-dessous), et ils sont ainsi
toujours justes.

### Dans l'admin Shopify

- **Produits, prix, stock, commandes.** Les traductions des fiches produits se
  font dans l'app gratuite *Translate & Adapt*.
- **Un produit n'apparaît sur le site que s'il est « Actif » et publié sur le
  canal du site** (fiche produit → *Publishing* / *Canaux de vente* → la case
  du canal Headless, « Site Moment »). Un produit en brouillon, ou publié sur
  la seule « Boutique en ligne » Shopify, existe dans l'admin mais pas sur le
  site.
- **Allergènes, ingrédients, traces, régime, portion, conservation, conseils
  de service** : en bas de chaque fiche produit, section *Métachamps produit*.
  Ils s'affichent sur la fiche du site ; un champ vide n'apparaît pas.
- **Réglages de livraison** — Contenu → Métaobjets. Les entrées existent déjà,
  remplies avec vos règles du 3 novembre 2026 : vous les **modifiez**, vous n'en
  créez que pour une fermeture ou un nouveau créneau.

| Réglage | Métaobjet |
|---|---|
| Préavis (48 h), heure limite (16 h), jours fermés, horaires et minimum de retrait, minimum de pièces par produit (4) | Livraison — réglages |
| Jours ou périodes de fermeture (une entrée pour trois semaines, pas vingt-et-une) | Livraison — fermetures |
| Zones : frais, minimum de commande, livraison offerte à partir de…, distance | Livraison — zones |
| Créneaux de livraison et leur capacité (2 commandes par défaut, `0` pour fermer un créneau) | Livraison — créneaux |
| Heures de retrait et leur capacité (1 par défaut) | Retrait — horaires |

Un réglage modifié apparaît sur le site en quelques secondes. Pour une
fermeture, ajoutez-la quand même dès que vous la connaissez : le calendrier ne
la propose plus aux clients à partir de ce moment-là.

- **Le dimanche** : ouvert par défaut, comme vous l'avez indiqué le 3 novembre.
  Si vous arrêtez de travailler le dimanche, ajoutez `sunday` dans le champ
  `closed_weekdays` de `delivery_settings` (les jours s'écrivent en anglais :
  `monday` … `sunday`). Le calendrier, la page « Comment ça marche ? » et les
  vérifications au paiement suivent tout de suite. Retirez-le pour rouvrir.

- **Commande prise par téléphone** : pour qu'elle occupe un créneau, ajoutez-lui
  deux tags, par exemple `livraison-2026-11-07` et `creneau-0900`. Annuler la
  commande ou retirer les tags libère le créneau.
- **Produits « retrait la veille »** : ajoutez le tag `retrait-veille` à un
  produit (fiche produit → Tags). Il peut alors être commandé jusqu'à 15 h la
  veille pour un retrait à l'atelier le lendemain (minimum 50 €). Si le panier
  contient aussi un produit sans ce tag, la règle habituelle s'applique (48 h,
  minimum 100 €). Retirez le tag pour sortir un produit de la règle.
- **Horaires de retrait** : 11:30 à 15:00, une commande par horaire (métaobjet
  `pickup_slot` pour les changer). Pour une commande de retrait prise par
  téléphone, ajoutez les tags `retrait-2026-11-07` et `creneau-1130`.
- **Comptes professionnels** : un client devient « pro » quand vous lui ajoutez
  le tag `pro` dans Shopify.

---

## 2. Le piège : les frais de livraison sont à deux endroits

Le site **affiche** les frais depuis le métaobjet « Livraison — zones ». Shopify
les **encaisse** depuis Paramètres → Expédition et livraison → **Livraison
locale** → Atelier Forest (quatre zones par rayon : 0–10, 10–25, 25–50 et
50–70 km, avec leur prix, leur minimum et la gratuité au-delà d'un montant). Si
vous changez un frais, un minimum, une distance ou le seuil de livraison
offerte, **changez-le aux deux endroits, dans la même séance**. Sinon le client
voit 20 € sur le site et paie 35 € au paiement.

Le retrait à l'atelier est activé dans Paramètres → Expédition et livraison →
**Retrait en magasin**. Il n'y a volontairement **aucun tarif d'expédition
classique** (le marché « Belgique » est sur « Not shipping ») : n'en ajoutez
pas, le client pourrait sinon choisir un envoi qui ne respecte pas vos zones.

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
