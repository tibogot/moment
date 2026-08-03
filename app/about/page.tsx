import type { Metadata } from "next";
import { AboutCta } from "@/components/AboutCta";
import { AboutFacts } from "@/components/AboutFacts";
import { AboutHero } from "@/components/AboutHero";
import { AboutIntro } from "@/components/AboutIntro";
import { AboutPrinciples } from "@/components/AboutPrinciples";
import { AboutTeam } from "@/components/AboutTeam";
import { Footer } from "@/components/Footer";
import { FullBleedImageSection } from "@/components/FullBleedImageSection";
import { JsonLd } from "@/components/JsonLd";
import { SplitImageSection } from "@/components/SplitImageSection";
import { StickyTitleSection } from "@/components/StickyTitleSection";
import { routes } from "@/lib/routes";
import {
  breadcrumbSchema,
  cateringBusinessSchema,
  graph,
} from "@/lib/schema";
import { absoluteUrl, fullTitle, pageMetadata } from "@/lib/seo";

const title = "About — Traiteur & Catering Kitchen in Brussels";
const description =
  "Moment is a traiteur in Brussels cooking seasonal plates, salads and cold-pressed juices every morning for private hosts, offices and events — delivered across the city, ready to serve.";

export const metadata: Metadata = pageMetadata({
  title,
  description,
  path: routes.about,
  keywords: [
    "traiteur Brussels",
    "catering Brussels",
    "corporate catering Brussels",
    "event catering Brussels",
    "lunch delivery Brussels",
    "cold-pressed juice Brussels",
  ],
});

/**
 * Search engines read the company facts from here rather than inferring them
 * from the copy — keep it in step with the "At a glance" table, which states
 * the same things to human readers. The business node itself lives in
 * lib/schema.ts, shared with the home page.
 */
const jsonLd = graph(
  {
    "@type": "AboutPage",
    name: fullTitle(title),
    description,
    url: absoluteUrl(routes.about),
    mainEntity: cateringBusinessSchema(),
  },
  breadcrumbSchema([
    { name: "Home", path: routes.home },
    { name: "About", path: routes.about },
  ]),
);

export default function AboutPage() {
  return (
    <>
      <JsonLd data={jsonLd} />

      <AboutHero />
      <AboutIntro />

      {/* Mirror of the home page's split blocks, flipped: the large image sits
          on the right half here, with the smaller one answering on the left. */}
      <SplitImageSection
        src="/images/nicole-herrero.jpg"
        alt=""
        colStart={4}
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
        src="/images/dan-smedley.jpg"
        alt=""
        colStart={1}
        colSpan={2}
        rowStart={1}
        rowSpan={2}
        mobile={{
          rows: 4,
          colStart: 1,
          colSpan: 4,
          rowStart: 1,
          rowSpan: 3,
        }}
        continueGrid
        fullBleedBottom
      />

      <StickyTitleSection
        label="Our story"
        title="It began with one table too many."
        body="Moment started in a rented kitchen off the Chaussée d'Ixelles, cooking Friday lunch for a design studio that had run out of decent options. Word travelled the way it does here — one office told another, then someone's launch, then someone's wedding. We still cook to order, still cap the covers at what we can plate properly, and still send out nothing we would not happily eat standing at the pass."
        src="/images/anita-austvika.jpg"
      />

      <AboutPrinciples />

      <StickyTitleSection
        theme="sky"
        imagePosition="left"
        label="Sourcing"
        title="We buy short, and we buy close."
        body="Vegetables from Flemish and Walloon market gardens, bread from a bakery two streets away, fish only when the North Sea sends something worth serving. We order small and often rather than large and once, which is why the menu moves through the year — and why so little is thrown away. What does not go out, the team eats."
        src="/images/kateryna-hliznitsova.jpg"
      />

      {/* Full-height breath before the practical half of the page. */}
      <FullBleedImageSection src="/images/svitlana.jpg" />

      <AboutTeam />
      <AboutFacts />
      <AboutCta />
      <Footer />
    </>
  );
}
