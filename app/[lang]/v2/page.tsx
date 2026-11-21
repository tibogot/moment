import type { Metadata } from "next";
import { CalendarGrid } from "@/components/v2/CalendarGrid";
import { FooterGrid } from "@/components/v2/FooterGrid";
import { GridOverlayToggle } from "@/components/v2/GridOverlayToggle";
import { MonogramPatternSection } from "@/components/v2/MonogramPatternSection";
import { PanelPairGrid } from "@/components/v2/PanelPairGrid";
import { ImageGridHero } from "@/components/v2/ImageGridHero";
import { IntroGridSection } from "@/components/v2/IntroGridSection";
import { LogoGridHero } from "@/components/v2/LogoGridHero";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getHomePageImages } from "@/lib/sanity/queries";
import { getDeliveryAvailability } from "@/lib/shopify/delivery";

/**
 * Test bench for the redesign. Not linked, not indexed, not in the sitemap.
 * The brand-card version lives at /v2/card.
 *
 * Everything sits in a `.v2` wrapper: that is what defines the v2 grid
 * (--v2-cols, --v2-row… in globals.css), so none of it leaks into the rest
 * of the site.
 */
export const metadata: Metadata = {
  title: "v2",
  robots: { index: false, follow: false },
};

export default async function HomeV2({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const [dict, images, availability] = await Promise.all([
    getDictionary(toLocale(lang)),
    getHomePageImages(),
    getDeliveryAvailability(),
  ]);

  return (
    <>
      <div className="v2">
        <ImageGridHero
          copy={dict.home.hero}
          image={images.hero}
          withText={false}
        />
        {/* Trial: the hero again, with the logotype large in the middle. */}
        <LogoGridHero />
        {/* Section 2: the intro text and, in the same section under it, the
            two panels — same flip and links as v1. */}
        <IntroGridSection
          copy={dict.home.intro}
          aboutLabel={dict.common.aboutUs}
        >
          <PanelPairGrid
            copy={dict.home.panels}
            images={{ events: images.events, coffee: images.coffee }}
          />
        </IntroGridSection>
        <CalendarGrid availability={availability} />
        {/* Rond Carré's tissue-paper print, reproduced. */}
        <MonogramPatternSection />
        <FooterGrid />
      </div>
      <GridOverlayToggle />
    </>
  );
}
