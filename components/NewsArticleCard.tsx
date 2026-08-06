import { LocaleLink as Link } from "@/components/LocaleLink";
import { SanityImage } from "@/components/SanityImage";
import { formatArticleDate } from "@/lib/sanity/format";
import { routes } from "@/lib/routes";
import type { NewsArticleListItem } from "@/lib/sanity/types";

type NewsArticleCardProps = {
  article: NewsArticleListItem;
};

export function NewsArticleCard({ article }: NewsArticleCardProps) {
  const category = article.categories?.[0]?.title;

  return (
    <article>
      <Link
        href={routes.newsArticle(article.slug.current)}
        className="group block h-full"
      >
        <div className="product-card__image relative aspect-4/3 overflow-hidden">
          {article.mainImage ? (
            <SanityImage
              image={article.mainImage}
              alt={article.mainImage.alt ?? article.title}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          ) : null}
        </div>

        <div className="space-y-3 px-(--grid-gutter) py-5 text-left">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] uppercase tracking-wide text-black/50">
            {category ? <span>{category}</span> : null}
            {category && article.publishedAt ? (
              <span aria-hidden="true">·</span>
            ) : null}
            {article.publishedAt ? (
              <time dateTime={article.publishedAt}>
                {formatArticleDate(article.publishedAt)}
              </time>
            ) : null}
          </div>

          <h2 className="font-owners-narrow-bold text-[6vw] leading-[0.95] tracking-[-0.005em] uppercase md:text-[min(2.8vw,4.5svh)]">
            {article.title}
          </h2>

          {article.excerpt ? (
            <p className="font-archivo-light line-clamp-3 text-[17px] leading-normal text-black/70">
              {article.excerpt}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
