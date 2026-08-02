import { sanityClient, sanityFetchOptions } from "./client";
import type { NewsArticle, NewsArticleListItem } from "./types";
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

export const articlesQuery = `*[_type == "article"] | order(publishedAt desc) {
  ${articleListFields}
}`;

export const articleBySlugQuery = `*[_type == "article" && slug.current == $slug][0] {
  ${articleListFields},
  body
}`;

export const articleSlugsQuery = `*[_type == "article" && defined(slug.current)]{
  "slug": slug.current
}`;

export async function getNewsArticles(): Promise<NewsArticleListItem[]> {
  return sanityClient.fetch<NewsArticleListItem[]>(
    articlesQuery,
    {},
    sanityFetchOptions,
  );
}

export async function getNewsArticleBySlug(
  slug: string,
): Promise<NewsArticle | null> {
  return sanityClient.fetch<NewsArticle | null>(
    articleBySlugQuery,
    { slug },
    sanityFetchOptions,
  );
}

export async function getNewsArticleSlugs(): Promise<string[]> {
  const rows = await sanityClient.fetch<{ slug: string }[]>(
    articleSlugsQuery,
    {},
    sanityFetchOptions,
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

export const menusQuery = `*[_type == "menu"] | order(pricePerPerson asc) {
  ${menuFields},
  ${menuCourses}
}`;

export const menuBySlugQuery = `*[_type == "menu" && slug.current == $slug][0] {
  ${menuFields},
  ${menuCourses}
}`;

export const menuSlugsQuery = `*[_type == "menu" && defined(slug.current)]{
  "slug": slug.current
}`;

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
      sanityFetchOptions,
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
      sanityFetchOptions,
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
      sanityFetchOptions,
    );

    return menu ?? fallback();
  } catch {
    return fallback();
  }
}
