import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { NewsArticleCard } from "@/components/NewsArticleCard";
import { PageIntro } from "@/components/PageIntro";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getNewsArticles } from "@/lib/sanity/queries";
import { routes } from "@/lib/routes";
import { localizedMetadata } from "@/lib/seo";

export const generateMetadata = localizedMetadata("news", {
  path: routes.news,
});

export default async function NewsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const locale = toLocale((await params).lang);
  const [articles, dict] = await Promise.all([
    getNewsArticles(locale),
    getDictionary(locale),
  ]);

  return (
    <>
      <PageIntro title={dict.news.title} lead={dict.news.lead} />

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
              {dict.news.empty}
            </p>
          </div>
        )}
      </GridSection>

      <Footer />
    </>
  );
}
