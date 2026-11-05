# Questions for the client

Decisions we need before the remaining work can be finished. Grouped by what
they block. Anything marked **BLOCKING** stops a feature being built at all;
the rest are choices already made on your behalf that need confirming.

Two things have changed since the first version. **Much of what this document
asked you to send us is now something you enter yourself** — see section 7 for
where. And the questions that remain are mostly about how your kitchen actually
works, which is the part we cannot guess.

**Updated 5 November 2026, after your written answers of 3 November.** Built
since: MOMENT LAB SRL on the legal notice, Instagram and Facebook
@moment.brussels, open on Sundays, and your new fees and minimums (table in §1).
The capacities you gave — 2 deliveries per window, 1 collection per half-hour
slot — are being built now. The new requests (4 pieces minimum, free delivery
per zone, road distance, day-before collection, Google Analytics,
Collaborations, the partner map) are quoted separately. The questions still
open are in the email of 5 November.

**Earlier update, 29 August 2026, after the first working meeting.** Most of what was
open is now answered and built. What follows is what the answers settled, and
the smaller number of things they raised.

---

## 1. Delivery zones — **answered and built**

Your new table is live: measured from Rue des Glands 21A, four priced bands and
a quote beyond the last one.

| Zone | Distance | Fee | Minimum |
|---|---|---|---|
| 1 | 0–10 km | €10 | €100 |
| 2 | 10–25 km | €20 | €150 |
| 3 | 25–50 km | €35 | €250 |
| 4 | 50–70 km | €50 | €350 |
| — | > 70 km | quoted by hand | — |
| — | any zone, over €300 | **free** | — |

**We used €300, not €250.** Your notes gave the free-delivery threshold twice
and gave two different numbers — €300 under the zone table, €250 under the fees
heading. We took €300 as the later, more specific one. **If it is actually €250,
say so** — it is one field in the Shopify admin, but it has to be changed in the
shipping profiles too, and until both are changed the site and the checkout will
disagree about a €50 delivery.

**Brussels is no longer flat, and this moves real customers.** Your old table
gave the whole Region €10 with a €100 minimum. The new table is radial, and
Forest is in the south-west corner — so Haren, Neder-Over-Heembeek and parts of
Woluwe are now 11–14 km out and pay €15 with a €125 minimum. That is what a
distance table does, and it may be exactly what you want. It is reversible
without a deployment if it is not.

**Antwerp and Ghent are now outside.** Both are 45–50 km as the crow flies, so
they fall in the €30 band rather than being excluded — but the drive is close to
an hour each way. Do you want to serve them at table rates?

**Distance is measured in a straight line, not by road.** Chosen so a quoted
cart cannot be re-priced by roadworks an hour later. It under-measures the real
drive by roughly 20–30%, so the bands are applied generously. This is now stated
on the shipping terms page. *Confirm you are happy with it being stated.*

**Still open: is the minimum measured excluding or including VAT?** Currently
compared against the merchandise subtotal, excluding the delivery fee.

**Collection has no fee and no minimum.** Still our assumption, still stated on
the FAQ. Say if it is wrong.

---

## 2. Time slots — **answered and built**

Three windows, on every day the kitchen delivers:

**09:00 – 11:00 · 11:00 – 13:00 · 13:00 – 15:00**

The customer picks one when they order; it is required before checkout for a
delivery, and it lands on the order in the Shopify admin as "Delivery slot". Your
line — *"Créneau complet ? Contactez-nous ! Selon votre localisation et notre
itinéraire, nous pourrons peut-être vous ajouter à une tournée déjà planifiée"* —
sits under the picker, in all three languages.

**The 16:00 cut-off is built as a second rule alongside the 48 hours.** Your
wording carries both: an order placed at 15:59 on Monday can be delivered
Wednesday, one placed at 16:01 counts as Tuesday's and goes to Thursday. Without
that, "48 hours" could be satisfied by ordering at 23:50.

**Windows still have no capacity limit — this is the one piece not built.** The
site offers all three on every open day and does not count how many orders
already exist for one. Counting them means reading orders back out of Shopify,
which is a larger piece of work than the settings you already control, and worth
quoting on its own. Until then a full window is closed by hand — which is what
the "contactez-nous" line is for.

When you do want it, the question from the last version still stands and is
still the one to think about first: **capacity is probably two numbers, not
one.** The kitchen has a ceiling on covers per day, delivered or collected; the
van has a different one on drops per morning. A Saturday where you could prepare
thirty orders but only drive eight is normal, and one number cannot describe it.

**Collection is a window, not a slot.** 11:00–16:00 at the atelier, as you said,
so click & collect shows the opening rather than offering a choice.

**One thing we could not build from what you gave us.** You said collection can
be ordered *"la veille avant 16 h (pour les douceurs seulement)"*. The site
cannot tell a douceur from a lunch platter — that needs those products tagged in
Shopify — so the calendar still applies the standard 48 hours to everything,
and the shorter rule is stated in words on the FAQ and the shipping page. **If
you want it enforced, tell us which products count and we will tag them.**

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
shipping are binding, and they now carry the zone fees, the minimums, the
delivery windows and your cancellation policy. These want a professional
translator — budget for it, and it is more urgent than it was, because there is
now real money and a refund rule in them.

**"Un moment, simplement." stays in French in all three languages**, on the
grounds that it echoes the company name and reads as a signature rather than a
sentence. Confirm.

---

## 6. Claims on the site that nobody has confirmed

Written from how the code behaves, now publicly visible on the FAQ:

- Collection has no delivery fee and no minimum order.
- The 24-hour cancellation policy is quoted almost verbatim from your note, in
  three languages on the FAQ and in English on the terms and shipping pages.
  Read it once — it is the paragraph most likely to be quoted back at you.
- You are described as reachable **every day, 08:00–16:00**, and those hours are
  published to search engines as your opening hours. Note this is *not* the same
  as delivering every day. *Since 3 November the calendar is open on Sundays
  too, as you confirmed.*
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
| The opening photograph and the two panels on the home page | Page d'accueil |

**In the Shopify admin**, under Custom data → Metaobjects:

| | Where |
|---|---|
| Notice period, order cut-off hour, weekdays you never deliver, how far ahead bookings open | `delivery_settings` |
| Free-delivery threshold and collection hours | `delivery_settings` |
| Days and whole periods you are closed | `delivery_closure` |
| Zone fees, minimum orders, distance bands | `delivery_zone` |
| The two-hour delivery windows | `delivery_slot` |
| The kitchen's map coordinates | `delivery_settings` |

**What is deliberately *not* in the Studio: your company details.** The
address, phone, email, opening hours, VAT and BCE numbers used to be a screen in
there called *Coordonnées de l'entreprise*. It was removed on 29 August 2026,
once you had given us the real values.

The reasoning: those facts change once every few years, and holding them in two
places — the Studio and the site's own code — meant they could quietly drift
apart. It also produced one genuinely bad behaviour: clearing a field in the
Studio made the site fall back to the old value rather than showing nothing, so
deleting a phone number did not delete it.

The trade you are getting instead: **these are now a change we make, not one you
make.** For an address or a VAT number that is the right way round — you would
want us to look at it anyway. Send us the new value and it is live the same day.
The Studio is now only things that genuinely change: menus, réalisations, news,
and the home page images.

Everything else — the page text, the remaining photographs, the legal pages,
the layout — is still a code change on our side. That is a deliberate line, not
an oversight, and AFTER-LAUNCH.md explains where we drew it and why.

**Ask for the walkthrough.** Twenty minutes on a shared screen, and it is
included in the build rather than billed. Reading a table is not the same as
having clicked the buttons once.

---

## 8. The domain — **name settled, connection outstanding**

The domain is **`moment-lab.be`**. Everything in the code and the docs that used
to say `moment.be` has been corrected.

The site is still deliberately not indexed by Google, and stays that way until
the domain is pointed at it: letting search engines list the temporary address
would leave results pointing at somewhere you are about to leave, and a
duplicate-content problem on the domain you actually want to rank on. The site
is online and can be shown to anyone — "online" and "findable" are not the same
thing.

Two things still needed from you:

- **Confirm `moment-lab.be` is registered and give us access to its DNS**, or
  tell us who holds it. Worth checking `.brussels` while you are there.
- **Tell us which form you want, `www.moment-lab.be` or `moment-lab.be`.** We
  redirect the other; running both halves your ranking.

Opening the site to Google afterwards takes minutes on our side — one environment
variable. Search Console, the Google Business Profile and analytics should all
wait until then, so nothing has to be set up twice.

---

## 9. What we now hold, and where it went

For your records. Everything below came out of the 29 August meeting.

| | Where it lives now |
|---|---|
| Rue des Glands 21A, 1190 Forest | In the code — tell us to change it |
| 0472 35 51 53 | In the code |
| info@moment-lab.be | In the code |
| Every day 08:00–16:00 | In the code |
| BCE 1036.670.672 / TVA BE1036670672 | In the code |
| The four delivery bands | Built in; overridable in `delivery_zone` |
| Free delivery over €300 | Built in; overridable in `delivery_settings` |
| 48 hours' notice, 16:00 cut-off | Built in; overridable in `delivery_settings` |
| The three delivery windows | Built in; overridable in `delivery_slot` |
| Collection 11:00–16:00 | Built in; overridable in `delivery_settings` |
| The 24-hour cancellation policy | FAQ (×3 languages), terms, shipping |

**All four received on 3 November** and live: MOMENT LAB, SRL, and
@moment.brussels on Instagram and Facebook.
