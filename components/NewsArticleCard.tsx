import Link from "next/link";
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
    <article className="group">
      <Link
        href={routes.newsArticle(article.slug.current)}
        className="block h-full"
      >
        <div className="relative aspect-4/3 overflow-hidden bg-sky/20">
          {article.mainImage ? (
            <SanityImage
              image={article.mainImage}
              alt={article.mainImage.alt ?? article.title}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : null}
        </div>

        <div className="space-y-3 px-(--grid-gutter) py-5 text-left">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-wide text-black/50">
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

          <h2 className="font-owners-narrow-bold text-[6vw] leading-[0.95] tracking-[-0.005em] uppercase transition-opacity group-hover:opacity-60 md:text-[min(2.8vw,4.5svh)]">
            {article.title}
          </h2>

          {article.excerpt ? (
            <p className="font-archivo-light line-clamp-3 text-[15px] leading-normal text-black/70">
              {article.excerpt}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
