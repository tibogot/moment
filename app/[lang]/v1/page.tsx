import type { Metadata } from "next";
import { CalendarSection } from "@/components/CalendarSection";
import { CollectionsSection } from "@/components/CollectionsSection";
import { Footer } from "@/components/Footer";
import { FullBleedImageSection } from "@/components/FullBleedImageSection";
import { Hero } from "@/components/Hero";
import { IntroSection } from "@/components/IntroSection";
import { NewsletterSection } from "@/components/NewsletterSection";
import { PanelPairFlipSmoothSection } from "@/components/PanelPairFlipSmoothSection";
import { SelectionCollectionsSection } from "@/components/SelectionCollectionsSection";
import { ServicesSection } from "@/components/ServicesSection";
import { SplitStatementSection } from "@/components/SplitStatementSection";
import { StickyTitleSection } from "@/components/StickyTitleSection";
import { WhyUsSection } from "@/components/WhyUsSection";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getHomePageImages } from "@/lib/sanity/queries";
import {
  getCollectionByHandle,
  getCollections,
  SELECTION_COLLECTION_HANDLES,
  SELECTION_COLLECTION_HANDLE_SET,
} from "@/lib/shopify/collections";
import { getDeliveryAvailability } from "@/lib/shopify/delivery";

/**
 * The previous home (v1), kept on 25 November 2026 when the v2 home replaced
 * it, so the sections not yet moved to v2 can still be seen and taken from
 * (panels, statement, collections, services, why us, full-bleed image,
 * newsletter). Not linked, not indexed, no structured data of its own. The
 * navbar is transparent over its hero (its path is in Navbar).
 */
export const metadata: Metadata = {
  title: "v1 — accueil",
  robots: { index: false, follow: false },
};

export default async function HomeV1({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = toLocale(lang);
  const [collections, selectionCollections, availability, dict, images] =
    await Promise.all([
      getCollections(locale),
      Promise.all(
        SELECTION_COLLECTION_HANDLES.map((handle) =>
          // A sélection that fails to load is left out rather than taking
          // the home page down with it.
          getCollectionByHandle(locale, handle).catch(() => null),
        ),
      ).then((items) => items.filter((item) => item !== null)),
      getDeliveryAvailability(),
      getDictionary(locale),
      getHomePageImages(),
    ]);
  const home = dict.home;

  // Shopify seeds every store with a "frontpage" collection; skip it and the
  // occasion sélections (those have their own section) and show the first
  // three real product collections.
  const featured = collections
    .filter(
      (collection) =>
        collection.handle !== "frontpage" &&
        !SELECTION_COLLECTION_HANDLE_SET.has(collection.handle),
    )
    .slice(0, 3);

  return (
    <>
      <Hero copy={home.hero} image={images.hero} />
      {/* The page's h1 lives here rather than in the hero — see IntroSection. */}
      <IntroSection
        copy={home.intro}
        aboutLabel={dict.common.aboutUs}
        headingAs="h1"
      />

      {/* The two rooms of the business, side by side on identical 3 x 3 grids:
          a solid 3D flip, one reversible timeline, shared perspective. */}
      <PanelPairFlipSmoothSection
        copy={home.panels}
        images={{ events: images.events, coffee: images.coffee }}
      />

      <SplitStatementSection
        copy={home.statement}
        headlineSize="md"
        className="pb-[6svh]"
      />

      <CollectionsSection
        collections={featured}
        heading={home.collections.label}
        viewAllLabel={dict.common.seeEverything}
      />

      <SelectionCollectionsSection
        collections={selectionCollections}
        tabs={[
          {
            handle: "pour-les-evenements",
            label: home.selections.events,
          },
          {
            handle: "pour-la-maison",
            label: home.selections.home,
          },
          {
            handle: "pour-le-bureau",
            label: home.selections.office,
          },
        ]}
        viewAllLabel={dict.common.seeEverything}
        soldOutLabel={dict.product.soldOut}
        prevLabel={home.calendar.prev}
        nextLabel={home.calendar.next}
      />

      <StickyTitleSection
        label={home.kitchen.label}
        title={home.kitchen.title}
        body={home.kitchen.body}
        src="/images/dan-smedley.jpg"
      />

      <StickyTitleSection
        theme="sky"
        imagePosition="left"
        label={home.delivery.label}
        title={home.delivery.title}
        body={home.delivery.body}
        src="/images/william-king.jpg"
      />

      {/* Same cream sticky layout as kitchen — third beat after delivery. */}
      <StickyTitleSection
        label={home.hosting.label}
        title={home.hosting.title}
        body={home.hosting.body}
        src="/images/nicole-herrero.jpg"
      />

      <ServicesSection />

      {/* The reasons, once the visitor knows what we actually do. */}
      <WhyUsSection copy={home.whyUs} ctaLabel={dict.common.talkToUs} />

      {/* Full-height breath between the reasons and the calendar.
          Spines stay in the DOM but paint transparent — flip back to
          bg-cream/60 if the continuous grid should read across again. */}
      <FullBleedImageSection
        src="/images/svitlana.jpg"
        lineClassName="bg-transparent"
      />

      <CalendarSection availability={availability} />
      <NewsletterSection copy={home.newsletter} />
      <Footer />
    </>
  );
}
