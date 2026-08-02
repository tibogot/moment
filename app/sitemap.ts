import type { MetadataRoute } from "next";
import { getNewsArticles } from "@/lib/sanity/queries";
import { routes } from "@/lib/routes";
import { absoluteUrl } from "@/lib/seo";
import { getCollections } from "@/lib/shopify/collections";
import { getProducts } from "@/lib/shopify/products";

type Entry = MetadataRoute.Sitemap[number];

/**
 * Hand-ranked rather than left at the default 0.5 — priority is only a hint,
 * but the ordering tells a crawler which pages we consider the site's front
 * door. Cart, account and sign-in are deliberately absent: they're noindex.
 */
const staticRoutes: { path: string; changeFrequency: Entry["changeFrequency"]; priority: number }[] = [
  { path: routes.home, changeFrequency: "weekly", priority: 1 },
  { path: routes.shop, changeFrequency: "daily", priority: 0.9 },
  { path: routes.collections, changeFrequency: "weekly", priority: 0.8 },
  { path: routes.events, changeFrequency: "monthly", priority: 0.8 },
  { path: routes.coffee, changeFrequency: "monthly", priority: 0.7 },
  { path: routes.about, changeFrequency: "monthly", priority: 0.7 },
  { path: routes.contact, changeFrequency: "monthly", priority: 0.7 },
  { path: routes.news, changeFrequency: "weekly", priority: 0.6 },
  { path: routes.legal, changeFrequency: "yearly", priority: 0.2 },
  { path: routes.privacy, changeFrequency: "yearly", priority: 0.2 },
  { path: routes.cookies, changeFrequency: "yearly", priority: 0.2 },
  { path: routes.terms, changeFrequency: "yearly", priority: 0.2 },
  { path: routes.shipping, changeFrequency: "yearly", priority: 0.3 },
];

/**
 * A sitemap that 500s is worse than one missing a section, and the CMS is the
 * one source here that throws rather than degrading to an empty list.
 */
async function safely<T>(load: () => Promise<T[]>, label: string): Promise<T[]> {
  try {
    return await load();
  } catch (error) {
    console.error(`[sitemap] ${label} failed`, error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections, articles] = await Promise.all([
    safely(getProducts, "products"),
    safely(getCollections, "collections"),
    safely(getNewsArticles, "articles"),
  ]);

  const now = new Date();

  return [
    ...staticRoutes.map(({ path, changeFrequency, priority }) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency,
      priority,
    })),
    ...collections
      // Shopify seeds every store with a "frontpage" collection; it has no page
      // of its own worth surfacing.
      .filter((collection) => collection.handle !== "frontpage")
      .map((collection) => ({
        url: absoluteUrl(routes.collection(collection.handle)),
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ...products.map((product) => ({
      url: absoluteUrl(routes.product(product.handle)),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...articles.map((article) => ({
      url: absoluteUrl(routes.newsArticle(article.slug.current)),
      lastModified: article.publishedAt ? new Date(article.publishedAt) : now,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
