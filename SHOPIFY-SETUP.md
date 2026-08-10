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
| `closed_weekdays` | List of single line text | Weekdays you never deliver (sunday) |
| `booking_window_days` | Integer | How far ahead the calendar takes bookings (365) |
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
Until they are set the site measures from the centre of 1190 Forest, which is
the right commune and the wrong building. To find them: open Google Maps, right
click the atelier's front door, and the first item in the menu is
`50.812345, 4.324567` — latitude first, longitude second. Set **both** or
neither; one new number against one placeholder is worse than two placeholders.

**Delivery zones — `delivery_zone` metaobject.**
What the trip costs, and how full the basket has to be. One entry per band.
Read the section on shipping rates below before changing a fee.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `zone_id` | Integer | yes | 1, 2, 3 … as the customer sees it |
| `fee` | Decimal | yes | Delivery fee in euros |
| `minimum_order` | Decimal | yes | Basket minimum in euros |
| `max_distance_km` | Decimal | no | The band's outer edge |

Leave `max_distance_km` **empty on the Brussels zone** — it is a region, not a
radius, and that empty field is what marks it as such. Any address with a
Brussels postcode takes that zone whatever its distance. The other bands are
matched outwards, nearest first, and the outermost one is also the point past
which the site stops quoting and sends the customer to the enquiry form.

**One bad entry discards the whole table**, on purpose, and the site falls back
to the four built-in bands with a line in the server log. A half-read table is
how a 20 km address falls through to the 50 km band and gets quoted €10 too
much; there is no safe partial answer to a price.

Storefront API access has to be enabled on both definitions too.

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
translated into postcode lists. Defaults, if nothing is configured:

| Zone | Rule | Fee | Minimum |
|---|---|---|---|
| 1 | Brussels-Capital (1000–1212) | €10 | €100 |
| 2 | 0–15 km | €15 | €125 |
| 3 | 15–30 km | €25 | €150 |
| 4 | 30–50 km | €35 | €200 |
| — | beyond 50 km | quote by hand | — |

Compute each Belgian postcode's distance from the atelier once, bucket it into
the four bands, and paste the lists into four shipping profiles. Coarse, but the
bands are 15 km wide so the error is tolerable.

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

`.env.example` lists them all. Two notes:

- `GEOAPIFY_API_KEY` — without it the address lookup silently falls back to the
  Brussels-only register and no address outside the Region resolves.
- `.gitignore` contains `.env*`, which also excludes `.env.example` itself, so
  it is not in the repo. Worth a `!.env.example` negation.
