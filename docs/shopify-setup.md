# Shopify admin setup

Work that happens in the Shopify admin rather than in this codebase. Some of it
the site already depends on; some is needed before launch. Decisions still
waiting on the client are in `open-items.md`, not here.

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
| `closed_weekdays` | List of single line text | Weekdays you never deliver (none) |
| `booking_window_days` | Integer | How far ahead the calendar takes bookings (365) |
| `free_delivery_threshold` | Decimal | Fallback free-delivery threshold for a band that sets none, in euros (300) |
| `pickup_start_time` | Single line text | Collection opens, `HH:MM` (11:00) |
| `pickup_end_time` | Single line text | Collection closes, `HH:MM` (15:00) |
| `pickup_minimum_order` | Decimal | Basket minimum for collection at the atelier, in euros (100) |
| `minimum_pieces_per_product` | Integer | Fewest identical pieces each product can be ordered in, delivery or collection (4) |
| `atelier_latitude` | Decimal | Where deliveries are measured from |
| `atelier_longitude` | Decimal | — |

`closed_weekdays` takes lowercase English day names — `monday` … `sunday`. Add
them as **choices** on the field definition and the admin gives you a checklist
instead of a text box. An empty list means you deliver every day, which is
also the built-in default since 3 November 2026 (open on Sundays).

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

**Free delivery is set per band**, on `delivery_zone` below; this field is
only the fallback for a band that leaves its own threshold empty. Like every
fee on this page, each threshold has to exist in two places — see "Shipping
rates must match the zone table".

`pickup_start_time` and `pickup_end_time` are the atelier's collection window,
shown on the FAQ, the contact page and the shipping terms. Both or neither: a
new opening time against the default closing time is a window nobody chose.

**The atelier address exists in two places, and they are not the same thing.**
The *coordinates* below are here, in Shopify, because delivery pricing is
measured from them. The *postal address* — street, postcode, city — is in the
site's own code, because it is printed on the legal page and changes about as
often as the company does. Correcting one does not correct the other: move the
atelier and both need changing, or the site will quote distances from the old
building while printing the new address. Tell us when you move and we will do
both in the same sitting.

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
| `free_delivery_threshold` | Decimal | no | Basket value from which this band's delivery is free. Empty = the `delivery_settings` fallback |
| `max_distance_km` | Decimal | no | The band's outer edge |
| `brussels_region` | Boolean | no | Tick only on a zone with no radius — see below |

The built-in table is the one you gave us on 3 November 2026, so **you do not
need to create these entries unless you want to change something**:

| Zone | Distance | Fee | Minimum | Free from |
|---|---|---|---|---|
| 1 | 0–10 km | €10 | €100 | €250 |
| 2 | 10–25 km | €20 | €150 | €300 |
| 3 | 25–50 km | €35 | €250 | €400 |
| 4 | 50–70 km | €50 | €350 | €450 |

There is deliberately **no fifth entry for "> 70 km"**. A band with no price is
not a band — past the last one the site stops quoting and sends the customer to
the enquiry form, which is your "sur devis".

`max_distance_km` should be filled in on every band. Leaving it **empty** and
ticking `brussels_region` marks a zone as administrative rather than radial —
any Brussels postcode takes it whatever the distance — which is how your
*previous* table worked and how a "one flat rate inside Brussels" rule could be
set up again without a deployment. Nothing in the current table uses it.

Both are needed, on purpose. An empty radius on its own is treated as a mistake
and the entry is rejected (which sends the site back to the built-in table,
below): otherwise clearing one band's distance by accident would charge every
Brussels address that band's fee and minimum.

**One thing worth knowing about the change from the old table.** The old zone 1
was "Bruxelles" — the whole Region for €10 with a €100 minimum. The new zone 1
is a 10 km radius, and Forest is in the south-west corner of the Region, so the
north-east of Brussels (Haren, Neder-Over-Heembeek, parts of Woluwe) is now
11–14 km out and pays €20 with a €150 minimum. That is what a distance table
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
| `capacity` | Integer | no | Orders the window takes before it shows as full. Empty = 2. `0` closes it |

The built-in windows are yours — 09:00–11:00, 11:00–13:00, 13:00–15:00 — so
again, entries are only needed to change them. Order in the admin does not
matter; the site sorts them by start time. An entry that will not read is
dropped and the rest still show, unlike the zone table: a missing window costs
the customer a choice, where a missing band costs them the right price.

**Windows close themselves when full.** Two deliveries per window by default
(the owners' figure, 3 November 2026). How it works:

1. When an order is created, the `orders/create` webhook (same endpoint as the
   others, `/api/revalidate/shopify`) tags it `livraison-YYYY-MM-DD` and
   `creneau-HHMM` from its cart attributes.
2. The pickers and the checkout gate count the non-cancelled orders carrying
   that day's tag, and grey out windows at capacity. Collections are not
   counted.
3. **A phone order takes a window when you add the same two tags by hand**,
   e.g. `livraison-2026-11-07` and `creneau-0900`. Removing them, or cancelling
   the order, frees the window.

It needs:

- An app with Admin API access — scopes `read_orders`, `write_orders`,
  `read_all_orders` (without the last, orders older than 60 days are invisible
  and far-ahead bookings stop counting). Either a custom app made in the admin
  (`SHOPIFY_ADMIN_ACCESS_TOKEN`) or a Dev Dashboard app in the shop's
  organisation (`SHOPIFY_ADMIN_CLIENT_ID` + `SHOPIFY_ADMIN_CLIENT_SECRET`).
- Webhook subscriptions for `orders/create`, `orders/updated` and
  `orders/cancelled`.

Without the Admin credentials every window is offered, as before. The known
gap: two customers can both be on Shopify's payment page for the last place at
once, and both will get it. The site re-counts at "checkout", so the window is
minutes wide; your "Créneau complet ? Contactez-nous !" line stays under the
picker for the rest.

Storefront API access has to be enabled on every one of these definitions.

All the delivery metaobjects are cached until the `metaobjects/*` webhook says
they changed, with a 24-hour backstop. **Without the webhook, a change can take
a day to appear** — see "Webhooks" below.

**Webhooks.** Settings → Notifications → Webhooks, all pointing at
`https://<domain>/api/revalidate/shopify`, signing secret in
`SHOPIFY_WEBHOOK_SECRET`:

- `products/*`, `inventory_levels/update` — product pages and lists only
- `collections/*` — collections, plus the navbar (on every page)
- `metaobjects/create`, `metaobjects/update`, `metaobjects/delete` — delivery rules
- `orders/create`, `orders/updated`, `orders/cancelled` — window capacity

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
translated into postcode lists. What the site quotes, as of 3 November 2026:

| Zone | Rule | Fee | Minimum | Free from |
|---|---|---|---|---|
| 1 | 0–10 km from the atelier | €10 | €100 | €250 |
| 2 | 10–25 km | €20 | €150 | €300 |
| 3 | 25–50 km | €35 | €250 | €400 |
| 4 | 50–70 km | €50 | €350 | €450 |
| — | beyond 70 km | quote by hand | — | — |

Compute each Belgian postcode's distance from the atelier once, bucket it into
the four bands, and paste the lists into four shipping profiles. Coarse, but the
narrowest band is 10 km wide so the error is tolerable.

**Each profile needs its own free-delivery rate**: a price-based rate of €0
above that band's threshold (€250, €300, €400, €450). A profile that misses it
charges the fee on an order the site promised to deliver free.

The precise alternative is the Carrier Service API, which calculates the rate
live from our own endpoint — but it needs Shopify **Advanced or Plus**.

Do **not** add the fee as a cart line item. It breaks VAT treatment and refunds.

### Google Analytics

The site side is built (`lib/analytics.ts`): gtag loads only after the visitor
accepts analytics in the cookie banner, with Consent Mode v2 and every
advertising signal denied. It sends `view_item`, `add_to_cart`,
`begin_checkout` and `generate_lead` (contact and pro forms). Page views follow
client-side navigation through GA4's enhanced measurement.

To switch it on:

1. Vercel → Production environment → `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-43F991WPBG`,
   redeploy. The banner now appears, asking about analytics only.
2. **Purchases.** Settings → Customer events → Add custom pixel, paste
   `docs/shopify-ga4-pixel.js`, Permission "Not required" (the pixel only sends
   for visitors who accepted on the site — it needs the `_ga_client_id` cart
   attribute the site writes at checkout), Save, Connect. Do **not** also
   install the Google & YouTube app's GA4 tag, or every purchase is counted
   twice.
3. In GA4 admin:
   - Data streams → the web stream → Enhanced measurement on, "Page changes
     based on browser history events" ticked (default).
   - Data retention → **14 months** (the privacy policy says so; GA's
     default is 2).
   - Key events: `purchase` is one by default; mark `generate_lead` as well.
   - Data streams → Configure tag settings → Configure your domains: add
     `moment-lab.be` and the checkout domain, and list the checkout domain
     under "Unwanted referrals", so the return from payment is not counted as
     a new visit.
4. Place a test order, accept the banner first, and check GA4 → Realtime for
   the `purchase`.

### Checkout language

Checkout is hosted by Shopify, so its language comes from Shopify's own locale
settings, not from this app. A French site handing over to an English checkout
is worse than not translating at all. Same for the order confirmation emails.

### Product content

Product titles and descriptions come from Shopify. The site already asks for
the reader's language (`@inContext(language:)` on every catalogue and cart
query); the translations themselves are entered in **Translate & Adapt** (free
Shopify app). Untranslated products show in the shop's primary language.

### Shop Pay

Enable it. It is what gives customers saved payment methods — the site cannot
vault cards itself.

### Customer tags

Professional accounts are identified by a tag on the Shopify customer (`pro`).
Whoever approves an application sets it. Nothing else marks a customer as B2B.

---

## Environment variables

`.env.example` lists them all. Notes on the ones that bite:

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

- `SHOPIFY_ADMIN_ACCESS_TOKEN`, or `SHOPIFY_ADMIN_CLIENT_ID` +
  `SHOPIFY_ADMIN_CLIENT_SECRET` — Admin API, used only to count orders per
  delivery window. Unset, capacity is off and every window is offered.
- `GEOAPIFY_API_KEY` — without it the address lookup silently falls back to the
  Brussels-only register and no address outside the Region resolves.
