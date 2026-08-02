# SEO — what we still need from you

The technical SEO for the site is built and working: every page has a title, a
description, a canonical URL, a social share card, and machine-readable business
data (Schema.org). A sitemap and robots.txt are generated automatically and stay
in sync with the shop and the news section.

What is missing is **your information**. Right now several fields are blank or
say "placeholder", and a few of them are legally required in Belgium. Every item
below has a note on why it matters — the ones marked **BLOCKER** should be
settled before the site goes live.

You can reply to this document inline. Nothing here needs technical knowledge.

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

**Why it matters:** without a verifiable address, Google will not rank you for
"traiteur Brussels" or any other local search — location is the single strongest
signal for that kind of query. This is the highest-value item on the list.

---

## 2. Contact details — **BLOCKER**

| What we need | Notes |
|---|---|
| Public phone number | In international format, e.g. `+32 2 123 45 67` |
| General email address | The one clients should write to for orders and quotes |
| Separate catering/events email? | Only if you want enquiries split |

**Why it matters:** these are shown to Google as your official contact points and
appear directly in search results and on Google Maps. A phone number that
matches everywhere (site, Google, Instagram) measurably improves local ranking.

---

## 3. Opening hours

We need the hours for anything the public can walk into — the coffee desk in
particular.

- Days and hours you are open
- Any days you are closed (public holidays, annual closure)
- Is the kitchen open to the public at all, or is it order-only?

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

**Why it matters:** these are declared to Google as officially yours, which links
the accounts and the website into one recognised business entity.

---

## 6. Language — **decision needed**

The site currently mixes English and French. This needs a decision before
translation work starts, because it changes how the site is structured.

Please pick one:

- **A — One language only.** Which one? (Most Brussels traiteurs pick French.)
- **B — French + English.** Two full versions, visitor picks.
- **C — French + Dutch + English.** Full trilingual, correct for Brussels but the
  largest content job.

**What we need from you either way:** who writes the translations? Professional
translation, or your own team? Machine translation is not viable — Google treats
it as low-quality content and it will hurt rather than help.

**Why it matters:** right now some pages are English and some product
descriptions are French. Google cannot tell which language the site is in, so it
struggles to rank it in either. This is the second-biggest issue after the
address.

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
only the headline in the title field.** We can add a separate "SEO title" field if
you want to control both independently — just say the word.

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

## 11. Domain confirmation

The site is currently configured for **`www.moment.be`**.

- Is this the final domain?
- Do you own it already?
- Any other domains that should redirect to it (`moment.brussels`, `.com`, old
  domains from a previous site)?

**Why it matters:** every SEO signal is tied to the domain. Changing it after
launch means starting over, so this must be right before we go live.

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

1. **Company identity + address** (§1) — blocks the legal page and local ranking
2. **Contact details** (§2)
3. **Legal pages** (§7) — blocks launch
4. **Language decision** (§6) — blocks all translation work
5. **Google Business Profile** (§4) — biggest quick win for local search
6. Everything else

---

## What happens once you send this

Sections 1, 2, 3, 5 and 11 are configuration values — they drop into one file and
propagate across the whole site automatically: the legal page, the contact
details, and the structured data Google reads. That is a same-day change.

Sections 8 and 9 you can do yourselves in Shopify and Sanity at any time; the
site picks up the changes without a deployment.

Sections 6 and 7 are the larger pieces of work and need a decision before they
can start.
