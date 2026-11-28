import { AboutTeam } from "@/components/AboutTeam";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { ColumnsCells, CtaCells, FactsCells } from "@/components/v2/AboutCells";
import { CellGrid } from "@/components/v2/CellGrid";
import { IntroCells } from "@/components/v2/IntroCells";
import { PageIntroContent } from "@/components/v2/PageIntroGrid";
import { PhotoGridSection } from "@/components/v2/PhotoGridSection";
import { StoryCells } from "@/components/v2/StoryCells";
import { toLocale, withLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary, type Dictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { type SiteDetails } from "@/lib/site";
import { getSiteDetails } from "@/lib/site-details";
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
  locale: Locale,
  dict: Dictionary,
  meta: { title: string; description: string },
  details: SiteDetails,
) {
  return graph(
    {
      "@type": "AboutPage",
      name: fullTitle(meta.title),
      description: meta.description,
      url: absoluteUrl(withLocale(routes.about, locale)),
      mainEntity: cateringBusinessSchema(details),
    },
    breadcrumbSchema(locale, [
      { name: dict.nav.home, path: routes.home },
      { name: dict.nav.about, path: routes.about },
    ]),
  );
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  // Phone, e-mail, hours and social from the Studio ("Infos pratiques").
  const siteDetails = await getSiteDetails();
  const { lang } = await params;
  const locale = toLocale(lang);
  const dict = await getDictionary(locale);
  const about = dict.about;
  const jsonLd = aboutJsonLd(locale, dict, dict.meta.about, siteDetails);
  return (
    <>
      <JsonLd data={jsonLd} />

      {/* On the page's 16 / 12 / 4 grid since 28 November 2026, in the
          owners' order (their text document, 27 November): who they are, why
          Moment, the parentheses, the story, their values, what they do, then
          the practical answers. Each part reuses the home's and the other
          pages' v2 sections; the three of its own are in v2/AboutCells. */}
      <div className="v2">
        <section
          className="relative w-full bg-cream"
          style={{ paddingTop: "var(--grid-band)" }}
        >
          <CellGrid
            lineClassName="bg-sky"
            subdivide={2}
            cells={false}
            readout={false}
            bottomBand="0px"
          />
          <PageIntroContent title={about.hero.title} lead={about.hero.lead} />
        </section>

        <IntroCells copy={about.intro} />

        {/* Full width, on whole cells: 6 rows on a desktop, a 3/4 portrait
            of 4 by 4 on a phone. */}
        <PhotoGridSection
          rowsClassName="[--rows:4] md:[--rows:6] lg:[--rows:7]"
          photos={[
            {
              src: "/images/onur-kaya.jpg",
              alt: "",
              className:
                "col-[2/span_4] row-[1/span_4] md:col-[2/span_12] md:row-[1/span_6] lg:col-[2/span_16] lg:row-[1/span_7]",
            },
          ]}
        />

        <IntroCells copy={{ headline: about.statement.headline, body: [] }} />

        {/* The owners' order (27 November 2026): why Moment, the
            parentheses, "c'est de cette idée qu'est né ( moment )", then
            their values. */}
        <StoryCells
          label={about.story.label}
          title={about.story.title}
          body={about.story.body}
          src="/images/anita-austvika.jpg"
        />

        <ColumnsCells
          label={about.principles.label}
          items={about.principles.items}
        />

        {/* What Moment does, in the owners' own sentences. */}
        <ColumnsCells
          label={about.values.label}
          lead={about.values.lead}
          aside={about.values.aside}
          items={about.values.cards}
        />

        {/* Two photographs staggered, each as many rows as columns so both
            are 3/4 portraits. Cells, columns · rows:
              mobile 4 × 7     1–4 · 1–4      2–4 · 5–7
              tablet 12 × 9    1–6 · 1–6      8–11 · 5–8
              desktop 16 × 10  1–6 · 1–6      11–14 · 6–9 */}
        <PhotoGridSection
          rowsClassName="[--rows:7] md:[--rows:9] lg:[--rows:10]"
          photos={[
            {
              src: "/images/nicole-herrero.jpg",
              alt: "",
              className:
                "col-[2/span_4] row-[1/span_4] md:col-[2/span_6] md:row-[1/span_6] lg:col-[2/span_6] lg:row-[1/span_6]",
            },
            {
              src: "/images/dan-smedley.jpg",
              alt: "",
              className:
                "col-[3/span_3] row-[5/span_3] md:col-[9/span_4] md:row-[5/span_4] lg:col-[12/span_4] lg:row-[6/span_4]",
            },
          ]}
        />

        {/* Full width again, before the practical half of the page. */}
        <PhotoGridSection
          rowsClassName="[--rows:4] md:[--rows:6] lg:[--rows:7]"
          photos={[
            {
              src: "/images/svitlana.jpg",
              alt: "",
              className:
                "col-[2/span_4] row-[1/span_4] md:col-[2/span_12] md:row-[1/span_6] lg:col-[2/span_16] lg:row-[1/span_7]",
            },
          ]}
        />

        {/* Empty until the owners send names and portraits. */}
        <AboutTeam copy={about.team} />
        <FactsCells copy={about.facts} />
        <CtaCells copy={about.cta} />
      </div>
      <Footer />
    </>
  );
}
