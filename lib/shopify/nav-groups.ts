/**
 * What the shop menu offers (26 November 2026), instead of every collection
 * in the shop: a flat list of fourteen mixed product types ("Cakes"), a
 * moment ("Pause") and occasions ("Pour le bureau") for thirty products, with
 * nothing saying which was which. Two groups the brand is built on — the
 * moments of the day, as in the home's carousel tabs, and the occasions — and
 * the product types stay one click away under "Collections" and in the shop's
 * filters. A collection the owners add later does not crowd the menu.
 *
 * `label` is a key into the dictionary: `home.moments` for the moments,
 * `home.selections` for the occasions. An entry whose collection is missing
 * from the shop is simply not shown.
 */
export const SHOP_NAV_GROUPS = [
  {
    key: "byMoment",
    source: "moments",
    items: [
      { handle: "petit-dejeuner", label: "brunch" },
      { handle: "salades", label: "lunch" },
      { handle: "pause", label: "pause" },
    ],
  },
  {
    key: "byOccasion",
    source: "selections",
    items: [
      { handle: "pour-la-maison", label: "home" },
      { handle: "pour-le-bureau", label: "office" },
      { handle: "pour-les-evenements", label: "events" },
    ],
  },
] as const;
