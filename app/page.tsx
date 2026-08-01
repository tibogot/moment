import { CalendarSection } from "@/components/CalendarSection";
import { CollectionsSection } from "@/components/CollectionsSection";
import { Footer } from "@/components/Footer";
import { FullBleedImageSection } from "@/components/FullBleedImageSection";
import { Hero } from "@/components/Hero";
import { IntroSection } from "@/components/IntroSection";
import { ServicesSection } from "@/components/ServicesSection";
import { SplitImageSection } from "@/components/SplitImageSection";
import { StickyTitleSection } from "@/components/StickyTitleSection";
import { getCollections } from "@/lib/shopify/collections";
import { getDeliveryAvailability } from "@/lib/shopify/delivery";

export default async function Home() {
  const [collections, availability] = await Promise.all([
    getCollections(),
    getDeliveryAvailability(),
  ]);

  // Shopify seeds every store with a "frontpage" collection; skip it and show
  // the first three real ones.
  const featured = collections
    .filter((collection) => collection.handle !== "frontpage")
    .slice(0, 3);

  return (
    <>
      <Hero />
      <IntroSection />

      {/* Image fills the left half — 3 columns x 3 rows — with the right half
          left as bare grid. The second reprises it smaller, on the right.
          On mobile the grid runs taller so each image reads at a useful size. */}
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

      <CollectionsSection collections={featured} />

      <StickyTitleSection
        label="The kitchen"
        title="Cooked the morning it is eaten."
        src="/images/dan-smedley.jpg"
      />

      <StickyTitleSection
        theme="sky"
        imagePosition="left"
        label="Delivery"
        title="Prepared at dawn, served by lunch."
        src="/images/william-king.jpg"
      />

      <ServicesSection />

      {/* Full-height breath between the services index and the calendar. */}
      <FullBleedImageSection src="/images/svitlana.jpg" />

      <CalendarSection availability={availability} />
      <Footer />
    </>
  );
}
