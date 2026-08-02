import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { PortableTextContent } from "@/components/PortableTextContent";
import { SanityImage } from "@/components/SanityImage";
import TextReveal from "@/components/TextReveal";
import { REVEAL_BLOCK } from "@/lib/colors";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { formatArticleDate } from "@/lib/sanity/format";
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

export async function generateMetadata({
  params,
}: NewsArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsArticleBySlug(slug);

  if (!article) {
    return { title: "Article not found — Moment" };
  }

  return {
    title: `${article.title} — Moment`,
    description: article.excerpt?.slice(0, 160),
  };
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
