import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { JsonLd } from "@/components/JsonLd";
import { PortableTextContent } from "@/components/PortableTextContent";
import { SanityImage } from "@/components/SanityImage";
import TextReveal from "@/components/TextReveal";
import { REVEAL_BLOCK } from "@/lib/colors";
import { routes } from "@/lib/routes";
import { articleSchema, breadcrumbSchema, graph } from "@/lib/schema";
import { notFoundMetadata, pageMetadata, toDescription } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { formatArticleDate } from "@/lib/sanity/format";
import { urlFor } from "@/lib/sanity/image";
import type { NewsArticle } from "@/lib/sanity/types";
import {
  getNewsArticleBySlug,
  getNewsArticleSlugs,
} from "@/lib/sanity/queries";

type NewsArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getNewsArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

/** 1200x630 crop of the hero image, for the share card and Article schema. */
function shareImage(article: NewsArticle) {
  if (!article.mainImage?.asset) return null;

  return {
    url: urlFor(article.mainImage).width(1200).height(630).fit("crop").url(),
    alt: article.mainImage.alt ?? article.title,
  };
}

export async function generateMetadata({
  params,
}: NewsArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsArticleBySlug(slug);

  if (!article) return notFoundMetadata("Article not found");

  return pageMetadata({
    title: article.title,
    description:
      toDescription(article.excerpt) ??
      `${article.title} — from the Moment kitchen in Brussels.`,
    path: routes.newsArticle(slug),
    image: shareImage(article),
    type: "article",
    publishedTime: article.publishedAt,
  });
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const { slug } = await params;
  const article = await getNewsArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const category = article.categories?.[0]?.title;
  const metadataLine = [
    category,
    article.publishedAt ? formatArticleDate(article.publishedAt) : null,
    article.author?.name,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <JsonLd
        data={graph(
          articleSchema(article, { imageUrl: shareImage(article)?.url }),
          breadcrumbSchema([
            { name: "Home", path: routes.home },
            { name: "News", path: routes.news },
            { name: article.title, path: routes.newsArticle(slug) },
          ]),
        )}
      />

      <GridSection className="pt-[22svh] pb-[8svh]">
        <div className="col-start-2 col-end-5 min-w-0 px-(--grid-gutter) text-left md:col-end-8">
          {metadataLine ? (
            <TextReveal
              blockColor={REVEAL_BLOCK}
              animateOnScroll={false}
              delay={0.05}
            >
              <p className="text-[11px] uppercase tracking-wide text-black/50">
                {metadataLine}
              </p>
            </TextReveal>
          ) : null}

          <TextReveal
            blockColor={REVEAL_BLOCK}
            animateOnScroll={false}
            delay={0.15}
          >
            <h1
              className={cn(
                "font-owners-narrow-bold max-w-full text-[11vw] leading-[0.9] tracking-[-0.005em] wrap-break-word uppercase md:text-[min(8vw,12svh)]",
                metadataLine && "mt-6",
              )}
            >
              {article.title}
            </h1>
          </TextReveal>

          {article.excerpt ? (
            <TextReveal
              blockColor={REVEAL_BLOCK}
              animateOnScroll={false}
              delay={0.35}
            >
              <p className="font-archivo-light mt-[5svh] max-w-[42ch] text-[15px] leading-[1.5] text-black/70 md:text-[min(1.35vw,2svh)]">
                {article.excerpt}
              </p>
            </TextReveal>
          ) : null}
        </div>
      </GridSection>

      {article.mainImage ? (
        <div className="relative aspect-4/3 w-full overflow-hidden bg-sky/20 md:aspect-16/10">
          <SanityImage
            image={article.mainImage}
            alt={article.mainImage.alt ?? article.title}
            sizes="100vw"
            priority
          />
        </div>
      ) : null}

      {article.body?.length ? (
        <GridSection className="pb-[8svh]">
          <div className="col-start-2 col-end-5 border-t border-sky px-(--grid-gutter) pt-[6svh] md:col-end-8">
            <PortableTextContent value={article.body} />
          </div>
        </GridSection>
      ) : null}

      <GridSection className="pb-[14svh]">
        <div className="col-start-2 col-end-5 px-(--grid-gutter) md:col-end-8">
          <Link
            href={routes.news}
            className="font-owners-medium inline-block border border-sky bg-cream px-3 py-2.5 text-[11px] uppercase tracking-wide transition-colors duration-500 hover:bg-sky"
          >
            Back to news
          </Link>
        </div>
      </GridSection>

      <Footer />
    </>
  );
}
