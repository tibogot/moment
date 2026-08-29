# Shopify admin setup

Work that happens in the Shopify admin rather than in this codebase. Some of it
the site already depends on; some is needed before launch. Kept separate from
`CLIENT-QUESTIONS.md` because these are tasks, not decisions.

---

## Already required for what is built

**Delivery closures — `delivery_closure` metaobject.**
The calendar reads the days you close from here. Settings → Custom data →
Metaobjects → a definition resolving to type `delivery_closure`, with:

| Field | Type | Required | Meaning |
|---|---|---|---|
| `date` | Date | yes | First day closed |
| `end_date` | Date | no | Last day closed, inclusive |
| `reason` | Single line text | no | Your own note. Ignored by the site |

**`end_date` is what makes a closure a period.** Three weeks shut in August is
one entry, not twenty-one. Leave it empty and the closure is the single day in
`date`, which is how every existing entry already behaves — nothing needs
migrating.

**Storefront API access must be enabled on the definition**, or the query
returns nothing and every day reads as open.

There is deliberately **no built-in list of Belgian public holidays**. A
caterer's best days are the ones everyone else takes off, so 21 July and
15 August are yours to close or work as you choose.

**Delivery rules — `delivery_settings` metaobject.**
The standing rules, so they change without a deployment. One definition, **one
entry** — only the first is read. Every field is optional and falls back to the
value in brackets, which is what the site did before this existed.

| Field | Type | Meaning |
|---|---|---|
| `lead_time_days` | Integer | Notice required before a delivery (2) |
| `order_cutoff_hour` | Integer | Hour after which today stops counting, 0–23 (16) |
| `closed_weekdays` | List of single line text | Weekdays you never deliver (sunday) |
| `booking_window_days` | Integer | How far ahead the calendar takes bookings (365) |
| `free_delivery_threshold` | Decimal | Basket value above which delivery is free, in euros (300) |
| `pickup_start_time` | Single line text | Collection opens, `HH:MM` (11:00) |
| `pickup_end_time` | Single line text | Collection closes, `HH:MM` (16:00) |
| `atelier_latitude` | Decimal | Where deliveries are measured from |
| `atelier_longitude` | Decimal | — |

`closed_weekdays` takes lowercase English day names — `monday` … `sunday`. Add
them as **choices** on the field definition and the admin gives you a checklist
instead of a text box. An empty list means you deliver every day; a value the
site cannot read falls back to Sunday rather than opening the week.

`lead_time_days` is quoted to customers on the FAQ, the contact page and under
both calendars, all from this one field — change it here and every page that
mentions it follows. The same goes for the closed weekdays: the site writes the
sentence itself, so nothing has to be edited when a day opens.

**`order_cutoff_hour` and `lead_time_days` are two rules, not one.** Your own
wording — "minimum 48 h à l'avance avant 16 h" — carries both. The lead time is
how much notice you need; the cut-off is the hour after which today stops
counting towards it. An order placed at 15:59 on Monday can be delivered
Wednesday; one placed at 16:01 is treated as Tuesday's order and goes to
Thursday. Without the cut-off, someone could order at 23:50 and call it 48
hours when you had 34 of them.

**`free_delivery_threshold` has to be set in two places, like every other fee
on this page.** €300 in the metaobject is what the *site* quotes; a price-based
rate of €0 above €300, on every zone in Settings → Shipping and delivery, is
what Shopify *charges*. Set it here and not there and the site promises free
delivery while the checkout adds €50 — the single most expensive way these two
tables can disagree.

`pickup_start_time` and `pickup_end_time` are the atelier's collection window,
shown on the FAQ, the contact page and the shipping terms. Both or neither: a
new opening time against the default closing time is a window nobody chose.

**The atelier address exists in two places, and they are not the same thing.**
The *coordinates* below are here, in Shopify, because delivery pricing is
measured from them. The *postal address* — street, postcode, city — is in the
Sanity Studio under Company details, because it is printed on the legal page.
Correcting one does not correct the other: move the atelier and both need
changing, or the site will quote distances from the old building while printing
the new address. There is no way to merge them without making the pricing depend
on a second service being reachable.

**The atelier coordinates are the most important two numbers on this page.**
Every zone from 2 outwards is a radius measured from them, so being a kilometre
out moves customers near a band edge into the wrong fee and the wrong minimum.
They are no longer a placeholder: since 29 August 2026 the built-in value is
`50.81976, 4.32657`, geocoded from Rue des Glands 21A, 1190 Forest. **You only
need to set these if the atelier moves, or if the geocoded point is not the door
the van leaves from.** To check: open Google Maps, right click the front door,
and the first item in the menu is `50.812345, 4.324567` — latitude first,
longitude second. Set **both** or neither; one new number against one default is
worse than two defaults.

**Delivery zones — `delivery_zone` metaobject.**
What the trip costs, and how full the basket has to be. One entry per band.
Read the section on shipping rates below before changing a fee.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `zone_id` | Integer | yes | 1, 2, 3 … as the customer sees it |
| `fee` | Decimal | yes | Delivery fee in euros |
| `minimum_order` | Decimal | yes | Basket minimum in euros |
| `max_distance_km` | Decimal | no | The band's outer edge |

The built-in table is the one you gave us on 29 August 2026, so **you do not
need to create these entries unless you want to change something**:

| Zone | Distance | Fee | Minimum |
|---|---|---|---|
| 1 | 0–10 km | €10 | €100 |
| 2 | 10–25 km | €15 | €125 |
| 3 | 25–50 km | €30 | €150 |
| 4 | 50–70 km | €50 | €200 |

There is deliberately **no fifth entry for "> 70 km"**. A band with no price is
not a band — past the last one the site stops quoting and sends the customer to
the enquiry form, which is your "sur devis".

`max_distance_km` should be filled in on every band. Leaving it **empty** marks
a zone as administrative rather than radial — any Brussels postcode takes it
whatever the distance — which is how your *previous* table worked and how a
"one flat rate inside Brussels" rule could be set up again without a
deployment. Nothing in the current table uses it.

**One thing worth knowing about the change from the old table.** The old zone 1
was "Bruxelles" — the whole Region for €10 with a €100 minimum. The new zone 1
is a 10 km radius, and Forest is in the south-west corner of the Region, so the
north-east of Brussels (Haren, Neder-Over-Heembeek, parts of Woluwe) is now
11–14 km out and pays €15 with a €125 minimum. That is what a distance table
does. If you would rather Brussels stayed flat, that is the empty
`max_distance_km` above — tell us and we will walk you through it.

**One bad entry discards the whole table**, on purpose, and the site falls back
to the built-in bands with a line in the server log. A half-read table is how a
20 km address falls through to the 50 km band and gets quoted €10 too much;
there is no safe partial answer to a price.

**Delivery windows — `delivery_slot` metaobject.**
The two-hour windows the customer picks when they order. One entry per window.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `start_time` | Single line text | yes | `HH:MM`, e.g. `09:00` |
| `end_time` | Single line text | yes | `HH:MM`, e.g. `11:00` |

The built-in windows are yours — 09:00–11:00, 11:00–13:00, 13:00–15:00 — so
again, entries are only needed to change them. Order in the admin does not
matter; the site sorts them by start time. An entry that will not read is
dropped and the rest still show, unlike the zone table: a missing window costs
the customer a choice, where a missing band costs them the right price.

**Windows are not capacity.** The site offers all three on every open day and
does not count how many orders already exist for one — that needs reading orders
back out of Shopify, which is a separate and larger piece of work. Until it is
built, a full window is closed by hand: the picker carries your own line, "Créneau
complet ? Contactez-nous !", so a customer whose window is full rings you rather
than giving up.

Storefront API access has to be enabled on every one of these definitions.

All the delivery metaobjects are cached for five minutes. To make a change
appear immediately, call `revalidateTag("shopify-delivery")` from a webhook.

**Guest checkout.** Settings → Checkout → Accounts must be **optional**. The
brief is explicit that a first order must not require an account.

**Storefront API token** needs `write_checkouts`, or carts cannot be created.

---

## Before launch

### Shipping rates must match the zone table

This is the one that will bite, and moving the zone table into the admin does
not fix it. The site *quotes* the fee from the `delivery_zone` metaobject;
Shopify *charges* it from Settings → Shipping and delivery. Two places, two
copies of the same number. If they disagree, Shopify wins and the customer sees
a different figure on the last screen than the one that persuaded them.

What the metaobject buys is that both copies now live in the Shopify admin,
a few clicks apart. **Whenever you change a delivery fee, change it twice** —
in the metaobject and in the shipping profile — in the same sitting.

Shopify's shipping zones are postcode-based, not radial, so the table has to be
translated into postcode lists. What the site quotes, as of 29 August 2026:

| Zone | Rule | Fee | Minimum |
|---|---|---|---|
| 1 | 0–10 km from the atelier | €10 | €100 |
| 2 | 10–25 km | €15 | €125 |
| 3 | 25–50 km | €30 | €150 |
| 4 | 50–70 km | €50 | €200 |
| — | beyond 70 km | quote by hand | — |
| — | **any zone, basket over €300** | **free** | — |

Compute each Belgian postcode's distance from the atelier once, bucket it into
the four bands, and paste the lists into four shipping profiles. Coarse, but the
narrowest band is 10 km wide so the error is tolerable.

**The free-delivery threshold has to be set on every one of those profiles**, as
a price-based rate of €0 for orders above €300. It is not a fifth zone — it cuts
across all four — and a profile that misses it will charge €50 on an order the
site promised to deliver free.

The precise alternative is the Carrier Service API, which calculates the rate
live from our own endpoint — but it needs Shopify **Advanced or Plus**.

Do **not** add the fee as a cart line item. It breaks VAT treatment and refunds.

### Checkout language

Checkout is hosted by Shopify, so its language comes from Shopify's own locale
settings, not from this app. A French site handing over to an English checkout
is worse than not translating at all. Same for the order confirmation emails.

### Product content

Product titles and descriptions come from Shopify and are **not** translated by
this codebase. That needs **Translate & Adapt** (free Shopify app), and the
Storefront queries then need the `@inContext` locale directive. Not done yet.

### Shop Pay

Enable it. It is what gives customers saved payment methods — the site cannot
vault cards itself.

### Customer tags

Professional accounts are identified by a tag on the Shopify customer (`pro`).
Whoever approves an application sets it. Nothing else marks a customer as B2B.

---

## Environment variables

`.env.example` lists them all. Three notes:

- `NEXT_PUBLIC_SITE_URL` — the address this deployment answers on, with the
  protocol and no trailing slash. Every canonical URL, the sitemap, robots.txt,
  the Open Graph image and every `@id` in the structured data are built from it.
  Unset, it falls back to Vercel's own production URL, then to localhost.

  **It also decides whether the site is indexed at all.** A `.vercel.app` or
  localhost address serves `Disallow: /` and `noindex` on every page; a real
  domain serves the normal rules. That is deliberate — indexing the temporary
  address would leave results pointing at somewhere the business is about to
  leave, and a duplicate-content problem on the domain it actually wants to rank
  on. Setting this to `https://www.moment-lab.be` is what opens the site to Google,
  and it is the only change needed to do it.

- `GEOAPIFY_API_KEY` — without it the address lookup silently falls back to the
  Brussels-only register and no address outside the Region resolves.
- `.gitignore` contains `.env*`, which also excludes `.env.example` itself, so
  it is not in the repo. Worth a `!.env.example` negation.
