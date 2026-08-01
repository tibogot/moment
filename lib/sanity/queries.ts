import { sanityClient, sanityFetchOptions } from "./client";
import type { NewsArticle, NewsArticleListItem } from "./types";

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
