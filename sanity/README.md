# Sanity

The content model and the Studio for project `msn9ulmx`, dataset `production`.

The Studio used to live in a separate repository (`tibogot/moment-sanity`). It
does not any more, because the split had already done the damage it does: the
`menu` type sat in this folder registered nowhere, so `/menus` served
placeholders, while `siteSettings` sat in the Studio read by nothing. One repo,
one content model.

## Where things are

|                               |                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------ |
| `sanity/schemaTypes/`         | Every document and object type                                                 |
| `sanity/schemaTypes/index.ts` | What the Studio actually loads — a type missing from this array does not exist |
| `sanity/structure.ts`         | The Studio's left-hand navigation                                              |
| `sanity.config.ts`            | Studio config. Project id and dataset come from `lib/sanity/env`               |
| `sanity.cli.ts`               | For the `sanity` CLI only — exports, TypeGen                                   |
| `app/studio/[[...tool]]/`     | The route that serves it                                                       |

## Running it

`npm run dev`, then <http://localhost:3000/studio>. There is no separate Studio
command and no `sanity deploy`: it is part of this app and ships with it.

Three things about that route are load-bearing and look like tidy-ups:

- **`studio` is excluded in `proxy.ts`.** Without it the locale redirect sends
  every visit to `/fr/studio` and the Studio never mounts.
- **`Studio.tsx` is a separate `"use client"` file.** Importing `sanity.config`
  from the Server Component puts the whole `sanity` package in the RSC graph,
  where `swr` resolves to its `react-server` build and the build fails with an
  error naming files nobody here wrote.
- **`app/studio/layout.tsx` carries its own `<html>` and `<body>`.** This app has
  no `app/layout.tsx` — `app/[lang]/layout.tsx` is the root layout and only
  covers `/[lang]/*`. Without a second one the Studio renders into a fragment,
  and the console fills with "Cannot render `<noscript>` outside the main
  document" as it tries to hoist its no-JS notice into a head that is not there.

## Before it will connect

The Studio talks to `*.api.sanity.io` from the browser, so **every origin it is
served from has to be allowed** in
[sanity.io/manage](https://sanity.io/manage) → API → CORS origins, with
credentials enabled:

- `http://localhost:3000` for development
- the production domain, and the Vercel preview domain if previews are used

A missing origin does not look like a permissions problem — the Studio loads and
then simply never shows anything.

Do **not** read every WebSocket line in the console as a CORS failure. In
particular, `WebSocket is closed before the connection is established` is the
client hanging up mid-handshake, not the server refusing: React's StrictMode
mounts, unmounts and remounts every component in development, and HMR does it
again on each save. It is expected in dev and means nothing if the Studio lists
documents and saves them. A real origin problem reports the origin.

## Access

The URL is public, the content is not — without a Sanity session the route
renders a login screen. Who gets in is decided entirely by the project members
list on [sanity.io/manage](https://sanity.io/manage), not by anything in this
repo. Deploying the Studio separately would have had exactly the same model.

Invite the client as **Editor**, not Administrator: they need to write content,
not to delete the dataset or rotate the API tokens.

## The Studio is in French, the schema is not

The person editing here is francophone, so everything they read is French: the
chrome Sanity owns comes from the `frFRLocale` plugin, and every `title` and
`description` in `sanity/schemaTypes` is written in French by hand.

Every `name` stays English — `menu`, `pricePerPerson`, `siteSettings`. Those are
the data contract shared with the GROQ projections and the TypeScript types, and
nobody sees them. **Keep new fields to the same split**: French in `title` and
`description`, English in `name`.

The one place this needs care is a list of choices. `menu.format` shows French
titles against English values (`lunch`, `seated`), and what the _visitor_ reads
comes from `menuFormats` in the dictionaries — three languages, one per site
locale. Translating the Studio list without the dictionaries would have left the
Studio saying "Lunch de bureau" and the site saying "Office lunch".

## Field names are a contract

`sanity/schemaTypes/documents/menu.ts`, the `Menu` type in `lib/menus.ts`, and
the GROQ projection in `lib/sanity/queries.ts` all name the same fields.
Renaming one without the others returns `undefined` rather than an error, so
change all three together.

Now that the schema and the queries are in one repo, TypeGen can enforce this
instead of a paragraph asking nicely. That is worth doing next.

## Placeholders still in place

`/menus` falls back to `PLACEHOLDER_MENUS` in `lib/menus.ts` with a visible
draft notice whenever the query comes back empty. As soon as the Studio has one
real `menu` document, the placeholders stop being used — no deploy needed.
Delete the array once that has happened.

## The atelier address is in two places

The **postal address** — street, postcode, city — is here, in Company details,
because it is what the legal page prints and what search engines are given.

The **coordinates** are in Shopify, on the `delivery_settings` metaobject,
because every delivery zone past Brussels is a radius measured from them. See
SHOPIFY-SETUP.md.

They are not duplicates of each other — one is text, the other is arithmetic —
but they describe the same building. **Move the atelier and both need
changing**, or the site quotes distances from the old address while printing the
new one. Deriving one from the other would put a geocoding call in front of
every delivery quote, and a failed lookup would silently reprice the whole map,
which is worse than two fields.
