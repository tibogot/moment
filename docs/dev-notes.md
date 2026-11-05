# Developer notes

For whoever works on this codebase next. Not a backlog of client requests —
those are in `open-items.md` — but the things the code cannot tell you: debt
that is known and accepted, decisions already argued out, and measurements that
cost a browser session to take.

Last reviewed **5 November 2026**.

---

## Conventions worth knowing

- **TypeGen.** `npm run typegen` reads the Sanity schema and every
  `defineQuery` and writes `sanity.types.ts`; `lib/sanity/types.ts` derives the
  site's names from it. Run it after touching a schema or a query.
  `sanity/README.md` has the caveats.
- **Language checks.** To find untranslated strings, fetch the rendered HTML in
  all three languages and diff the visible text — single words, `aria-label`s
  and Shopify data all slip past a grep for sentences. The legal pages are
  trilingual since 5 November 2026 (see "Decisions already taken").
- **Delivery rules are data.** Days, windows, zones, fees and capacity are read
  from Shopify metaobjects with built-in defaults (`lib/delivery*.ts`). Field
  reference: `shopify-setup.md`.
- **Caching.** Nothing revalidates on a clock; every cached read is tagged and
  cleared by `/api/revalidate/*` webhooks, with a 24 h backstop
  (`lib/cache.ts` explains the ISR-write bill that led here).

---

## Open technical work

### Search suggestions should come from the catalogue

The chips under "Popular searches" are six hardcoded terms typed into the box
and matched against Shopify. Five of the original six found nothing — the shop
is stocked in French and the chips were in English. They are now French terms
verified against the live catalogue, identical in all three dictionaries,
because a chip in the visitor's language that returns nothing is worse than one
in the wrong language.

That is a patch. The chips are a hardcoded guess at what the shop sells, and
they go stale the moment the client adds a product line nobody remembers to add
here.

**Derive them from the collections instead.** Those are the catalogue's own
vocabulary, they already come from Shopify, they are already in the nav, and
they cannot go stale. It means changing what a chip _does_ — link to the
collection rather than fill the search box — which is a better outcome anyway:
someone clicking "Salades" wants the salads, not a text search for the word.

A decision rather than a fix, which is why it is here.

### Articles have no link between translations

Menus are done — field-level, one document, three languages side by side, with
the pricing shared. Articles are modelled the other way, and deliberately: one
document per language, selected by the `language` radio in `article.ts`. That is
the right model for long-form. Three rich-text editors stacked in one form is
unusable, and field-level i18n would force every article to exist in three
languages — a French-only piece about a Brussels event is legitimate, and the
Dutch reader would get an empty page.

So the schema is not what is missing. **The link between the three is.**

Nothing connects a French article to its Dutch counterpart, which costs two
things:

- Articles emit no `hreflang` at all (`singleLanguage: true` in
  `news/[slug]/page.tsx`). Honest — we cannot declare alternates we do not know
  — but the three versions compete separately in Google.
- Nothing in the Studio tells the client which articles are still untranslated.

The language switcher used to be a third cost, sending readers to a 404. Fixed
in `translatedPath` (`lib/routes.ts`): an article now falls back to the news
index in the language asked for. Not a redirect — the URL genuinely does not
exist, and redirecting would tell Google otherwise.

**When the client confirms they will write in three languages:**

- `@sanity/document-internationalization`. It builds on the `language` field
  that already exists, links the trio through a metadata document, and gives the
  client a _create the Dutch version_ button that duplicates with the language
  preset. That last part is the whole point — it is the ergonomics they need.
- Give articles their alternates back.
- Replace the fallback in `translatedPath` with the real slug lookup. Note it
  cannot be computed: the Dutch article has a different slug, so the page has to
  supply the address. The function is where that plugs in.

**Still to ask the client:** will every news item be written in three
languages, or will some stay French only? If "French first, we translate the
good ones", the news-index fallback in `translatedPath` is the permanent
behaviour, not a stopgap.

---

## Known debt

Things that are working, understood, and not worth fixing yet — recorded so
nobody rediscovers them as bugs.

**The checkout rules are enforced by the site, not by Shopify.** Both checkout
buttons go through `beginCheckout` (`app/actions/cart.ts`), which re-reads the
cart and the live rules — date, cut-off, window, zone, minimum — before handing
over Shopify's checkout address, and the page never holds that address itself.
What it cannot see is what happens on Shopify's pages: an address changed at
checkout, a discount code that takes the basket under the zone minimum or the
free-delivery threshold, or a checkout reopened days later from an
abandoned-cart email. Closing those needs a **Cart & Checkout Validation
Function** in a Shopify app, reading the cart attributes. Build it when the
client's own store is connected; until then, staff check each order's
attributes against the zone table.

**The delivery fee lives in two places.** The site quotes it from the
`delivery_zone` metaobject; Shopify charges it from Settings → Shipping. Both
are in the Shopify admin now, a few clicks apart, which is the most that can be
done without giving up on quoting a fee before checkout. Removing it entirely
would mean reading Shopify's own rates through `cart.deliveryGroups` — but
Shopify's zones are postcode-based and ours are radial, so we would quote the
right fee against the wrong band's minimum order. That trades a visible
divergence for a subtler one. `shopify-setup.md` says so where it matters.

**Shopify's shipping profiles are still built by hand.** Translating the radial
bands into postcode lists is documented but manual. It is automatable — compute
every Belgian postcode's distance from the atelier and bucket it — and that
script is worth writing now that the atelier's address is confirmed (21 vs 21A
still to check — see `open-items.md`).

**Menus written before the schema changed hold the old shape.** Sanity does not
rewrite documents when a schema changes, so a menu published before translation
existed carries a bare string where `{ fr, nl, en }` now goes — and rendered with
no title at all until `pick` learned to accept both. Delete that branch, and the
`Legacy<T>` type beside it, once every menu has been opened and re-saved in the
Studio. A menu with no title is the symptom it is still needed.

**`PLACEHOLDER_MENUS` is still in `lib/menus.ts`.** It stopped being used the
moment the first real menu was published; it stays as a fallback for Sanity
being unreachable. Delete it once there are several real menus.

**The atelier's address exists twice on purpose.** Postal address in Sanity
(printed), map coordinates in Shopify (arithmetic). Not duplicates of each
other, but they describe the same building — move premises and both need
changing. Documented in both places.

**The 404 needed two boundaries, and the reason is structural.** Recorded because
it will look like over-engineering to whoever reads it cold: this app's root
layout sits under a top-level dynamic segment (`app/[lang]/layout.tsx`), which
the Next docs name as one of the two cases where a global 404 cannot be composed
from a layout plus a `not-found`. A `not-found.tsx` beside that layout is
compiled as the global route and rendered outside the layout — which is why the
designed 404 in this repo had never once appeared, for any URL. So there is
`app/global-not-found.tsx` behind the `globalNotFound` flag for unmatched URLs,
and `app/[lang]/not-found.tsx` for `notFound()` raised inside a language. Do not
merge them.

---

---

## Decisions already taken

**The hero grid: full height, or locked cell proportion?** Settled on 15 August,
**not yet implemented** (about half a day).
**Option 2**, below. The earlier answer here was option 3, and it was wrong —
the reasoning is kept because the wrong version is the intuitive one and will be
re-derived by whoever reads this next.

The arithmetic, once, so nobody has to redo it. Margins are `4.9vw`, bands are
`8.6svh`, so:

- cell width = 0.902 W / N
- cell height = 0.276 H
- **ratio = 3.27 × (W/H) / N**, and 3/4 needs **N = 4.36 × (W/H)**

| Screen               | Aspect | Columns for 3/4 |
| -------------------- | ------ | --------------- |
| iPad landscape       | 1.33   | 6               |
| MacBook, 1920×1200   | 1.60   | **7** — today   |
| 1920×1080, 2560×1440 | 1.78   | 8               |
| Ultrawide 2560×1080  | 2.37   | 10              |

**The variable is the aspect ratio, not the width.** A 1920×1200 and a 1920×1080
are the same width and want different column counts, so any breakpoint here has
to be `min-aspect-ratio`. That alone kills the "7 columns to 1600px, 9 beyond"
version this section used to recommend.

1. Keep `h-svh`, accept that cells go landscape on wide screens. Today
2. **Lock the cell ratio and let the leftover height fall into the bottom band.
   The chosen answer.** Three rows of 3/4 cells at 7 columns come to `0.5155 W`,
   which equals today's ruled area exactly at aspect 1.607 — the design's native
   ratio. Near it the leftover is tiny: ~0 at 1366×768 and 1920×1080, 81px at
   1440×900, 109px at 1920×1200. **The columns never change, so the vertical
   rules stay aligned with every section below**, which was the objection to
   option 3. Horizontal rules are hero-local; nothing else shares them. The nav
   band stays fixed and all the slack goes to the bottom. Ultrawides (≥2.2) still
   overflow and need a cap — an edge case, not the rule
3. Vary the column count with the viewport. Rejected: `--grid-columns` is global,
   and ~70 desktop line references across **37 files** are baked to "margin + 7 +
   margin = 9 tracks". A day of work, touching every page, to fix one section

**Two dead ends, so they are not re-litigated.** Absorbing the slack in the bands
is impossible — `--grid-band` _is_ the navbar height (`min-h-(--grid-band)`, also
used by the cart panel and the mobile menu), so it would make the bar breathe
with the viewport. Absorbing it in the margins works arithmetically (177px
instead of 94px at 1920×1080) but `--grid-margin` is global and feeds
`GridLines`; a hero-local margin desyncs the hero's vertical rules from every
section under it.

**And the cheapest check first:** ask which screen the client is looking at.
Seven columns holds 3/4 within ±7% across aspects 1.51–1.71, which is the whole
MacBook family. If the request came from a screenshot taken on an external 16:9
monitor while they work on a laptop, they already see 3/4 every day and there is
nothing to do.

**Is the whole grid too much?** Asked and answered on 15 August: no. The
infrastructure is **206 lines** — `GridLines.tsx` 138, `lib/grid.ts` 42,
`GridSection.tsx` 26 — serving 23 sections, 8 of them `ruled` with holes. The
`col-start-2 col-end-5` references are not a cost of _this_ grid; any layout has
to place its blocks. What is worth knowing is that on 22 of the 23 sections
nobody can verify a cell proportion at all — the brand asset is the drawn rule,
not the rectangle. The 3/4 is only legible in the hero, where the whole 7 × 3
field is visible at once. Treat it as a property of the hero, not an invariant of
the system.

**The legal pages are trilingual but unreviewed.** Rewritten on 5 November
2026 in FR/NL/EN: register and host on the legal notice, a full art. 13 GDPR
privacy policy, an exact cookie list, and terms with withdrawal by product type,
legal guarantee, mediation, governing law and the model withdrawal form. Still
to confirm: the register division (French-speaking assumed, `lib/legal.ts`),
the retention periods, the processors list (Resend's legal entity), that every
newsletter email will carry an unsubscribe link, and a lawyer's read. The
cookie banner asks only about categories in use — analytics once
`NEXT_PUBLIC_GA_MEASUREMENT_ID` is set, nothing otherwise (no banner at all) —
see `ENABLED_CONSENT_CATEGORIES` in `lib/consent/categories.ts`.

**Delivery rules stay in Shopify, not Sanity.** Asked and answered: settings
live where their twin lives. The zone fees must agree with Shopify's shipping
profiles, so moving them to Sanity would put the two copies in different
buildings again. The calendar has no twin and could move, but splitting the
delivery domain across two admins costs more than the nicer form is worth.

---

---

## Reference: design measurements

Both of the client's requests shipped. Kept because they cost a browser session
and they contradict the obvious reading.

**Line weight is 2px, and 1.5 is not available.** Chrome rounds `border-width`
to whole CSS pixels — measured at 1x _and_ 2x — while the GridLines spans use
`width`, which is not rounded. At 1.5px the overlay renders at 1.5 and all 117
borders at 1, and the two meet at every corner of the grid. `--grid-line` in
`globals.css` is the single number for both mechanisms; if 2px reads heavy, the
lever is contrast, not width.

| Cell proportions       | 1440×900                | 1920×951           | 2560×951           |
| ---------------------- | ----------------------- | ------------------ | ------------------ |
| Hero                   | 183×249 → **0.74**      | 245×262 → **0.94** | 328×262 → **1.25** |
| Events / Coffee panels | **0.75** at every width |                    |                    |
| Split sections         | **0.75** at every width |                    |                    |

The panels were already right and never drifted. The split sections were square
by declaration and are now 3/4. The hero is the one still open: it is 3/4 on a
1440 laptop, which is where the design was calibrated, and that is why it looks
correct to us and square to the client. "Decisions already taken" has the arithmetic behind that drift
and the decision that follows from it.
