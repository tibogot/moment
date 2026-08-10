# SEO — what we still need from you

The technical SEO for the site is built and working: every page has a title, a
description, a canonical URL, a social share card, and machine-readable business
data (Schema.org). A sitemap and robots.txt are generated automatically and stay
in sync with the shop and the news section.

What is missing is **your information**. Right now several fields are blank or
say "placeholder", and a few of them are legally required in Belgium. Every item
below has a note on why it matters — the ones marked **BLOCKER** should be
settled before the site goes live.

**Most of this you can now fill in yourself.** The site has an editing interface
at `/studio`, in French, and sections 1, 2, 3 and 5 are fields waiting there
rather than things to send us. Where that is the case it says so, with the path
to the screen. Nothing below needs technical knowledge.

You can reply to this document inline.

---

## 1. Company identity — **BLOCKER**

Belgian law requires a company's identity to be reachable from the website, and
Google uses the same details to decide whether you are a real, trustworthy
business. Both the legal notice page and the site's structured data are wired up
and waiting for these values.

| What we need | Example | Where it appears |
|---|---|---|
| Registered company name | `Moment SRL` | Legal notice, terms, Google |
| Legal form | `SRL / BV`, `SA / NV`, sole trader… | Legal notice |
| BCE / KBO enterprise number | `0123.456.789` | Legal notice — **legally required** |
| VAT number | `BE0123456789` | Legal notice, invoices, terms |
| Registered address | street, number, postcode, city | Legal notice, Google, maps |

> If the registered (company) address is different from the kitchen or the
> coffee desk, we need **both**, and a note on which one the public should visit.

**Where to put them:** `/studio` → **Coordonnées de l'entreprise** → the
*Mentions légales* and *Contact* tabs. They appear on the site within a minute,
with no deployment. Until they are filled in, the legal notice page prints
"[to be completed]" where the numbers should be.

**Why it matters:** without a verifiable address, Google will not rank you for
"traiteur Brussels" or any other local search — location is the single strongest
signal for that kind of query. This is the highest-value item on the list.

**One address, two places, and they are not the same thing.** The postal address
above is what gets printed. Separately, the delivery pricing measures distance
from the kitchen's map coordinates, set in Shopify → Custom data → Metaobjects →
`delivery_settings`. They are currently the centre of 1190 Forest, which is the
right commune and the wrong building — so anyone near the edge of a delivery band
is being quoted the wrong fee. Moving premises means changing both.

---

## 2. Contact details — **BLOCKER**

| What we need | Notes |
|---|---|
| Public phone number | In international format, e.g. `+32 2 123 45 67` |
| General email address | The one clients should write to for orders and quotes |
| Separate catering/events email? | Only if you want enquiries split |

**Where to put them:** `/studio` → **Coordonnées de l'entreprise** → *Contact*.

**Why it matters:** these are shown to Google as your official contact points and
appear directly in search results and on Google Maps. A phone number that
matches everywhere (site, Google, Instagram) measurably improves local ranking.

Until you do, the site shows no phone number at all — which is the right
behaviour, and the reason it is worth doing this week.

---

## 3. Opening hours

We need the hours for anything the public can walk into — the coffee desk in
particular.

- Days and hours you are open
- Any days you are closed (public holidays, annual closure)
- Is the kitchen open to the public at all, or is it order-only?

**What you can already set yourself**, in Shopify → Custom data → Metaobjects:

- `delivery_settings` — how many days' notice you need, which weekdays you never
  deliver, how far ahead the calendar takes bookings
- `delivery_closure` — days and whole periods you are shut. One entry covers a
  fortnight; there is deliberately no built-in list of public holidays, because
  a caterer's best days are the ones everyone else takes off

**What we still need from you** is the coffee desk's opening hours, which are a
different thing from delivery availability and are not yet anywhere on the site.

**Why it matters:** Google shows "Open now / Closes at 17:00" directly in search
results for businesses that publish hours. Without them, that slot stays empty.

---

## 4. Google Business Profile

- Do you already have a Google Business Profile (the panel that appears on the
  right in Google, with photos, reviews and a map)?
- If yes — please add us as a manager, or send the login.
- If no — we should create one. It is free and it is the biggest single lever
  for a local food business.

**Why it matters:** for searches like "traiteur près de moi", the Business
Profile is what appears, not the website. The website supports it; it does not
replace it.

---

## 5. Social accounts

| Account | Link |
|---|---|
| Instagram | |
| Facebook | |
| LinkedIn (if you target companies) | |
| Any others | |

**Where to put them:** `/studio` → **Coordonnées de l'entreprise** → *Réseaux
sociaux*. Full addresses, not handles. An account with no address is simply not
shown, rather than linked to a dead page.

**Why it matters:** these are declared to Google as officially yours, which links
the accounts and the website into one recognised business entity.

---

## 6. Language — **decided and built**

This section used to ask you to choose. The choice was made and the work is
done: the site runs in **French, Dutch and English**, French first, with real
addresses per language (`/fr/menus`, `/nl/menus`, `/en/menus`) rather than a
translation widget. Google can now tell what language each page is in, which it
could not before.

Two things this leaves on your side.

**The French and Dutch copy is a first draft and needs your eye.** It was
written to carry the tone, not only the meaning. Read it and correct it — nobody
knows how you talk about your own food better than you.

**Every change from now on is three changes.** A new page is three pages. A new
product description in Shopify is three descriptions. This is the permanent cost
of a trilingual site and it is invisible from the outside, so it is worth saying
plainly: the largest ongoing effort on this project is keeping three languages
in step, and one of them needs somebody who writes correct Dutch.

The legal pages (§7) are deliberately still English-only. They are binding text
and they want a professional translator, not us.

---

## 7. Legal pages — **BLOCKER**

Five pages exist but currently carry **draft placeholder copy**:

- Legal notice
- Privacy policy (GDPR)
- Cookie policy
- Terms of sale (CGV)
- Shipping & returns

We need either:

- **Your lawyer's versions** — preferred, and normal for a business selling to
  consumers in Belgium; or
- **Confirmation in writing** that you accept the draft copy as-is and take
  responsibility for it.

For the shipping and returns page specifically, we need the operational facts:

- Which postcodes/communes do you deliver to?
- Order cut-off time (e.g. "order before 16:00 for next-day delivery")
- Delivery fee, and any free-delivery threshold
- Minimum order value
- Is pickup possible? From where, and at what times?
- Return / cancellation policy for food orders

**Why it matters:** distance selling to consumers in Belgium has mandatory
disclosure rules. Separately, Google will not show shipping and return details in
shopping results unless they are stated on the site.

---

## 8. Product information (Shopify)

The shop pulls everything from Shopify, so improving it there improves the SEO
automatically — no development needed.

- **Descriptions.** Every product needs a real description of a few sentences.
  The first ~25 words become the text Google shows in search results.
- **Photos.** At least one good photo per product; more is better. These are also
  what appears when someone shares a product link on WhatsApp or Instagram.
- **Allergens and ingredients.** The site already has fields for ingredients,
  allergens, dietary info, serving size and storage. They are mostly empty. These
  are both a legal expectation for food and a genuine ranking advantage —
  competitors rarely fill them in.
- **Prices and availability.** Keep these accurate in Shopify; they are published
  to Google automatically and wrong data gets a store penalised.

---

## 9. News articles (Sanity)

One thing to fix on your side: article titles currently have the SEO suffix typed
into them, e.g.

> `Brunch Delivery in Brussels: A Fresh and Delicious Moment at Home | ( moment )`

The site adds the brand name automatically, so this ends up doubled. **Please put
only the headline in the title field.**

The separate field we offered now exists: `/studio` → **Actualités** → an
article → the *Référencement* tab, where "Titre pour Google" overrides the
headline in search results and nowhere else. Leave it empty and the headline is
used, which is usually what you want.

---

## 10. Analytics and Search Console

We need to know which tools you want, so we can wire them into the cookie banner
correctly.

- Which analytics tool? (Google Analytics 4, Plausible, Fathom, none)
- If you already have an account, send the property/site ID.
- Do you want Google Search Console set up? **Strongly recommended** — it is free
  and it is the only way to see which searches bring people to the site.
- Any Meta/Facebook Pixel or Google Ads tracking?

**Why it matters:** without Search Console we are guessing at what works. With it,
we can see exactly which pages and search terms perform, and improve from there.

---

## 11. The domain — **BLOCKER, and the one holding up Google**

The site is live and working, at a temporary Vercel address. **`moment.be` is
not registered.** Until it is, three things are true and worth understanding
together:

**The site is deliberately invisible to Google.** Not broken — closed on
purpose. Every page tells search engines not to index it. If you search for
"Moment traiteur" you will not find the site, and that is correct behaviour, not
a fault.

**This is protecting you, not delaying you.** Letting Google index the temporary
address would mean a pile of results pointing at somewhere you are about to
leave, and a duplicate-content problem on the domain you actually want to rank
on. Every search engine signal is tied to a domain; starting on the wrong one
and moving costs months.

**"Online" and "findable" are different things.** The site can be shown to
anyone you send the link to, today. It simply is not competing in search yet.

What we need:

- **Register the domain.** `moment.be` if it is free. Check `.brussels` too, and
  any variant a competitor could take.
- **Tell us the exact form you want** — `www.moment.be` or `moment.be`. Pick one
  and we make the other redirect; running both splits your ranking in half.
- **Any old domains** from a previous site that should redirect here.

Once it exists, opening the site to Google is a single setting on our side and
takes minutes. Everything else — Search Console, the Google Business Profile
(§4), the analytics in §10 — should be set up **after** that, on the real
domain, so nothing has to be redone.

---

## 12. Photography and brand assets

- A logo file (SVG or high-resolution PNG, transparent background)
- 3–5 strong photos of food, the kitchen, and the team

**Why it matters:** the share card that appears when someone posts a link is
generated automatically and looks good already, but real photography of your food
performs better than a text card.

---

## Priority order

If you can only deal with part of this now, do it in this order:

1. **Register the domain** (§11) — nothing about search can start without it,
   and it takes ten minutes
2. **Company identity + address** (§1) — legally required, and the strongest
   single signal for local ranking. You can type these in yourself today
3. **Contact details** (§2) — same screen, two minutes
4. **Legal pages** (§7) — blocks launch
5. **Google Business Profile** (§4) — biggest quick win for local search, but
   only after the domain exists
6. Everything else

---

## What happens once you send this

**Sections 1, 2, 3 and 5 are yours now.** They are fields in `/studio` and in
the Shopify admin, and the site picks them up within a minute — no deployment,
no waiting on us. That is the change since the last version of this document:
the things you will want to correct most often are the ones you can reach.

**Sections 8 and 9** you have always been able to do yourselves, in Shopify and
in the Studio.

**Section 11 needs a purchase**, and it gates §4 and §10.

**Sections 6 and 7** are the remaining work on our side. The language build is
done; what is left there is your read-through of the French and Dutch, and a
professional translation of the legal pages.

**Ask us for a walkthrough of the Studio.** Twenty minutes on a shared screen is
worth more than this document, and it is included — not extra.
