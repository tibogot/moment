import type { Metadata } from "next";
import { CalendarSection } from "@/components/CalendarSection";
import { CollectionsSection } from "@/components/CollectionsSection";
import { Footer } from "@/components/Footer";
import { FullBleedImageSection } from "@/components/FullBleedImageSection";
import { Hero } from "@/components/Hero";
import { IntroSection } from "@/components/IntroSection";
import { JsonLd } from "@/components/JsonLd";
import { ServicesSection } from "@/components/ServicesSection";
import { SplitImageSection } from "@/components/SplitImageSection";
import { StickyTitleSection } from "@/components/StickyTitleSection";
import { WhyUsSection } from "@/components/WhyUsSection";
import { routes } from "@/lib/routes";
import { siteGraph } from "@/lib/schema";
import { getCollections } from "@/lib/shopify/collections";
import { getDeliveryAvailability } from "@/lib/shopify/delivery";
import { siteConfig } from "@/lib/site";

/**
 * The home page keeps an absolute title rather than the "%s — Moment"
 * template: it's the one page where the brand name leads.
 */
export const metadata: Metadata = {
  alternates: { canonical: routes.home },
  keywords: [
    "traiteur Brussels",
    "catering Brussels",
    "corporate catering Brussels",
    "event catering Brussels",
    "lunch delivery Brussels",
    "cold-pressed juice Brussels",
  ],
  description: siteConfig.description,
};

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
      {/* Defines the organisation, website and business nodes the rest of the
          site's structured data refers back to by @id. */}
      <JsonLd data={siteGraph()} />

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
        body="We start before dawn, when the city is still quiet. Plates, salads and cold-pressed juices are made from scratch that same morning — seasonal produce, sauces reduced overnight, dressings mixed at the last minute. Nothing reheated, nothing left over from the day before."
        src="/images/dan-smedley.jpg"
      />

      <StickyTitleSection
        theme="sky"
        imagePosition="left"
        label="Delivery"
        title="Prepared at dawn, served by lunch."
        body="We pack and send across Brussels in the early hours, so lunch arrives as the kitchen intended. Insulated boxes, portions already set, garnishes kept separate — ready to unwrap and serve at your desk, in a meeting room, or at home before your guests walk in."
        src="/images/william-king.jpg"
      />

      <ServicesSection />

      {/* The reasons, once the visitor knows what we actually do. */}
      <WhyUsSection />

      {/* Full-height breath between the reasons and the calendar. */}
      <FullBleedImageSection src="/images/svitlana.jpg" />

      <CalendarSection availability={availability} />
      <Footer />
    </>
  );
}
