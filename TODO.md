# Where the work stands

A working document, for whoever picks this up next — most likely you, after the
client meeting, having forgotten half of it.

It is not `SCOPE.md`, which argues the commercial case, and not
`CLIENT-QUESTIONS.md`, which asks the client for things. This one says what is
built, what is stuck and on precisely what, and what can be worked on today
without waiting for anybody.

Last reviewed: **11 August 2026**, at commit `bd87889`.

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
| **How big the B2B work is** | Do professional customers see different prices? Same prices is days of work; different prices needs Shopify Plus or a workaround |
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

Nothing here waits on anyone.

### Design — the client's two requests

**Grid line weight.** Currently exactly `1px`, measured. `2px` doubles the
visual weight, which is a lot on a grid this dense. Try `1.5px` first and judge
it on a real screen, ideally theirs.

**Cell proportions — "rectangular, 3/4 if possible".** This is three different
problems wearing one sentence. Measured at three viewports:

| | 1440×900 | 1920×951 | 2560×951 |
|---|---|---|---|
| Hero | 183×249 → **0.74** | 245×262 → **0.94** | 328×262 → **1.25** |
| Events / Coffee panels | **0.75** | **0.75** | **0.75** |
| Split image sections | **1.00** | **1.00** | **1.00** |

- **The panels are already right** and never drift — `aspect-[3/4]` on the
  `<a>` in `PanelPairSection`. Nothing to do.
- **The split sections are square by declaration** — `aspect-square` in
  `SplitImageSection`. Changing it to `aspect-[3/4]` is one line, but it changes
  the section's height and therefore the rhythm of the whole page.
- **The hero drifts** because its columns divide the viewport's *width* and its
  rows divide its *height* — two independent dimensions. It is 3/4 on a 1440
  laptop, which is where the design was clearly calibrated, and lands at 1.25 on
  a 2560 screen. **This one is a trade-off, not a setting** (see §4).

### Copy still hardcoded in English

Measured, not guessed. Outside the legal pages there are about eleven blocks
left:

- `AboutIntro`, `AboutHero`, `AboutFacts`, `AboutCta` — seven blocks. The About
  page is what a prospect reads after the home page, so this is the most visible
  hole
- `SearchPanel` empty state, `news/page.tsx` empty state,
  `news/[slug]/not-found.tsx`, one line on the product page
- `app/[lang]/not-found.tsx` is hardcoded **French**, so it is wrong in Dutch
  and English rather than wrong in all three

The Events and Coffee pages came back nearly clean — worth knowing, since they
were on the suspect list.

### Other

- **The six remaining home page photographs.** The `homePage` schema is built to
  take them one at a time; each falls back independently
- **TypeGen.** Schema and queries are in one repo now, so it can finally enforce
  the schema ↔ GROQ ↔ TypeScript contract that `sanity/README.md` currently
  describes in prose

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

**`PLACEHOLDER_MENUS` is still in `lib/menus.ts`.** It stopped being used the
moment the first real menu was published; it stays as a fallback for Sanity
being unreachable. Delete it once there are several real menus.

**The atelier's address exists twice on purpose.** Postal address in Sanity
(printed), map coordinates in Shopify (arithmetic). Not duplicates of each
other, but they describe the same building — move premises and both need
changing. Documented in both places.

**`.env.example` is not in the repo.** `.gitignore` has `.env*`, which catches
the example too. Worth a `!.env.example` negation.

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
