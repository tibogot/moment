# Questions for the client

Decisions we need before the remaining work can be finished. Grouped by what
they block. Anything marked **BLOCKING** stops a feature being built at all;
the rest are choices already made on your behalf that need confirming.

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

---

## 2. Time slots — **BLOCKING**

The brief asks for *"la date, l'heure"*. The date is built; the hour cannot be
started without these.

- Delivery hours, per weekday.
- Collection hours at the atelier — the same as delivery, or different?
- How many orders can you handle per slot? This is what makes a slot "full".
- Do large or corporate orders need more notice than the standard two days?
- Should slots close automatically once capacity is reached, or do you prefer to
  close them by hand, the way you already close whole days?

---

## 3. Professional accounts

Confirmed as **corporate clients ordering catering**, not resellers.

**Do professional customers see different prices? — BLOCKING**
This is the single question that decides how big the B2B work is.

- *Same prices* — straightforward. Tag the customer in Shopify, show them
  invoices, saved addresses and one-click reordering. Days of work.
- *Different prices* — Shopify's real B2B (price lists, company accounts,
  payment terms) is **Plus only**, roughly €2,000+/month. The alternatives on
  your current plan are workarounds and each has a cost.

**Who approves a professional account application, and how fast?** A company
signing up needs someone to check it and tag them. Same day? Next working day?

**What do you need on the application form?** We are building: company name, VAT
number, contact name, email, phone, delivery address, and a free-text note. Add
or remove anything.

**Payment terms.** Do corporate clients pay at checkout like everyone else, or
do you invoice them after the fact? The second needs Shopify Plus or an app.

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
