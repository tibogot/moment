import { Footer } from "@/components/Footer";
import { PageIntroContent } from "@/components/v2/PageIntroGrid";
import { PhotoGridSection } from "@/components/v2/PhotoGridSection";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { localizedMetadata } from "@/lib/seo";

export const generateMetadata = localizedMetadata("events", {
  path: routes.events,
});

/**
 * The first page moved onto the v2 grid (15 November 2026): same title, lead
 * and photographs as before, placed in the brand's portrait cells. The
 * footer is still the current one until its v2 version replaces it.
 */
export default async function EventsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const dict = await getDictionary(toLocale((await params).lang));

  return (
    <>
      <div className="v2">
        {/* Two photographs staggered, each as many rows as columns so both
            are 3/4 portraits, on the page grid (16 / 12 / 4 cells, like the
            home and the FAQ). Cells, columns · rows:
              mobile 4 × 8     1–4 · 1–4       2–4 · 5–7
              tablet 12 × 12   1–6 · 1–6       7–12 · 5–10
              desktop 16 × 14  1–8 · 1–8       11–16 · 7–12 */}
        {/* One section: title and lead, then the photographs in the cells,
            a single rule between them. */}
        <PhotoGridSection
          header={
            <PageIntroContent
              title={dict.pageIntro.events.title}
              lead={dict.pageIntro.events.lead}
            />
          }
          rowsClassName="[--rows:8] md:[--rows:12] lg:[--rows:14]"
          photos={[
            {
              src: "/images/anita-austvika.jpg",
              alt: "",
              className:
                "col-[2/span_4] row-[1/span_4] md:col-[2/span_6] md:row-[1/span_6] lg:col-[2/span_8] lg:row-[1/span_8]",
            },
            {
              src: "/images/kateryna-hliznitsova.jpg",
              alt: "",
              className:
                "col-[3/span_3] row-[5/span_3] md:col-[8/span_6] md:row-[5/span_6] lg:col-[12/span_6] lg:row-[7/span_6]",
            },
          ]}
        />
      </div>

      <Footer />
    </>
  );
}
