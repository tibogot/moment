# After launch

Going live is a milestone, not an end. This site is not a brochure that sits
still — it is a system with moving parts, some of which are owned by companies
other than us and change on their own schedule.

This document says what those parts are, what they cost, and who is responsible
for each one. Nothing here is a surprise; it is the same for every site of this
kind. The point is to decide it now rather than discover it in December.

---

## 1. What costs money regardless of who maintains it

These leave your account whether or not you keep a developer. They are yours,
not ours.

| Item | What it is | Rough cost |
|---|---|---|
| Domain name | `moment.be`, renewed yearly | ~€15/year |
| Hosting | Where the site actually runs | free to ~€20/month depending on traffic |
| Shopify plan | Products, checkout, payments, orders | your current plan |
| Sanity | Where the editable content lives | free tier is likely enough |
| Geoapify | Address lookup across Belgium | free up to 3,000 lookups/day; paid above |
| Invoicing app | VAT invoices — Shopify does not make them | ~€20–50/month if you take this route |
| Translation | Legal pages need a professional | one-off, per page |

Two of these deserve a note. **Geoapify's free tier is a real tier, not a trial**
— but if it lapses or the key is revoked, address lookup silently falls back to
a Brussels-only register and every address outside the Region stops resolving.
Nobody gets an error message. Orders just stop. **Shopify's plan** decides what
is even possible: live delivery rates and real B2B pricing need Advanced or
Plus, which is a different order of magnitude.

---

## 2. What runs on someone's attention

This is the part that has no invoice attached until something breaks.

**Shopify's Storefront API is versioned.** Shopify releases a new version every
quarter and retires old ones after a year. The site talks to it constantly — the
cart, the products, the delivery closures. When a version is retired, that code
has to be moved forward. This is not optional and it is not a bug.

**Next.js, Sanity and the other libraries ship security updates.** A site
handling addresses, names and phone numbers is holding personal data. Under
GDPR, running knowingly outdated software on that data is your exposure, not
ours.

**The delivery calendar is business logic, not decoration.** Order lead times,
closed days, how many orders fit in a slot, the zone table and its minimums —
these change when *your business* changes. A new atelier address, a new zone, a
change to the two-day notice: each is a code change.

**Payment and address providers change their terms.** Keys expire, quotas move,
endpoints get deprecated.

**Nobody is watching unless someone is watching.** The failure mode that costs
you real money is not the site going down loudly — it is the checkout quietly
failing on a Saturday in December while the phone doesn't ring and nobody knows
why. Monitoring is the difference between finding out in ten minutes and finding
out on Monday.

---

## 3. What you can change yourself, and what you cannot

Be clear-eyed about this, because it drives the rest of the conversation.

**Today, editable by you:** the catering menus, through the Sanity Studio. That
is the schema that exists.

**Today, not editable by you** — every one of these is a code change and a
deployment:

- All page text — the About page, the homepage, the service descriptions
- All photography and images
- Opening hours, closing days, the address, the phone number
- Delivery zones, fees, minimums and lead times
- Anything on the legal pages

This is a deliberate design, not an oversight: a hand-built site is faster,
better looking and better ranked than a page-builder, and the price of that is
that the layout is not something you drag around. But it means **there is no
version of this where changes happen without a developer** — the only question
is which changes go through Sanity and which go through code.

**The decision you need to make:** what will you actually want to change, and
how often? Answer that, and we make exactly those things editable and no more.
Making everything editable sounds appealing and is the wrong answer — it costs
several times more to build and it lets the design drift out of shape.

---

## 4. The multilingual multiplier

The site runs in French, Dutch and English. This is worth stating plainly
because it is the most commonly underestimated part of any site.

It is **not** Google Translate. Automatic translation gives you a widget; it does
not give you `/fr/menus` as a real address, it does not get you found on Google
in Dutch, and it will not know that *apéro dînatoire* is a format and not a
description. What is built here is three real sites' worth of content sharing
one design.

The consequence is permanent, not one-off: **every future change is three
changes.** One new page is three pages. One new product in Shopify is three
product descriptions. One corrected paragraph is three corrected paragraphs, one
of which needs someone who writes correct Dutch. This is the single biggest
driver of ongoing effort on this project, and it is invisible from the outside.

---

## 5. Who is responsible for what

| | You | Us | Currently nobody |
|---|---|---|---|
| Menus in Sanity | ✓ | | |
| Products, prices, stock in Shopify | ✓ | | |
| Approving professional accounts | ✓ | | |
| Closing delivery days | ✓ | | |
| Page text, images, hours | | | ✓ |
| Zones, fees, lead times | | | ✓ |
| Shopify API version upgrades | | | ✓ |
| Security updates | | | ✓ |
| Uptime and checkout monitoring | | | ✓ |
| API keys and quotas | | | ✓ |
| Translating anything new | | | ✓ |

Every ✓ in the third column is a thing that will eventually need doing, by
someone, at a moment you did not choose.

---

## 6. Three ways to arrange this

**A — Nothing.** You take the site as delivered and call when something breaks.
Work is billed at the hourly rate, at whatever notice happens to be available.
Honest downside: emergencies are the most expensive way to buy developer time,
and there is no monitoring, so you find out about a broken checkout from a
customer.

**B — Care plan.** *(recommended)* A fixed monthly fee covering: security and
dependency updates, Shopify API version upgrades, uptime and checkout
monitoring, API key and quota management, backups, and **N hours per month of
content or copy changes** — carried over up to a limit. Anything beyond the
included hours is billed at the hourly rate, quoted before it starts. This is
what makes the site something you stop thinking about.

**C — Care plan + editable back-office.** B, plus a one-off build phase that
moves the things you actually want to control into Sanity: page text, key
images, hours and contact details. Quoted separately once you have answered the
question in section 3, because the price depends entirely on the answer.

Whichever you choose, delivery includes a **training session** on the Sanity
Studio and a short written guide for the things you manage yourself. That is
included, not extra.

---

## 7. What we need from you to finish

Some of this is already in `CLIENT-QUESTIONS.md`, and it is blocking:

- The atelier's real street address — the delivery distances are currently
  measured from the centre of 1190 Forest
- Enterprise number, VAT number and legal form, for the legal pages
- Public phone number and email
- Delivery and collection hours per weekday
- Instagram and Facebook addresses
