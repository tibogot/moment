# Where the work stands

A working document, for whoever picks this up next — most likely you, after the
client meeting, having forgotten half of it.

It is not `SCOPE.md`, which argues the commercial case, and not
`CLIENT-QUESTIONS.md`, which asks the client for things. This one says what is
built, what is stuck and on precisely what, and what can be worked on today
without waiting for anybody.

Last reviewed: **11 August 2026**, at commit `bd7ebff`.

---

## 1. Blocked on the client

Nothing in this section can be finished by writing code. Each line names the one
thing that unblocks it.

| Blocked | Needs |
|---|---|
| **Delivery time slots** | Delivery hours per weekday, and collection hours at the atelier. Marked BLOCKING since the first version of `CLIENT-QUESTIONS.md` |
| **Capacity per day / per slot** | Two numbers, not one: what the kitchen can produce in a day, and what the van can drop in a morning. See §2 of `CLIENT-QUESTIONS.md` |
| **Correct zone pricing** | The atelier's real street address. Distances are currently measured from the centroid of 1190 Forest, so anyone near a band edge is quoted the wrong fee |
| **Legal launch** | BCE number, VAT number, legal form. Belgian law requires them on a commercial site; the legal page prints `[to be completed]` until they arrive |
| **Search visibility** | `moment.be` registered. The site is deliberately `noindex` until it exists — see §5 |
| **How big the B2B work is** | How many price levels? Shopify made native B2B free on Basic/Grow/Advanced on 2 April 2026 — company profiles, net terms, saved cards and **up to 3 catalogues**. Only per-company negotiated pricing still needs Plus |
| **VAT invoices** | Which of the three options in `CLIENT-QUESTIONS.md` §4 |
| **Legal page copy** | The lawyer's versions, or written acceptance of the drafts |

**The good news since the last review:** most of the *data* the client used to
have to send us is now something they type themselves — company details, VAT,
social accounts, delivery rules, zone fees. What is left above is decisions and
facts about how the kitchen works, which is the part we could never have
guessed. `CLIENT-QUESTIONS.md` §7 lists the screens.

**Capacity is not a small job.** Counting how many orders already exist for a
given date means reading them back through Shopify's Admin API — a different and
larger piece of work than the metaobject settings. Quote it separately.

---

## 2. Free to do now

Nothing here waits on anyone. Roughly in the order I would take them.

### 1. Articles have no link between translations

Menus are done — field-level, one document, three languages side by side, with
the pricing shared. Articles still are not, and they need something different:
one document per language is right for long-form, but nothing connects a French
article to its Dutch counterpart. Write the same piece three times today and
Google sees three unrelated pages.

Until a translation reference exists, articles emit no `hreflang` at all
(`singleLanguage` in `pageMetadata`), which is honest but leaves the three
versions competing separately.

**Two things to do when the client confirms they will write in three languages:**

- A translation group on `article` — a shared id, or Sanity's document
  internationalization plugin — so the three know about each other.
- Give articles their alternates back once they do.

### 2. Search suggestions should come from the catalogue

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
they cannot go stale. It means changing what a chip *does* — link to the
collection rather than fill the search box — which is a better outcome anyway:
someone clicking "Salades" wants the salads, not a text search for the word.

A decision rather than a fix, which is why it is here.

### 3. The hero grid

The one design request still open, and it is a trade-off rather than a value —
see §4. Worth doing while the measurements below are fresh.

### 4. TypeGen

Schema and queries are in one repo now, so it can finally enforce the schema ↔
GROQ ↔ TypeScript contract that `sanity/README.md` describes in prose. Invisible
to the client; it is what stops the next silent `undefined`.

### Autonomy, whenever

All of these cost nothing in translation, which is what makes them cheap:

- **The six remaining home page photographs.** The `homePage` schema takes them
  one at a time and each falls back independently.
- **The About page photographs**, same shape.
- **The team** — names, photos, roles. Names do not translate and a role is two
  words.
- **The Presentation tool**, where the client edits by clicking the site itself.
  The biggest autonomy lever left, and the one to quote rather than absorb.

### Design measurements, for reference

Both of the client's requests shipped. Kept because they cost a browser session
and they contradict the obvious reading.

**Line weight is 2px, and 1.5 is not available.** Chrome rounds `border-width`
to whole CSS pixels — measured at 1x *and* 2x — while the GridLines spans use
`width`, which is not rounded. At 1.5px the overlay renders at 1.5 and all 117
borders at 1, and the two meet at every corner of the grid. `--grid-line` in
`globals.css` is the single number for both mechanisms; if 2px reads heavy, the
lever is contrast, not width.

| Cell proportions | 1440×900 | 1920×951 | 2560×951 |
|---|---|---|---|
| Hero | 183×249 → **0.74** | 245×262 → **0.94** | 328×262 → **1.25** |
| Events / Coffee panels | **0.75** at every width |||
| Split sections | **0.75** at every width |||

The panels were already right and never drifted. The split sections were square
by declaration and are now 3/4. The hero is the one still open: it is 3/4 on a
1440 laptop, which is where the design was calibrated, and that is why it looks
correct to us and square to the client.

### Copy: done

**No hardcoded English prose remains outside the legal pages** — measured, not
assumed. The About page, the news pages, the menus pages, the 404s, the search
panel and the product page all read from the dictionaries.

The legal pages stay English deliberately: they are binding text carrying the
zone fees and minimums, and they want a professional translator. See §4.

---

## 3. Known debt

Things that are working, understood, and not worth fixing yet — recorded so
nobody rediscovers them as bugs.

**The delivery fee lives in two places.** The site quotes it from the
`delivery_zone` metaobject; Shopify charges it from Settings → Shipping. Both
are in the Shopify admin now, a few clicks apart, which is the most that can be
done without giving up on quoting a fee before checkout. Removing it entirely
would mean reading Shopify's own rates through `cart.deliveryGroups` — but
Shopify's zones are postcode-based and ours are radial, so we would quote the
right fee against the wrong band's minimum order. That trades a visible
divergence for a subtler one. `SHOPIFY-SETUP.md` says so where it matters.

**Shopify's shipping profiles are still built by hand.** Translating the radial
bands into postcode lists is documented but manual. It is automatable — compute
every Belgian postcode's distance from the atelier and bucket it — and that
script is worth writing, but only once the atelier's real address is known.

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

**`.env.example` is not in the repo.** `.gitignore` has `.env*`, which catches
the example too. Worth a `!.env.example` negation.

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

## 4. Decisions waiting on us, not the client

**The hero grid: full height, or locked cell proportion?** They cannot both be
guaranteed with a fixed 7 × 3 grid. Three options:

1. Keep `h-svh`, accept that cells go landscape on wide screens. Today's
   behaviour
2. Lock the cell ratio, and let the hero either overflow or leave a band
3. Keep `h-svh` and **vary the column count with the viewport** — 7 columns to
   about 1600px, 9 beyond. Cells stay near 3/4 everywhere and the hero stays
   full-screen. More work, and the only option that satisfies both constraints

Option 3 is the right answer if the client cares as much as the request
suggests. Worth asking them to look at it on their own screen first.

**The legal pages stay English for now.** They are binding text, they carry the
zone fees and minimums, and they want a professional translator rather than us.
Budget it rather than doing it.

**Delivery rules stay in Shopify, not Sanity.** Asked and answered: settings
live where their twin lives. The zone fees must agree with Shopify's shipping
profiles, so moving them to Sanity would put the two copies in different
buildings again. The calendar has no twin and could move, but splitting the
delivery domain across two admins costs more than the nicer form is worth.

---

## 5. Deployment

Production is `main`, deployed by Vercel to `moment-drab-ten.vercel.app`.

**The site is deliberately not indexed.** `siteConfig.url` resolves from
`NEXT_PUBLIC_SITE_URL`, and any `.vercel.app` or localhost address serves
`Disallow: /` plus `noindex` on every page. Indexing the temporary address would
leave results pointing at somewhere the business is about to leave, and a
duplicate-content problem on the domain it actually wants to rank on.

**The day the domain is bought**, in this order:

1. Connect it in Vercel
2. Set `NEXT_PUBLIC_SITE_URL` to `https://www.moment.be` and redeploy — this is
   what opens the site to Google
3. Add the domain to Sanity's CORS origins, or the Studio stops connecting
4. Only then: Search Console, Google Business Profile, analytics

**Still to do by hand:** invite the client to the Sanity project as **Editor**,
not Administrator.
