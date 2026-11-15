<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Three languages, always

The site is in French, Dutch and English. Never type visible text into a component — labels, buttons, `aria-label`s, errors included. Add it under the same key to `lib/i18n/dictionaries/fr.json`, `nl.json` and `en.json` and read it from the dictionary. A missing Dutch or English key does not fail the build: it silently shows French. Run `npm run i18n` (part of `npm run check`) before you finish. More in `docs/dev-notes.md` → Conventions.
