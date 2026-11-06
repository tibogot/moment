# Moment — site e-commerce

Site de MOMENT LAB SRL, traiteur à Forest (Bruxelles). Design : Rond Carré
Studio. Boutique, livraison sur réservation, comptes clients, en français,
néerlandais et anglais.

## Stack

- **Next.js 16** (App Router, `app/[lang]/…`) — lisez `AGENTS.md` : cette
  version diffère de ce que vous connaissez, la doc est dans
  `node_modules/next/dist/docs/`.
- **Shopify** — catalogue, panier et checkout hébergé via la Storefront API ;
  comptes clients via la Customer Account API ; Admin API uniquement pour
  compter les commandes par créneau.
- **Sanity** — menus traiteur, actualités, images d'accueil. Studio intégré à
  `/studio`.
- **Tailwind CSS 4**, GSAP, Lenis.
- Hébergé sur **Vercel**.

## Démarrer

```bash
npm install
cp .env.example .env.local   # puis remplir — chaque variable y est expliquée
npm run dev
```

| Script | |
|---|---|
| `npm run dev` | serveur de développement |
| `npm run build` | build de production |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, sans build |
| `npm run check` | lint + typecheck, à lancer avant chaque commit |
| `npm run typegen` | régénère `sanity.types.ts` après un changement de schéma ou de requête |

## Où se trouve quoi

| | |
|---|---|
| `proxy.ts` | ajoute la langue aux URLs (`/menus` → `/fr/menus`) et laisse passer `/studio` et `/api` tels quels |
| `app/[lang]/` | pages, une par route, dans les trois langues |
| `app/actions/` | Server Actions (panier, contact, newsletter) |
| `app/api/` | panier, adresse, capacité des créneaux, auth, webhooks de revalidation |
| `lib/delivery*.ts`, `lib/checkout.ts` | règles de livraison : jours, créneaux, zones, capacité, blocage du paiement |
| `lib/shopify/` | clients Storefront / Admin / Customer Account, lecture des métaobjets |
| `lib/i18n/dictionaries/` | textes de l'interface (`fr.json` est la référence typée) |
| `lib/site.ts`, `lib/legal.ts` | coordonnées et identité légale de l'entreprise |
| `components/` | composants React ; ceux qui portent `"use client"` tournent dans le navigateur |
| `sanity/` | schémas et structure du Studio — voir `sanity/README.md` |

**Dépendances à ne pas retirer :** `styled-components` n'est importé nulle
part dans le code, mais le Studio Sanity en a besoin. `npx knip` (code et
dépendances inutilisés) est configuré dans `knip.json` pour en tenir compte.

## Documentation

| | Pour qui (langue) |
|---|---|
| [`docs/open-items.md`](docs/open-items.md) | ce qui attend une réponse ou reste à construire (FR) |
| [`docs/shopify-setup.md`](docs/shopify-setup.md) | configuration de l'admin Shopify : métaobjets, webhooks, tarifs d'expédition, variables d'environnement (EN, pour le développeur) |
| [`docs/client-guide.md`](docs/client-guide.md) | l'équipe de Moment : ce qu'elle modifie elle-même (FR) |
| [`docs/dev-notes.md`](docs/dev-notes.md) | dette connue, décisions prises, mesures de design (EN, pour le développeur) |
| [`sanity/README.md`](sanity/README.md) | Studio, TypeGen |

## Mise en ligne du domaine

Le site est volontairement non indexé tant qu'il tourne sur une adresse
`.vercel.app` ou localhost (`Disallow: /` + `noindex`). Le jour où
`moment-lab.be` est branché :

1. Ajouter le domaine dans Vercel
2. `NEXT_PUBLIC_SITE_URL=https://www.moment-lab.be` (ou sans `www`), puis
   redéployer — c'est ce qui ouvre le site à Google
3. Ajouter le domaine aux origines CORS de Sanity, sinon le Studio ne se
   connecte plus
4. Ensuite seulement : Search Console, fiche Google Business, Google Analytics

Inviter le client dans le projet Sanity comme **Editor**, pas Administrator.
