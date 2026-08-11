import type { Metadata } from "next";
import { CalendarSection } from "@/components/CalendarSection";
import { CollectionsSection } from "@/components/CollectionsSection";
import { Footer } from "@/components/Footer";
import { FullBleedImageSection } from "@/components/FullBleedImageSection";
import { Hero } from "@/components/Hero";
import { IntroSection } from "@/components/IntroSection";
import { JsonLd } from "@/components/JsonLd";
import { PanelPairSection } from "@/components/PanelPairSection";
import { ServicesSection } from "@/components/ServicesSection";
import { SplitImageSection } from "@/components/SplitImageSection";
import { StickyTitleSection } from "@/components/StickyTitleSection";
import { WhyUsSection } from "@/components/WhyUsSection";
import {
  DEFAULT_LOCALE,
  isLocale,
  OG_LOCALE,
  toLocale,
} from "@/lib/i18n/config";
import { routes } from "@/lib/routes";
import { siteGraph } from "@/lib/schema";
import { languageAlternates } from "@/lib/seo";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getHomePageImages, getSiteDetails } from "@/lib/sanity/queries";
import { getCollections } from "@/lib/shopify/collections";
import { getDeliveryAvailability } from "@/lib/shopify/delivery";

/**
 * The home page keeps an absolute title rather than the "%s — Moment"
 * template: it's the one page where the brand name leads. That is also why it
 * declares metadata by hand instead of going through `localizedMetadata`,
 * which would apply the template.
 *
 * It still has to resolve its own alternates: a static `alternates` here
 * replaces the layout's rather than merging with it, which is how all three
 * home pages ended up canonicalising to the bare domain.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const { meta } = await getDictionary(locale);

  // Keywords and description come from the dictionary like every other page.
  // They were literals here, and because this block overrides the layout's,
  // all three languages were served the English ones.
  return {
    alternates: languageAlternates(routes.home, locale),
    description: meta.home.description,
    keywords: [...meta.home.keywords],
    openGraph: { locale: OG_LOCALE[locale] },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const [collections, availability, dict, siteDetails, images] =
    await Promise.all([
      getCollections(toLocale(lang)),
      getDeliveryAvailability(),
      getDictionary(toLocale(lang)),
      getSiteDetails(),
      getHomePageImages(),
    ]);
  const home = dict.home;

  // Shopify seeds every store with a "frontpage" collection; skip it and show
  // the first three real ones.
  const featured = collections
    .filter((collection) => collection.handle !== "frontpage")
    .slice(0, 3);

  return (
    <>
      {/* Defines the organisation, website and business nodes the rest of the
          site's structured data refers back to by @id. */}
      <JsonLd data={siteGraph(siteDetails)} />

      <Hero copy={home.hero} image={images.hero} />
      {/* The page's h1 lives here rather than in the hero — see IntroSection. */}
      <IntroSection
        copy={home.intro}
        aboutLabel={dict.common.aboutUs}
        headingAs="h1"
      />

      {/* The two rooms of the business, side by side on identical 3 x 3 grids. */}
      <PanelPairSection
        copy={home.panels}
        images={{ events: images.events, coffee: images.coffee }}
      />

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

      <CollectionsSection
        collections={featured}
        heading={home.collections.label}
        viewAllLabel={dict.common.seeEverything}
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

      <ServicesSection />

      {/* The reasons, once the visitor knows what we actually do. */}
      <WhyUsSection copy={home.whyUs} ctaLabel={dict.common.talkToUs} />

      {/* Full-height breath between the reasons and the calendar. */}
      <FullBleedImageSection src="/images/svitlana.jpg" />

      <CalendarSection availability={availability} />
      <Footer />
    </>
  );
}
