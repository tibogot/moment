import { defineQuery } from "next-sanity";
import { sanityClient, sanityCache } from "./client";
import type { Locale } from "../i18n/config";
import type { NewsArticle, NewsArticleListItem, SanityImage } from "./types";
import { PLACEHOLDER_MENUS, sortMenus, type Menu } from "../menus";
import { DEFAULT_SITE_DETAILS, type SiteDetails } from "../site";

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
 * An article is written in one language and is not a translation of any other:
 * the schema has asked for that language since it was written, the client has
 * been filling it in, and nothing read it — so /fr/news, /nl/news and /en/news
 * served one undifferentiated pile, and the sitemap told Google the three were
 * translations of each other.
 *
 * The consequence to be clear about: a Dutch reader sees only Dutch articles,
 * and an empty page until one exists. That is correct. Showing them French is
 * not a fallback, it is a different article.
 */
export const articlesQuery = defineQuery(`*[_type == "article" && language == $language] | order(publishedAt desc) {
  ${articleListFields}
}`);

export const articleBySlugQuery = defineQuery(`*[_type == "article" && language == $language && slug.current == $slug][0] {
  ${articleListFields},
  body
}`);

export const articleSlugsQuery = defineQuery(`*[_type == "article" && language == $language && defined(slug.current)]{
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

export const menusQuery = defineQuery(`*[_type == "menu"] | order(pricePerPerson asc) {
  ${menuFields},
  ${menuCourses}
}`);

export const menuBySlugQuery = defineQuery(`*[_type == "menu" && slug.current == $slug][0] {
  ${menuFields},
  ${menuCourses}
}`);

export const menuSlugsQuery = defineQuery(`*[_type == "menu" && defined(slug.current)]{
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

/* --------------------------- Company details ----------------------------- */

/**
 * The singleton company document. Pinned by id rather than matched by type, so
 * a second one created by accident cannot win the ordering and change the VAT
 * number on the legal page.
 */
export const siteDetailsQuery = defineQuery(`*[_id == "siteSettings"][0] {
  contact,
  legal,
  socialLinks
}`);

type SiteDetailsResponse = {
  contact?: Partial<SiteDetails["contact"]> | null;
  legal?: Partial<SiteDetails["legal"]> | null;
  socialLinks?: Partial<SiteDetails["social"]> | null;
};

/**
 * A field the owners have actually answered.
 *
 * Sanity gives back `null` for a field that exists but was left alone, and the
 * Studio writes `""` when someone types into a box and deletes it again.
 * Neither is an answer, and neither must be allowed to blank out a default —
 * that is how "Brussels" becomes an empty line on the legal page.
 */
function answered(value: string | undefined | null, fallback: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function mergeSiteDetails(response: SiteDetailsResponse | null): SiteDetails {
  const defaults = DEFAULT_SITE_DETAILS;
  const { contact, legal, socialLinks } = response ?? {};

  return {
    contact: {
      street: answered(contact?.street, defaults.contact.street),
      postalCode: answered(contact?.postalCode, defaults.contact.postalCode),
      city: answered(contact?.city, defaults.contact.city),
      region: answered(contact?.region, defaults.contact.region),
      country: answered(contact?.country, defaults.contact.country),
      phone: answered(contact?.phone, defaults.contact.phone),
      email: answered(contact?.email, defaults.contact.email),
    },
    legal: {
      companyName: answered(legal?.companyName, defaults.legal.companyName),
      enterpriseNumber: answered(
        legal?.enterpriseNumber,
        defaults.legal.enterpriseNumber,
      ),
      vatNumber: answered(legal?.vatNumber, defaults.legal.vatNumber),
      legalForm: answered(legal?.legalForm, defaults.legal.legalForm),
    },
    social: {
      instagram: answered(socialLinks?.instagram, defaults.social.instagram),
      facebook: answered(socialLinks?.facebook, defaults.social.facebook),
    },
  };
}

/**
 * Never throws. These are read by the root layout, so Sanity being unreachable
 * has to cost the site a phone number in the footer, not every page on it.
 */
export async function getSiteDetails(): Promise<SiteDetails> {
  try {
    const response = await sanityClient.fetch<SiteDetailsResponse | null>(
      siteDetailsQuery,
      {},
      sanityCache("siteSettings"),
    );

    return mergeSiteDetails(response);
  } catch {
    return DEFAULT_SITE_DETAILS;
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
  heroImage { ..., "lqip": asset->metadata.lqip },
  eventsImage,
  coffeeImage
}`);

export type HomePageImages = {
  hero: (SanityImage & { lqip?: string }) | null;
  events: SanityImage | null;
  coffee: SanityImage | null;
};

const NO_HOME_IMAGES: HomePageImages = {
  hero: null,
  events: null,
  coffee: null,
};

type HomePageResponse = {
  heroImage?: (SanityImage & { lqip?: string }) | null;
  eventsImage?: SanityImage | null;
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
      hero: uploaded(response.heroImage),
      events: uploaded(response.eventsImage),
      coffee: uploaded(response.coffeeImage),
    };
  } catch {
    return NO_HOME_IMAGES;
  }
}
