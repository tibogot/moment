import { Footer } from "@/components/Footer";
import { PageIntro } from "@/components/PageIntro";
import { SplitImageSection } from "@/components/SplitImageSection";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { localizedMetadata } from "@/lib/seo";

export const generateMetadata = localizedMetadata("events", {
  path: routes.events,
});

export default async function EventsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const dict = await getDictionary(toLocale((await params).lang));

  return (
    <>
      <PageIntro
        title={dict.pageIntro.events.title}
        lead={dict.pageIntro.events.lead}
      />

      {/* Same split grid as home — parked here so it stays visible while the
          home page drops it. Image fills the left half (3 × 3), with a
          smaller answer on the right; mobile grid runs taller. */}
      <SplitImageSection
        src="/images/anita-austvika.jpg"
        alt=""
        colStart={1}
        colSpan={3}
        mobile={{
          rows: 5,
          colStart: 1,
          colSpan: 5,
          rowStart: 1,
          rowSpan: 4,
        }}
      />
      <SplitImageSection
        src="/images/kateryna-hliznitsova.jpg"
        alt=""
        colStart={5}
        colSpan={2}
        rowStart={1}
        rowSpan={2}
        mobile={{
          rows: 4,
          colStart: 3,
          colSpan: 4,
          rowStart: 1,
          rowSpan: 3,
        }}
        continueGrid
        fullBleedBottom
      />

      <Footer />
    </>
  );
}
