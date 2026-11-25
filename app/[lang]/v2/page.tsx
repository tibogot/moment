import type { Metadata } from "next";
import { CalendarGrid } from "@/components/v2/CalendarGrid";
import { FooterGrid } from "@/components/v2/FooterGrid";
import { MonogramGridHero } from "@/components/v2/MonogramGridHero";
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
        {/* The logo section kept on 22 November 2026: 24 columns, exactly
            100svh, whole odd rows (cells stretched a little to fill the
            screen), the logo small on 4 cells of the middle row. */}
        <LogoGridHero subdivide={3} stretch logoCells={4} logoFill={0.75} />
        {/* To compare: 16 columns (12 on tablet), same rules, the logo on 4
            cells, a little smaller. */}
        <LogoGridHero subdivide={2} stretch logoCells={4} logoFill={0.65} />
        {/* The large monogram in the grid: "m" in the centre cell, each
            parenthesis in the cell beside it. */}
        <MonogramGridHero />
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
    </>
  );
}
