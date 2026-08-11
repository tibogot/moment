"use client";

import { LocaleLink as Link } from "@/components/LocaleLink";
import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { useDictionary } from "@/components/LocaleProvider";
import { routes } from "@/lib/routes";

/**
 * A Client Component so it can read the dictionary from context.
 *
 * `not-found.tsx` takes no params, so there is no `lang` to load a dictionary
 * with on the server — but it renders inside the locale layout, and a server
 * component passed through a client Provider still reads its context.
 *
 * This page matters more than it used to. Articles are now served per language,
 * so asking for one in a language it was not written in lands here rather than
 * showing the wrong language's article — which the copy says out loud.
 */
export default function NewsArticleNotFound() {
  const t = useDictionary().news.notFound;

  return (
    <>
      <GridSection className="pt-[22svh] pb-[14svh]">
        <div className="col-start-2 col-end-5 space-y-6 px-(--grid-gutter) md:col-end-8">
          <h1 className="font-owners-narrow-bold text-[11vw] leading-[0.9] tracking-[-0.005em] uppercase md:text-[min(8vw,12svh)]">
            {t.title}
          </h1>
          <p className="font-archivo-light text-[15px] leading-normal text-black/70">
            {t.body}
          </p>
          <Link
            href={routes.news}
            className="font-owners-medium inline-block border border-sky bg-sky px-3 py-2.5 text-[11px] uppercase tracking-wide transition-colors duration-500 hover:bg-cream"
          >
            {t.back}
          </Link>
        </div>
      </GridSection>
      <Footer />
    </>
  );
}
