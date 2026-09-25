"use client";

import { useEffect } from "react";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { GridSection } from "@/components/GridSection";
import { PageIntro } from "@/components/PageIntro";
import { useDictionary } from "@/components/LocaleProvider";
import { routes } from "@/lib/routes";

/**
 * What a page shows when something under it throws — Shopify or Sanity down on
 * a render that could not fall back, most likely.
 *
 * Inside the language layout, so the navbar stays and the copy is in the
 * visitor's language. Without it, the visitor got Next's bare default screen in
 * English. The layout itself failing is `app/global-error.tsx`'s job.
 */
export default function LocaleError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const t = useDictionary().common.error;

  // The digest is what matches this screen to the server log line.
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <PageIntro title={t.eyebrow} lead={t.lead} />

      <GridSection className="pb-[14svh]">
        <div className="col-start-2 col-end-5 flex flex-wrap gap-4 px-(--grid-gutter) md:col-start-5 md:col-end-8">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="group border border-sky bg-sky px-3 py-2.5 transition-colors duration-500 hover:bg-cream"
          >
            <span className="font-owners-medium inline-flex items-center gap-2 text-[11px] tracking-wide uppercase">
              {t.retry}
              <span
                className="transition-transform duration-500 group-hover:translate-x-1.5"
                aria-hidden
              >
                &rarr;
              </span>
            </span>
          </button>

          <Link
            href={routes.home}
            className="font-owners-medium border border-sky px-3 py-2.5 text-[11px] tracking-wide uppercase transition-colors duration-500 hover:bg-sky"
          >
            {t.back}
          </Link>
        </div>
      </GridSection>
    </>
  );
}
