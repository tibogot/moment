import type { Metadata } from "next";
import { FooterGrid } from "@/components/v2/FooterGrid";
import { GridOverlayToggle } from "@/components/v2/GridOverlayToggle";
import { PanelPairGrid } from "@/components/v2/PanelPairGrid";
import { ImageGridHero } from "@/components/v2/ImageGridHero";
import { IntroGridSection } from "@/components/v2/IntroGridSection";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getHomePageImages } from "@/lib/sanity/queries";

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
  const [dict, images] = await Promise.all([
    getDictionary(toLocale(lang)),
    getHomePageImages(),
  ]);

  return (
    <>
      <div className="v2">
        <ImageGridHero
          copy={dict.home.hero}
          image={images.hero}
          withText={false}
        />
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
        <FooterGrid />
      </div>
      <GridOverlayToggle />
    </>
  );
}
