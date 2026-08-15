import type {
  ArticleBySlugQueryResult,
  ArticlesQueryResult,
  HomePageQueryResult,
} from "@/sanity.types";

/**
 * The shapes the site reads out of Sanity — derived from `sanity.types.ts`,
 * which `npm run typegen` writes from the schema and the GROQ queries
 * themselves. Nothing here is hand-maintained any more.
 *
 * That matters because GROQ is a string. Rename `excerpt` to `summary` in the
 * schema and the query keeps asking for `excerpt`; Sanity answers `undefined`
 * without complaint, and a hand-written type would go on promising a `string`.
 * The page renders blank and nobody hears about it until the client does. Now
 * the rename is a compile error.
 *
 * The names below are the site's own vocabulary rather than the generated
 * `XxxQueryResult` ones: components care that a thing is an article, not which
 * query fetched it.
 *
 * These are generated with `--enforce-required-fields`, so a field the schema
 * marks `required()` is typed as present rather than optional. True for scalars
 * on a published document, and this client only ever reads published documents
 * — there is no draft perspective. **Dereferences are the exception**: `author`
 * and `categories` are required *references*, but the document on the far end
 * can be deleted while an article still points at it, in which case Sanity
 * returns null. Keep the optional chaining on those two.
 */

/** One article in a list — everything but the body. */
export type NewsArticleListItem = ArticlesQueryResult[number];

/** A single article, body included. Null when the slug matches nothing. */
export type NewsArticle = NonNullable<ArticleBySlugQueryResult>;

/**
 * An image the client can describe, which is to say one whose schema carries an
 * `alt` field: an article's `mainImage`, a menu's photo, a picture dropped into
 * body copy.
 *
 * The distinction below is not bookkeeping. The old hand-written type gave
 * every image an optional `alt`, which quietly covered two different schema
 * shapes and let `image.alt` be read off images that have no such field. It
 * happened to be harmless — the home page panels pass `alt=""` deliberately,
 * since those photographs are decorative — but nothing was stopping the next
 * one from being harmful. TypeGen turned it into a compile error the moment the
 * types came from the schema instead of from memory.
 */
export type SanityImage = NewsArticleListItem["mainImage"];

/**
 * An image with no `alt` field to read — the three home page photographs. They
 * are decorative by design and their components render `alt=""`, so the schema
 * never asks the client to describe them. Give one an `alt` field and this type
 * collapses into `SanityImage`.
 */
export type SanityDecorativeImage = NonNullable<
  NonNullable<HomePageQueryResult>["eventsImage"]
>;

/** A slug field. */
export type SanitySlug = NewsArticleListItem["slug"];
