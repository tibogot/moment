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
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { getSiteDetails } from "@/lib/sanity/queries";
import type { SiteDetails } from "@/lib/site";
import { breadcrumbSchema, cateringBusinessSchema, graph } from "@/lib/schema";
import { absoluteUrl, fullTitle, localizedMetadata } from "@/lib/seo";

export const generateMetadata = localizedMetadata("about", {
  path: routes.about,
});

/**
 * Search engines read the company facts from here rather than inferring them
 * from the copy — keep it in step with the "At a glance" table, which states
 * the same things to human readers. The business node itself lives in
 * lib/schema.ts, shared with the home page.
 */
function aboutJsonLd(
  meta: { title: string; description: string },
  details: SiteDetails,
) {
  return graph(
    {
      "@type": "AboutPage",
      name: fullTitle(meta.title),
      description: meta.description,
      url: absoluteUrl(routes.about),
      mainEntity: cateringBusinessSchema(details),
    },
    breadcrumbSchema([
      { name: "Home", path: routes.home },
      { name: "About", path: routes.about },
    ]),
  );
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const [dict, siteDetails] = await Promise.all([
    getDictionary(toLocale(lang)),
    getSiteDetails(),
  ]);
  const about = dict.about;
  const jsonLd = aboutJsonLd(dict.meta.about, siteDetails);
  return (
    <>
      <JsonLd data={jsonLd} />

      <AboutHero copy={about.hero} />
      <AboutIntro copy={about.intro} />

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
        label={about.story.label}
        title={about.story.title}
        body={about.story.body}
        src="/images/anita-austvika.jpg"
      />

      <AboutPrinciples copy={about.principles} />

      <StickyTitleSection
        theme="sky"
        imagePosition="left"
        label={about.sourcing.label}
        title={about.sourcing.title}
        body={about.sourcing.body}
        src="/images/kateryna-hliznitsova.jpg"
      />

      {/* Full-height breath before the practical half of the page. */}
      <FullBleedImageSection src="/images/svitlana.jpg" />

      <AboutTeam copy={about.team} />
      <AboutFacts copy={about.facts} />
      <AboutCta copy={about.cta} />
      <Footer />
    </>
  );
}
