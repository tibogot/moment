import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { NewsArticleCard } from "@/components/NewsArticleCard";
import { PageIntro } from "@/components/PageIntro";
import { getNewsArticles } from "@/lib/sanity/queries";
import { routes } from "@/lib/routes";
import { localizedMetadata } from "@/lib/seo";

export const generateMetadata = localizedMetadata({
  title: "News",
  description:
    "News from Moment — what we are cooking, the events we are catering, and what is coming out of our Brussels kitchen.",
  path: routes.news,
});

export default async function NewsPage() {
  const articles = await getNewsArticles();

  return (
    <>
      <PageIntro
        title="News"
        lead="From the kitchen, the counter and the table — what we are cooking, serving and thinking about."
      />

      <GridSection className="pb-[14svh]">
        {articles.length > 0 ? (
          <ul className="col-start-2 col-end-5 grid border-t border-r border-sky md:col-end-9 md:grid-cols-3">
            {articles.map((article) => (
              <li
                key={article._id}
                className="product-card border-b border-l border-sky transition-colors duration-500"
              >
                <NewsArticleCard article={article} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="col-start-2 col-end-5 border-t border-sky px-(--grid-gutter) py-[6svh] md:col-end-8">
            <p className="font-archivo-light text-[17px] leading-normal text-black/70">
              No articles yet. Check back soon.
            </p>
          </div>
        )}
      </GridSection>

      <Footer />
    </>
  );
}
