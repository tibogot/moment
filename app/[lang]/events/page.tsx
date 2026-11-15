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
        {/* Two photographs staggered as before, each as many rows as columns
            so both are 3/4 portraits:
              mobile 4 × 8    1–4 · 1–4      2–4 · 5–7
              tablet 6 × 6    1–3 · 1–3      4–6 · 3–5
              desktop 8 × 7   1–4 · 1–4      6–8 · 4–6 */}
        {/* One section: title and lead, then the photographs in the cells,
            a single rule between them. */}
        <PhotoGridSection
          header={
            <PageIntroContent
              title={dict.pageIntro.events.title}
              lead={dict.pageIntro.events.lead}
            />
          }
          rowsClassName="[--rows:8] md:[--rows:6] lg:[--rows:7]"
          photos={[
            {
              src: "/images/anita-austvika.jpg",
              alt: "",
              className:
                "col-[2/span_4] row-[1/span_4] md:col-[2/span_3] md:row-[1/span_3] lg:col-[2/span_4] lg:row-[1/span_4]",
            },
            {
              src: "/images/kateryna-hliznitsova.jpg",
              alt: "",
              className:
                "col-[3/span_3] row-[5/span_3] md:col-[5/span_3] md:row-[3/span_3] lg:col-[7/span_3] lg:row-[4/span_3]",
            },
          ]}
        />
      </div>

      <Footer />
    </>
  );
}
