# Sanity schemas

Schema definitions for the Sanity project this site reads from
(`msn9ulmx`, dataset `production`).

**There is no Studio in this repository.** These files are the source of truth
for the content model, but they have to be registered in whichever Studio the
client edits in — a separate repo, or a `/studio` route added here later.

## Registering the menu type

In the Studio's `sanity.config.ts`:

```ts
import { menu } from "./path/to/sanity/schemaTypes/menu";

export default defineConfig({
  // …
  schema: { types: [/* existing types */, menu] },
});
```

Then create menu documents. The site picks them up within 60 seconds
(`sanityFetchOptions` revalidates on that interval).

## Until then

`/menus` renders `PLACEHOLDER_MENUS` from `lib/menus.ts` with a visible draft
notice. As soon as the Studio has one real `menu` document, the placeholders
stop being used — no deploy needed. Delete the array once that has happened.

## Field names are a contract

`sanity/schemaTypes/menu.ts`, the `Menu` type in `lib/menus.ts`, and the GROQ
projection in `lib/sanity/queries.ts` all name the same fields. Renaming one
without the others returns `undefined` rather than an error, so change all three
together.
