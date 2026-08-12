import { Footer } from "@/components/Footer";
import { PageIntro } from "@/components/PageIntro";
import { SplitImageSection } from "@/components/SplitImageSection";
import { routes } from "@/lib/routes";
import { localizedMetadata } from "@/lib/seo";

export const generateMetadata = localizedMetadata("events", {
  path: routes.events,
});

export default function EventsPage() {
  return (
    <>
      <PageIntro
        title="Events"
        lead="From a twenty-person launch to a seated dinner. We handle the menu, the service and everything that has to happen before the doors open."
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
