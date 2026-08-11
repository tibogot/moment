# Questions for the client

Decisions we need before the remaining work can be finished. Grouped by what
they block. Anything marked **BLOCKING** stops a feature being built at all;
the rest are choices already made on your behalf that need confirming.

Two things have changed since the first version. **Much of what this document
asked you to send us is now something you enter yourself** — see section 7 for
where. And the questions that remain are mostly about how your kitchen actually
works, which is the part we cannot guess.

---

## 1. Delivery zones

The zone table is built and live in the code. These are the edges it exposed.

**Distance is measured in a straight line, not by road.** Chosen so a quoted
cart cannot be re-priced by roadworks an hour later. It under-measures the real
drive by roughly 20–30%, so the bands are slightly generous. This needs to be
what the terms of sale say. *Confirm.*

**Antwerp falls in zone 4 (€35).** It is 45.7 km as the crow flies, but close to
an hour's drive each way. Do you actually want to serve it at table rates?
Ghent misses the 50 km cut-off by 400 metres.

**The near periphery pays more than Brussels.** Drogenbos, Linkebeek and Beersel
are 2–8 km from the atelier but outside the Region, so they land in zone 2:
€15 with a €125 minimum, while Uccle at 1.6 km pays €10 with a €100 minimum.
Intended?

**Does collection have a minimum order?** We assumed **no** — no fee and no
floor — because your table is headed *Livraison payante*. This is now stated on
the public FAQ page.

**Is the minimum measured excluding or including VAT?** Currently compared
against the merchandise subtotal, excluding the delivery fee.

**We need the atelier's real street address.** The distance origin is currently
the centroid of 1190 Forest, which is the right commune and the wrong building.
Being off by a kilometre moves customers near a band edge into the wrong zone.
The FAQ also says "1190 Forest" as the collection point and should name a street.

This one is now two entries you can make yourselves, and they are not the same
thing: the **postal address** goes in the Studio under Coordonnées de
l'entreprise, and the **map coordinates** the pricing measures from go in
Shopify under `delivery_settings`. Right-click the front door in Google Maps and
the first item in the menu is the pair of numbers. Set both or neither.

**The fees and minimums are yours too now.** They are entries in the Shopify
admin rather than something we deploy. One thing to hold on to: the site quotes
the fee and Shopify charges it, and those are two separate settings that have to
agree. Change one, change the other, same sitting.

---

## 2. Time slots — **BLOCKING**

The brief asks for *"la date, l'heure"*. The date is built; the hour cannot be
started without these.

- Delivery hours, per weekday.
- Collection hours at the atelier — the same as delivery, or different?
- Do large or corporate orders need more notice than the standard two days?
- Should slots close automatically once capacity is reached, or do you prefer to
  close them by hand, the way you already close whole days?

**"Capacity" is probably two numbers, not one.** This is the question we most
need you to think about before we build it:

- **The kitchen** has a ceiling — how many covers can come out of it in a day,
  whether they are delivered or collected. That is one shared limit.
- **The van** has a different one — how many drops fit in a morning. That
  constrains delivery only.

A Saturday where you could happily prepare thirty orders but only drive eight is
completely normal, and one number cannot describe it. Tell us both, or tell us
we are overcomplicating it and one is enough.

**Note on what this costs.** Counting how many orders already exist for a given
day means reading them back out of Shopify, which is a different and larger
piece of work than the settings you can already change yourself. Worth knowing
before it is quoted.

**The rest of the calendar is already yours.** Notice period, the weekdays you
never deliver, whole closure periods and how far ahead the calendar goes are all
settings in the Shopify admin now — see SEO-CLIENT-CHECKLIST.md §3.

---

## 3. Professional accounts

Confirmed as **corporate clients ordering catering**, not resellers.

**Do professional customers see different prices? — BLOCKING**
This is the question that decides how big the B2B work is, and the answer to it
got considerably cheaper on 2 April 2026.

Shopify's native B2B — company profiles, price catalogues, payment terms and
saved cards — used to be Plus only, at roughly €2,000/month. It is now included
on **Basic, Grow and Advanced at no extra cost**. An earlier version of this
document said otherwise; it was written before the change.

- *Same prices for everyone* — tag the customer, show them their orders, saved
  addresses and one-click reordering. Days of work.
- *One or two professional price levels* — native, on your current plan. You get
  **up to 3 catalogues**, so up to three price tiers.
- *A rate negotiated per company* — still Plus. Assigning a catalogue directly to
  one company is the line Shopify kept above the paywall.

So the question to answer is narrower than it was: **how many different price
levels do you need — one for everyone, or a professional rate, or genuinely
different terms per client?** Three or fewer costs you nothing extra.

**Who approves a professional account application, and how fast?** A company
signing up needs someone to check it and tag them. Same day? Next working day?

**What do you need on the application form?** We are building: company name, VAT
number, contact name, email, phone, delivery address, and a free-text note. Add
or remove anything.

**Payment terms.** Do corporate clients pay at checkout like everyone else, or
do you invoice them after the fact?

Also changed in April: **net payment terms are now native on your plan**, along
with saved company cards and a draft-order-to-invoice flow. Invoicing a company
at 30 days no longer needs Plus or a third-party app. Deposits and partial
payments still do.

---

## 4. Invoices

Shopify does not produce VAT invoices on its own. Three options, cheapest first:

1. Link each order to Shopify's own order status page. Free, not a real invoice.
2. An invoicing app such as Sufio or Order Printer. ~€20–50/month, proper
   VAT-compliant PDFs, which is what a Belgian company will expect.
3. Build it ourselves. Only worth it if 2 cannot be made to fit.

Related: **saved payment methods** cannot be built into the site. Cards are
vaulted by Shopify checkout — enabling **Shop Pay** is what delivers this.

---

## 5. Language

The site now runs in French, Dutch and English, French first.

**Confirm all three are wanted.** Dutch is justified by the delivery zones
reaching Halle, Vilvoorde and Leuven; English by corporate Brussels.

**The French and Dutch copy is a first draft and needs their eye.** It was
written to carry the tone, not just the meaning. They should correct it.

**Legal pages are deliberately untranslated.** Terms, privacy, cookies and
shipping are binding, and they now carry the zone fees and minimums. These want
a professional translator — budget for it.

**"Un moment, simplement." stays in French in all three languages**, on the
grounds that it echoes the company name and reads as a signature rather than a
sentence. Confirm.

---

## 6. Claims on the site that nobody has confirmed

Written from how the code behaves, now publicly visible on the FAQ:

- Collection has no delivery fee and no minimum order.
- More than one delivery address can be kept on file for a company. *(True of
  the intent; saved addresses are not built yet.)*
- Vegetarian, vegan and gluten-free versions are labelled and boxed separately.
- Event menus are quoted, never ordered online.

---

## 7. What you can now change yourself

The site has an editing interface at `/studio`, in French. You sign in with the
email address we invite, and what you can see there is decided by that
invitation — the address is public, the contents are not.

**In the Studio:**

| | Where |
|---|---|
| Catering menus | Menus traiteur |
| News articles | Actualités |
| Address, phone, email, VAT and BCE numbers, social accounts | Coordonnées de l'entreprise |
| The opening photograph and the two panels on the home page | Page d'accueil |

**In the Shopify admin**, under Custom data → Metaobjects:

| | Where |
|---|---|
| Notice period, weekdays you never deliver, how far ahead bookings open | `delivery_settings` |
| Days and whole periods you are closed | `delivery_closure` |
| Zone fees, minimum orders, distance bands | `delivery_zone` |
| The kitchen's map coordinates | `delivery_settings` |

Everything else — the page text, the remaining photographs, the legal pages,
the layout — is still a code change on our side. That is a deliberate line, not
an oversight, and AFTER-LAUNCH.md explains where we drew it and why.

**Ask for the walkthrough.** Twenty minutes on a shared screen, and it is
included in the build rather than billed. Reading a table is not the same as
having clicked the buttons once.

---

## 8. The domain — **BLOCKING for search**

`moment.be` is not registered. Until it is, the site is deliberately not indexed
by Google: letting search engines list the temporary address would leave results
pointing at somewhere you are about to leave, and a duplicate-content problem on
the domain you actually want to rank on.

The site is online and can be shown to anyone. It is simply not competing in
search yet, and "online" and "findable" are not the same thing.

- Register `moment.be`, and check `.brussels` while you are there.
- Tell us which form you want, `www.moment.be` or `moment.be`. We redirect the
  other; running both halves your ranking.

Opening the site to Google afterwards takes minutes on our side. Search Console,
the Google Business Profile and analytics should all wait until then, so nothing
has to be set up twice.
