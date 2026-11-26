import { defineQuery } from "next-sanity";
import { sanityClient, sanityCache } from "./client";
import type { Locale } from "../i18n/config";
import type { LocaleString } from "./locale";
import type { NewsArticle, NewsArticleListItem, SanityImage } from "./types";
import type { PastEvent } from "../events";
import { PLACEHOLDER_MENUS, sortMenus, type Menu } from "../menus";

const articleListFields = `
  _id,
  title,
  slug,
  publishedAt,
  excerpt,
  mainImage,
  author->{ name },
  categories[]->{ title }
`;

/**
 * Every article query filters on `language`.
 *
 * An article is written in one language and is not a translation of any other.
 * Without the filter, /fr/news, /nl/news and /en/news would serve one
 * undifferentiated pile, and the sitemap would tell Google the three were
 * translations of each other.
 *
 * The consequence to be clear about: a Dutch reader sees only Dutch articles,
 * and an empty page until one exists. That is correct. Showing them French is
 * not a fallback, it is a different article.
 */
export const articlesQuery =
  defineQuery(`*[_type == "article" && language == $language] | order(publishedAt desc) {
  ${articleListFields}
}`);

export const articleBySlugQuery =
  defineQuery(`*[_type == "article" && language == $language && slug.current == $slug][0] {
  ${articleListFields},
  body
}`);

export const articleSlugsQuery =
  defineQuery(`*[_type == "article" && language == $language && defined(slug.current)]{
  "slug": slug.current
}`);

export async function getNewsArticles(
  language: Locale,
): Promise<NewsArticleListItem[]> {
  return sanityClient.fetch<NewsArticleListItem[]>(
    articlesQuery,
    { language },
    sanityCache("article", "author", "category"),
  );
}

export async function getNewsArticleBySlug(
  language: Locale,
  slug: string,
): Promise<NewsArticle | null> {
  return sanityClient.fetch<NewsArticle | null>(
    articleBySlugQuery,
    { language, slug },
    sanityCache("article", "author", "category"),
  );
}

export async function getNewsArticleSlugs(language: Locale): Promise<string[]> {
  const rows = await sanityClient.fetch<{ slug: string }[]>(
    articleSlugsQuery,
    { language },
    sanityCache("article"),
  );

  return rows.map((row) => row.slug).filter(Boolean);
}

/* ------------------------------- Menus ---------------------------------- */

const menuFields = `
  _id,
  title,
  slug,
  format,
  summary,
  pricePerPerson,
  priceNote,
  minGuests,
  maxGuests,
  leadTimeDays,
  includes,
  excludes,
  dietaryNote,
  image
`;

/**
 * The translated fields come back whole — `{ fr, nl, en }` — and `resolveMenu`
 * in `lib/menus.ts` flattens them into one language at the page. Projecting a
 * single language here instead would push the fallback rule into GROQ, where it
 * cannot be tested and has to be repeated in three queries.
 *
 * `_key` is projected on every course: it is what the course list uses as its
 * React key, and what Visual Editing needs to anchor a click back to the array
 * item in the Studio.
 */
const menuCourses = `
  courses[]{
    _key,
    title,
    items
  }
`;

export const menusQuery =
  defineQuery(`*[_type == "menu"] | order(pricePerPerson asc) {
  ${menuFields},
  ${menuCourses}
}`);

export const menuBySlugQuery =
  defineQuery(`*[_type == "menu" && slug.current == $slug][0] {
  ${menuFields},
  ${menuCourses}
}`);

export const menuSlugsQuery =
  defineQuery(`*[_type == "menu" && defined(slug.current)]{
  "slug": slug.current
}`);

/**
 * Every menu, sorted by format. Falls back to PLACEHOLDER_MENUS while the
 * Studio has none — the pages check with `isPlaceholderContent` and show the
 * draft notice, so the stand-in content never passes for the real thing.
 *
 * A Sanity outage returns the placeholders too. A menus page that renders is
 * worth more here than one that 500s, and the notice makes it self-describing.
 */
export async function getMenus(): Promise<Menu[]> {
  try {
    const menus = await sanityClient.fetch<Menu[]>(
      menusQuery,
      {},
      sanityCache("menu"),
    );

    return menus?.length ? sortMenus(menus) : PLACEHOLDER_MENUS;
  } catch {
    return PLACEHOLDER_MENUS;
  }
}

/**
 * Slugs for `generateStaticParams`. The placeholder slugs are folded in so the
 * stand-in menu pages are prerendered too — otherwise /menus links to five
 * routes that only exist at request time.
 */
export async function getMenuSlugs(): Promise<string[]> {
  const placeholders = PLACEHOLDER_MENUS.map((menu) => menu.slug.current);

  try {
    const rows = await sanityClient.fetch<{ slug: string }[]>(
      menuSlugsQuery,
      {},
      sanityCache("menu"),
    );

    const slugs = rows.map((row) => row.slug).filter(Boolean);
    return slugs.length ? slugs : placeholders;
  } catch {
    return placeholders;
  }
}

export async function getMenuBySlug(slug: string): Promise<Menu | null> {
  const fallback = () =>
    PLACEHOLDER_MENUS.find((menu) => menu.slug.current === slug) ?? null;

  try {
    const menu = await sanityClient.fetch<Menu | null>(
      menuBySlugQuery,
      { slug },
      sanityCache("menu"),
    );

    return menu ?? fallback();
  } catch {
    return fallback();
  }
}

/* ----------------------------- Past events -------------------------------- */

/**
 * `images` comes back whole rather than projected field by field: the page
 * needs `asset`, `hotspot` and `crop` for `urlFor()` to honour the crop the
 * client set, and `alt`, and `_key` for the React key. Naming them individually
 * would be the same list with more chances to forget one.
 *
 * Both references are dereferenced to the least that is useful. `language` is
 * projected off the article because an article exists in one language only —
 * see `articlesQuery` above — so a French write-up must not surface as a link
 * on the Dutch page.
 */
const pastEventFields = `
  _id,
  occasion,
  guests,
  commune,
  venue,
  date,
  client,
  note,
  featured,
  images,
  menu->{ title, "slug": slug.current },
  article->{ title, language, "slug": slug.current }
`;

/**
 * `coalesce(featured, false)` rather than a bare `featured desc`: GROQ's total
 * ordering puts null after false when descending, so an event saved before the
 * boolean had a default would jump behind every unfeatured one regardless of
 * its date.
 *
 * The `defined()` guard is for the same class of problem. The schema requires a
 * photograph, but validation lives in the Studio, and a document that reached
 * the dataset another way would otherwise render a caption with a hole where
 * the picture goes.
 */
export const pastEventsQuery =
  defineQuery(`*[_type == "pastEvent" && defined(images[0].asset)] | order(coalesce(featured, false) desc, date desc) {
  ${pastEventFields}
}`);

/**
 * The events we have already catered, newest first, pinned ones ahead of them.
 *
 * Returns `[]` when there are none and `[]` when Sanity is unreachable, and the
 * distinction is deliberately not offered to the caller: the page renders
 * nothing in either case. There is no placeholder set here, unlike menus — a
 * stand-in menu shows a shape the client can correct, while a stand-in
 * reference is a claim to have catered an event that never happened.
 *
 * `limit` is applied here rather than in GROQ so the count lives next to the
 * page that chose it.
 */
export async function getPastEvents(limit?: number): Promise<PastEvent[]> {
  try {
    const events = await sanityClient.fetch<PastEvent[]>(
      pastEventsQuery,
      {},
      // Tagged with what it dereferences as well as what it selects: renaming a
      // menu has to rebuild the pages that print its name.
      sanityCache("pastEvent", "menu", "article"),
    );

    const rows = events ?? [];
    return typeof limit === "number" ? rows.slice(0, limit) : rows;
  } catch {
    return [];
  }
}

/* ----------------------------- Home page --------------------------------- */

/**
 * The home page's photographs.
 *
 * `lqip` is a tiny base64 preview Sanity stores with every asset. It is what
 * lets the hero keep its blur-up: the static import it falls back to gets one
 * from Next at build time, and without this a Sanity-served hero would pop in
 * grey instead.
 */
export const homePageQuery = defineQuery(`*[_id == "homePage"][0] {
  heroHeadline,
  heroLead,
  heroImage { ..., "lqip": asset->metadata.lqip },
  kitchenImage,
  deliveryImage,
  hostingImage,
  eventsImage,
  companiesImage,
  coffeeImage
}`);

export type HomePageImages = {
  /** The hero's two texts, untouched: the page picks the language. */
  heroHeadline: LocaleString | null;
  heroLead: LocaleString | null;
  hero: (SanityImage & { lqip?: string }) | null;
  kitchen: SanityImage | null;
  delivery: SanityImage | null;
  hosting: SanityImage | null;
  events: SanityImage | null;
  companies: SanityImage | null;
  coffee: SanityImage | null;
};

const NO_HOME_IMAGES: HomePageImages = {
  heroHeadline: null,
  heroLead: null,
  hero: null,
  kitchen: null,
  delivery: null,
  hosting: null,
  events: null,
  companies: null,
  coffee: null,
};

type HomePageResponse = {
  heroHeadline?: LocaleString | null;
  heroLead?: LocaleString | null;
  heroImage?: (SanityImage & { lqip?: string }) | null;
  kitchenImage?: SanityImage | null;
  deliveryImage?: SanityImage | null;
  hostingImage?: SanityImage | null;
  eventsImage?: SanityImage | null;
  companiesImage?: SanityImage | null;
  coffeeImage?: SanityImage | null;
};

/** An image field with nothing uploaded into it yet is `{}`, not null. */
function uploaded<T extends SanityImage>(image: T | null | undefined) {
  return image?.asset ? image : null;
}

/**
 * Never throws, and never blocks the home page on Sanity: anything missing
 * leaves the built-in photographs in place, which is also what a shop with no
 * `homePage` document sees.
 */
export async function getHomePageImages(): Promise<HomePageImages> {
  try {
    const response = await sanityClient.fetch<HomePageResponse | null>(
      homePageQuery,
      {},
      sanityCache("homePage"),
    );

    if (!response) return NO_HOME_IMAGES;

    return {
      heroHeadline: response.heroHeadline ?? null,
      heroLead: response.heroLead ?? null,
      hero: uploaded(response.heroImage),
      kitchen: uploaded(response.kitchenImage),
      delivery: uploaded(response.deliveryImage),
      hosting: uploaded(response.hostingImage),
      events: uploaded(response.eventsImage),
      companies: uploaded(response.companiesImage),
      coffee: uploaded(response.coffeeImage),
    };
  } catch {
    return NO_HOME_IMAGES;
  }
}

/* --------------------------- Comment ça marche ---------------------------- */

/**
 * The /faq page's steps and questions, in three languages each. Hidden
 * questions are filtered here so nothing downstream has to remember to.
 */
export const faqPageQuery = defineQuery(`*[_id == "faqPage"][0] {
  steps[]{ _key, title, body },
  "questions": questions[hidden != true]{ _key, question, answer }
}`);

export type FaqPageContent = {
  steps: { _key: string; title?: LocaleString; body?: LocaleString }[];
  questions: {
    _key: string;
    question?: LocaleString;
    answer?: LocaleString;
  }[];
};

/**
 * Null when there is nothing to show — no document, a Sanity outage — and the
 * page falls back to the dictionary texts. Never throws: a help page that 500s
 * is worse than one showing last month's wording.
 */
export async function getFaqPage(): Promise<FaqPageContent | null> {
  try {
    const response = await sanityClient.fetch<Partial<FaqPageContent> | null>(
      faqPageQuery,
      {},
      sanityCache("faqPage"),
    );
    if (!response) return null;
    return {
      steps: response.steps ?? [],
      questions: response.questions ?? [],
    };
  } catch {
    return null;
  }
}

/**
 * Every partner the owners have left visible, by name. The coordinates are
 * resolved from the address afterwards, in `lib/partners.ts` — the query only
 * returns what was typed.
 */
export const partnersQuery =
  defineQuery(`*[_type == "partner" && visible != false] | order(name asc) {
  _id,
  name,
  kind,
  street,
  postalCode,
  city,
  url,
  location
}`);

export async function getPartnerDocuments() {
  return sanityClient.fetch(partnersQuery, {}, sanityCache("partner"));
}

/**
 * Published customer reviews for the home page, in the owners' order: those
 * with a number first (1, 2…), then the rest, newest first. Twelve at most —
 * the carousel shows four at a time on desktop.
 */
export const testimonialsQuery =
  defineQuery(`*[_type == "testimonial" && visible != false && defined(quote.fr) && defined(name)] | order(coalesce(order, 9999) asc, _createdAt desc)[0...12] {
  _id,
  quote,
  name,
  company
}`);

export type TestimonialContent = {
  _id: string;
  quote: LocaleString;
  name: string;
  company: string | null;
};

export async function getTestimonials(): Promise<TestimonialContent[]> {
  try {
    const docs = await sanityClient.fetch<TestimonialContent[] | null>(
      testimonialsQuery,
      {},
      sanityCache("testimonial"),
    );
    return docs ?? [];
  } catch {
    // No reviews readable: the section simply does not appear.
    return [];
  }
}

/**
 * "Infos pratiques" — phone, e-mail, hours, social accounts — or null when the
 * document has never been published (the site then uses lib/site.ts). See
 * sanity/schemaTypes/documents/practicalInfo.ts for why it wins whole.
 */
export const practicalInfoQuery = defineQuery(`*[_id == "practicalInfo"][0] {
  phone,
  email,
  opensAt,
  closesAt,
  openDays,
  instagram,
  facebook
}`);

export type PracticalInfo = {
  phone: string;
  email: string;
  opensAt: string;
  closesAt: string;
  openDays: string[];
  instagram: string | null;
  facebook: string | null;
};

export async function getPracticalInfo(): Promise<PracticalInfo | null> {
  try {
    const doc = await sanityClient.fetch<Partial<PracticalInfo> | null>(
      practicalInfoQuery,
      {},
      sanityCache("practicalInfo"),
    );
    // Required in the Studio; a document missing them is a draft that never
    // validated, not an answer — fall back rather than print blanks.
    if (!doc?.phone || !doc.email || !doc.opensAt || !doc.closesAt) {
      return null;
    }
    return {
      phone: doc.phone,
      email: doc.email,
      opensAt: doc.opensAt,
      closesAt: doc.closesAt,
      openDays: doc.openDays ?? [],
      instagram: doc.instagram ?? null,
      facebook: doc.facebook ?? null,
    };
  } catch {
    // Sanity unreachable: the code's values, never a page without a phone.
    return null;
  }
}

/**
 * The announcement bar, or null when it is switched off or empty. Read by the
 * root layout, so it is on every page; the `announcement` tag lets a publish
 * in the Studio reach all of them at once.
 */
export const announcementQuery =
  defineQuery(`*[_id == "announcement" && enabled == true][0] {
  message,
  linkLabel,
  linkUrl
}`);

export type AnnouncementContent = {
  message: LocaleString;
  linkLabel?: LocaleString | null;
  linkUrl?: string | null;
};

export async function getAnnouncement(): Promise<AnnouncementContent | null> {
  try {
    const response =
      await sanityClient.fetch<Partial<AnnouncementContent> | null>(
        announcementQuery,
        {},
        sanityCache("announcement"),
      );
    if (!response?.message) return null;
    return {
      message: response.message,
      linkLabel: response.linkLabel ?? null,
      linkUrl: response.linkUrl ?? null,
    };
  } catch {
    // A banner that cannot be read is a banner not shown — never a broken page.
    return null;
  }
}
