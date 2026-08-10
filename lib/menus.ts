/**
 * Catering menus — the per-person formats that are quoted rather than sold.
 *
 * A menu is not a Shopify product: it has a headcount minimum, a lead time
 * measured in weeks rather than the shop's two days, and a price that only
 * means anything once multiplied by guests. So it lives in Sanity, it renders
 * a price *band* rather than a cart button, and it converts into the quote
 * request on /contact.
 *
 * The prices below are placeholders. See PLACEHOLDER_MENUS.
 */

import type { Locale } from "./i18n/config";
import { interpolate, type Dictionary } from "./i18n/dictionaries";
import { formatMoney } from "./i18n/format";
import type { SanityImage, SanitySlug } from "./sanity/types";

/** The menus page's own copy, in the language the page is being read in. */
export type MenuCopy = Dictionary["menus"];

/**
 * What kind of service the menu is, which is the thing a visitor actually
 * chooses between — not how many columns it renders in.
 */
export const MENU_FORMATS = [
  "breakfast",
  "lunch",
  "apero",
  "buffet",
  "seated",
] as const;

export type MenuFormat = (typeof MENU_FORMATS)[number];

/** A named part of the menu — "To start", "From the oven", "To finish". */
export type MenuCourse = {
  /** Sanity's array key. Used as the React key so Visual Editing can anchor. */
  _key: string;
  title: string;
  items: string[];
};

export type Menu = {
  _id: string;
  title: string;
  slug: SanitySlug;
  format: MenuFormat;
  summary?: string;
  /** Euros per head, excluding VAT. The headline number on the card. */
  pricePerPerson: number;
  /**
   * The qualifier that keeps the headline honest — "excl. VAT and staff".
   * Free text because what it excludes differs per format.
   */
  priceNote?: string;
  minGuests: number;
  maxGuests?: number;
  /** Notice needed, in days. Distinct from the shop's delivery lead time. */
  leadTimeDays: number;
  courses?: MenuCourse[];
  /** What the per-person price covers. */
  includes?: string[];
  /** What it does not — quoted separately. */
  excludes?: string[];
  dietaryNote?: string;
  image?: SanityImage;
};

/* -------------------------------------------------------------------------- */

/**
 * The line under the price: what it takes to actually book this.
 *
 * Both halves are read from the dictionary rather than assembled from English
 * fragments. The singular and plural forms are separate keys instead of a
 * `count === 1` suffix in code, because the rule differs by language and the
 * apostrophe in "week's notice" is not something a template can add.
 */
export function formatMenuTerms(copy: MenuCopy, menu: Menu) {
  const guests = menu.maxGuests
    ? interpolate(copy.guestsRange, {
        min: menu.minGuests,
        max: menu.maxGuests,
      })
    : interpolate(copy.guestsFrom, { min: menu.minGuests });

  const weeks = menu.leadTimeDays / 7;
  const notice = Number.isInteger(weeks)
    ? interpolate(weeks === 1 ? copy.noticeWeek : copy.noticeWeeks, {
        count: weeks,
      })
    : interpolate(menu.leadTimeDays === 1 ? copy.noticeDay : copy.noticeDays, {
        count: menu.leadTimeDays,
      });

  return `${guests} · ${notice}`;
}

/**
 * The opening line of a quote request that came from a menu page, prefilled
 * into the message box on /contact.
 *
 * It states the price the visitor was shown. If the menu is repriced between
 * their reading it and the kitchen reading the mail, that discrepancy is
 * something the kitchen needs to see rather than discover at the tasting.
 */
export function menuEnquiryMessage(
  locale: Locale,
  copy: MenuCopy,
  formats: Record<MenuFormat, string>,
  menu: Menu,
) {
  return interpolate(copy.enquiry, {
    title: menu.title,
    format: formats[menu.format] ?? menu.format,
    price: formatMoney(locale, menu.pricePerPerson),
  });
}

/** Menus in the order they should be offered — cheapest format first. */
export function sortMenus(menus: Menu[]) {
  const rank = new Map(MENU_FORMATS.map((format, index) => [format, index]));
  return [...menus].sort(
    (a, b) =>
      (rank.get(a.format) ?? 99) - (rank.get(b.format) ?? 99) ||
      a.pricePerPerson - b.pricePerPerson,
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Stand-in content, used only while Sanity has no `menu` documents.
 *
 * These are plausible Brussels formats at plausible prices, not the client's.
 * Anything rendered from them is stamped with the draft notice below, in the
 * same spirit as the "Draft" lead on the shipping page — a placeholder that
 * cannot be told apart from real copy is worse than an empty page.
 *
 * Delete this array once the real menus are in the Studio; the pages fall
 * through to Sanity on their own.
 */
export const PLACEHOLDER_MENUS: Menu[] = [
  {
    _id: "placeholder-breakfast",
    title: "Morning table",
    slug: { current: "morning-table" },
    format: "breakfast",
    summary:
      "Viennoiserie out of our own oven, fruit cut that morning, and coffee set up on site.",
    pricePerPerson: 14,
    priceNote: "excl. VAT",
    minGuests: 10,
    leadTimeDays: 3,
    courses: [
      {
        _key: "breakfast-bakery",
        title: "From the oven",
        items: [
          "Croissants and pains au chocolat",
          "Seasonal fruit tart",
          "Sourdough, butter, preserves",
        ],
      },
      {
        _key: "breakfast-cold",
        title: "Alongside",
        items: [
          "Cut seasonal fruit",
          "Yoghurt with toasted oats",
          "Cold-pressed juice",
        ],
      },
    ],
    includes: ["Delivery within Brussels", "Setup", "Compostable service ware"],
    excludes: ["Staff", "Coffee equipment hire"],
    dietaryNote: "Vegetarian throughout. Vegan and gluten-free on request.",
  },
  {
    _id: "placeholder-lunch",
    title: "Desk lunch",
    slug: { current: "desk-lunch" },
    format: "lunch",
    summary:
      "A hot plate, two salads and something sweet, delivered ready to serve at the table.",
    pricePerPerson: 22,
    priceNote: "excl. VAT",
    minGuests: 8,
    leadTimeDays: 2,
    courses: [
      {
        _key: "lunch-main",
        title: "The plate",
        items: [
          "One hot dish, rotating weekly",
          "Two seasonal salads",
          "Bread from the kitchen",
        ],
      },
      {
        _key: "lunch-sweet",
        title: "To finish",
        items: ["Fruit, or a slice of whatever was baked that morning"],
      },
    ],
    includes: ["Delivery within Brussels", "Ready-to-serve platters"],
    excludes: ["Staff", "Drinks"],
    dietaryNote:
      "Tell us the count for vegetarian, vegan and gluten-free and we plate them separately.",
  },
  {
    _id: "placeholder-apero",
    title: "Apéro dînatoire",
    slug: { current: "apero-dinatoire" },
    format: "apero",
    summary:
      "Standing, walking, talking. Enough of it that nobody needs dinner afterwards.",
    pricePerPerson: 32,
    priceNote: "excl. VAT, staff and drinks",
    minGuests: 15,
    leadTimeDays: 10,
    courses: [
      {
        _key: "apero-cold",
        title: "Cold",
        items: [
          "Six cold bites per guest",
          "Charcuterie and cheese from Belgian producers",
          "Vegetables, dips, house pickles",
        ],
      },
      {
        _key: "apero-hot",
        title: "Hot",
        items: [
          "Three hot bites per guest, passed",
          "One dish from the plancha",
        ],
      },
      {
        _key: "apero-sweet",
        title: "Sweet",
        items: ["Two small sweets per guest"],
      },
    ],
    includes: ["Delivery and setup", "Platters and linen", "Clearing"],
    excludes: ["Staff", "Drinks", "Glassware hire", "Furniture"],
    dietaryNote: "Roughly a third of the bites are vegetarian as standard.",
  },
  {
    _id: "placeholder-buffet",
    title: "Long table buffet",
    slug: { current: "long-table-buffet" },
    format: "buffet",
    summary:
      "Everything out at once on one long table, refilled through the evening.",
    pricePerPerson: 45,
    priceNote: "excl. VAT and staff",
    minGuests: 20,
    leadTimeDays: 14,
    courses: [
      {
        _key: "buffet-start",
        title: "To start",
        items: ["Bread, butter, house pickles", "Two cold starters"],
      },
      {
        _key: "buffet-main",
        title: "Mains",
        items: [
          "One roast, carved on the table",
          "One fish or vegetarian main",
          "Three sides, seasonal",
        ],
      },
      {
        _key: "buffet-sweet",
        title: "To finish",
        items: ["Two desserts", "Coffee"],
      },
    ],
    includes: ["Delivery and setup", "Chafing dishes and platters", "Clearing"],
    excludes: ["Staff", "Drinks", "Tableware hire", "Furniture"],
    dietaryNote:
      "A full vegetarian main is standard. Vegan and allergen menus on request.",
  },
  {
    _id: "placeholder-seated",
    title: "Seated dinner",
    slug: { current: "seated-dinner" },
    format: "seated",
    summary:
      "Four courses, plated and served. We bring the kitchen and the floor team.",
    pricePerPerson: 75,
    priceNote: "excl. VAT, staff and drinks",
    minGuests: 12,
    maxGuests: 60,
    leadTimeDays: 21,
    courses: [
      {
        _key: "seated-one",
        title: "First",
        items: ["An amuse with the aperitif", "A cold starter, plated"],
      },
      {
        _key: "seated-two",
        title: "Main",
        items: [
          "One main, chosen at tasting",
          "A vegetarian main, cooked to the same standard",
          "Two sides",
        ],
      },
      {
        _key: "seated-three",
        title: "Last",
        items: [
          "Cheese, if you want it",
          "A dessert",
          "Coffee and petits fours",
        ],
      },
    ],
    includes: [
      "Menu tasting for two before you confirm",
      "Kitchen team on site",
      "Delivery, setup and clearing",
    ],
    excludes: [
      "Service staff",
      "Drinks",
      "Tableware and linen hire",
      "Furniture",
    ],
    dietaryNote:
      "We take the full dietary list at confirmation and cook to it, per guest.",
  },
];

/**
 * True when the page is showing PLACEHOLDER_MENUS rather than real ones, which
 * is what puts the draft notice on screen.
 */
export function isPlaceholderContent(menus: Menu[]) {
  return menus === PLACEHOLDER_MENUS;
}
