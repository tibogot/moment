# Shopify admin setup

Work that happens in the Shopify admin rather than in this codebase. Some of it
the site already depends on; some is needed before launch. Kept separate from
`CLIENT-QUESTIONS.md` because these are tasks, not decisions.

---

## Already required for what is built

**Delivery closures — `delivery_closure` metaobject.**
The calendar reads the days you close from here. Settings → Custom data →
Metaobjects → a definition resolving to type `delivery_closure`, with a `date`
field of type Date. **Storefront API access must be enabled on the definition**,
or the query returns nothing and every day reads as open. A `reason` text field
is optional and ignored by the site.

**Guest checkout.** Settings → Checkout → Accounts must be **optional**. The
brief is explicit that a first order must not require an account.

**Storefront API token** needs `write_checkouts`, or carts cannot be created.

---

## Before launch

### Shipping rates must match the zone table

This is the one that will bite. The site *quotes* the fee; Shopify *charges* it,
and the two are configured in different places. If they disagree, Shopify wins
and the customer sees a different number at the last step.

Shopify's shipping zones are postcode-based, not radial, so the zone table has
to be translated into postcode lists:

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
