import { LocaleLink as Link } from "@/components/LocaleLink";
import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { routes } from "@/lib/routes";

export default function NewsArticleNotFound() {
  return (
    <>
      <GridSection className="pt-[22svh] pb-[14svh]">
        <div className="col-start-2 col-end-5 space-y-6 px-(--grid-gutter) md:col-end-8">
          <h1 className="font-owners-narrow-bold text-[11vw] leading-[0.9] tracking-[-0.005em] uppercase md:text-[min(8vw,12svh)]">
            Article not found
          </h1>
          <p className="font-archivo-light text-[15px] leading-normal text-black/70">
            This article may have been removed or the link is incorrect.
          </p>
          <Link
            href={routes.news}
            className="font-owners-medium inline-block border border-sky bg-sky px-3 py-2.5 text-[11px] uppercase tracking-wide transition-colors duration-500 hover:bg-cream"
          >
            Back to news
          </Link>
        </div>
      </GridSection>
      <Footer />
    </>
  );
}
