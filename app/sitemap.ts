import type { MetadataRoute } from "next";
import { getMenus, getNewsArticles } from "@/lib/sanity/queries";
import {
  DEFAULT_LOCALE,
  INTL_LOCALE,
  LOCALES,
  withLocale,
  type Locale,
} from "@/lib/i18n/config";
import { routes } from "@/lib/routes";
import { absoluteUrl } from "@/lib/seo";
import { getCollections } from "@/lib/shopify/collections";
import { SHOP_FAMILIES } from "@/lib/shopify/nav-groups";

/** Brunch, Lunch, Pause: the collections behind the home's first carousel. */
const MOMENT_COLLECTIONS = ["petit-dejeuner", "salades", "pause"];

const LISTED_COLLECTIONS = new Set<string>([
  ...SHOP_FAMILIES.flatMap((family) => [family.handle, ...family.children]),
  ...MOMENT_COLLECTIONS,
]);
import { getProducts } from "@/lib/shopify/products";

type Entry = MetadataRoute.Sitemap[number];

/**
 * One page, three languages.
 *
 * The entry is listed under its French URL and carries the other two as
 * alternates, rather than being listed three times over. Both are valid to
 * Google; this keeps the file a third of the size and, more usefully, makes it
 * impossible to list a translation without also declaring what it is a
 * translation of.
 */
function localized(
  path: string,
  rest: Omit<Entry, "url" | "alternates">,
): Entry {
  return {
    url: absoluteUrl(withLocale(path, DEFAULT_LOCALE)),
    ...rest,
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((locale) => [
          INTL_LOCALE[locale],
          absoluteUrl(withLocale(path, locale)),
        ]),
      ),
    },
  };
}

/**
 * One page, one language, no alternates.
 *
 * For articles. `localized` declares three URLs as translations of one another,
 * which is true of a product or a menu page — same content, three shells — and
 * false of an article: an article is written in one language and there is no
 * Dutch counterpart to point a crawler at. Claiming otherwise sends Google to
 * a URL that 404s.
 */
function single(
  path: string,
  locale: Locale,
  rest: Omit<Entry, "url" | "alternates">,
): Entry {
  return { url: absoluteUrl(withLocale(path, locale)), ...rest };
}

/**
 * Hand-ranked rather than left at the default 0.5 — priority is only a hint,
 * but the ordering tells a crawler which pages we consider the site's front
 * door. Cart, account and sign-in are deliberately absent: they're noindex.
 */
const staticRoutes: {
  path: string;
  changeFrequency: Entry["changeFrequency"];
  priority: number;
  /** Listed in this language only. */
  contentLocale?: Locale;
}[] = [
  { path: routes.home, changeFrequency: "weekly", priority: 1 },
  { path: routes.shop, changeFrequency: "daily", priority: 0.9 },
  { path: routes.events, changeFrequency: "monthly", priority: 0.8 },
  { path: routes.coffee, changeFrequency: "monthly", priority: 0.7 },
  { path: routes.about, changeFrequency: "monthly", priority: 0.7 },
  { path: routes.contact, changeFrequency: "monthly", priority: 0.7 },
  { path: routes.faq, changeFrequency: "monthly", priority: 0.6 },
  { path: routes.proAccount, changeFrequency: "yearly", priority: 0.7 },
  { path: routes.findUs, changeFrequency: "monthly", priority: 0.6 },
  { path: routes.collaborations, changeFrequency: "monthly", priority: 0.7 },
  {
    path: routes.legal,
    changeFrequency: "yearly",
    priority: 0.2,
  },
  {
    path: routes.privacy,
    changeFrequency: "yearly",
    priority: 0.2,
  },
  {
    path: routes.cookies,
    changeFrequency: "yearly",
    priority: 0.2,
  },
  {
    path: routes.terms,
    changeFrequency: "yearly",
    priority: 0.2,
  },
  {
    path: routes.shipping,
    changeFrequency: "yearly",
    priority: 0.3,
  },
];

/**
 * A sitemap that 500s is worse than one missing a section, and the CMS is the
 * one source here that throws rather than degrading to an empty list.
 */
async function safely<T>(
  load: () => Promise<T[]>,
  label: string,
): Promise<T[]> {
  try {
    return await load();
  } catch (error) {
    console.error(`[sitemap] ${label} failed`, error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections, menus, articlesByLocale] = await Promise.all([
    // One language is enough: the sitemap lists handles, and a handle is the
    // same in all three.
    safely(() => getProducts(DEFAULT_LOCALE), "products"),
    safely(() => getCollections(DEFAULT_LOCALE), "collections"),
    // The catering menus are off the site since 27 November 2026 (redirected
    // to /events, see next.config.ts): nothing to list.
    Promise.resolve([] as Awaited<ReturnType<typeof getMenus>>),
    Promise.all(
      LOCALES.map(async (locale) => ({
        locale,
        articles: await safely(
          () => getNewsArticles(locale),
          `articles (${locale})`,
        ),
      })),
    ),
  ]);

  // `lastmod` only where something real backs it: Shopify's own edit time for
  // products and collections, the publication date for articles. Static pages
  // and menus leave it out — a sitemap that claims every page changed on every
  // rebuild teaches search engines to ignore the field altogether.
  const editedAt = (iso: string | undefined) =>
    iso ? { lastModified: new Date(iso) } : {};

  return [
    ...staticRoutes.map(({ path, changeFrequency, priority, contentLocale }) =>
      contentLocale
        ? single(path, contentLocale, { changeFrequency, priority })
        : localized(path, { changeFrequency, priority }),
    ),
    ...collections
      // Only the collections the site uses (28 November 2026): the owners'
      // families and their sub-categories, and the moments behind the home's
      // first carousel. The older ones (French names, no translation) and
      // Shopify's "frontpage" still have pages, but are not advertised.
      .filter((collection) => LISTED_COLLECTIONS.has(collection.handle))
      .map((collection) =>
        localized(routes.collection(collection.handle), {
          ...editedAt(collection.updatedAt),
          changeFrequency: "weekly",
          priority: 0.7,
        }),
      ),
    ...products.map((product) =>
      localized(routes.product(product.handle), {
        ...editedAt(product.updatedAt),
        changeFrequency: "weekly",
        priority: 0.8,
      }),
    ),
    ...menus.map((menu) =>
      localized(routes.menu(menu.slug.current), {
        changeFrequency: "monthly",
        priority: 0.8,
      }),
    ),
    // The news index only in a language that has an article (27 November
    // 2026): an empty list is not a page worth handing a search engine, and
    // the menus hide it there too (components/AboutNavProvider.tsx).
    ...articlesByLocale
      .filter(({ articles }) => articles.length > 0)
      .map(({ locale }) =>
        single(routes.news, locale, {
          changeFrequency: "weekly",
          priority: 0.6,
        }),
      ),
    ...articlesByLocale.flatMap(({ locale, articles }) =>
      articles.map((article) =>
        single(routes.newsArticle(article.slug.current), locale, {
          ...editedAt(article.publishedAt ?? undefined),
          changeFrequency: "yearly",
          priority: 0.5,
        }),
      ),
    ),
  ];
}
