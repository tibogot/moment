import { Footer } from "@/components/Footer";
import { GridSection } from "@/components/GridSection";
import { JsonLd } from "@/components/JsonLd";
import { PageIntro } from "@/components/PageIntro";
import { toLocale, type Locale } from "@/lib/i18n/config";
import {
  getDictionary,
  interpolate,
  type Dictionary,
} from "@/lib/i18n/dictionaries";
import {
  DELIVERY_ZONES,
  formatEuros,
  MAX_DELIVERY_DISTANCE_KM,
} from "@/lib/delivery-zones";
import { LEAD_TIME_DAYS } from "@/lib/delivery";
import { routes } from "@/lib/routes";
import { breadcrumbSchema, faqSchema, graph } from "@/lib/schema";
import { localizedMetadata } from "@/lib/seo";

export const generateMetadata = localizedMetadata("faq", {
  path: routes.faq,
});

/**
 * The delivery bands, written out from the same table the cart prices against.
 *
 * Not copy. A FAQ that quotes fees is the first thing to go stale after a price
 * change, and a page telling a customer €15 while the checkout charges €25 is
 * worse than no page — so the numbers are read from `DELIVERY_ZONES` and the
 * dictionary only holds the words around them.
 */
function zoneSummary(locale: Locale, dict: Dictionary) {
  return DELIVERY_ZONES.map((zone, index) => {
    const previous = DELIVERY_ZONES[index - 1]?.maxDistanceKm ?? 0;
    const where =
      zone.maxDistanceKm === null
        ? dict.faq.zoneBrussels
        : `${previous}–${zone.maxDistanceKm} km`;
    const minimum = interpolate(dict.faq.zoneMinimum, {
      amount: formatEuros(zone.minimumOrder),
    });

    return `${where} ${formatEuros(zone.fee)} (${minimum})`;
  }).join(" · ");
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = toLocale(lang);
  const dict = await getDictionary(locale);

  const entries = dict.faq.items.map(({ q, a }) => ({
    question: q,
    answer: interpolate(a, {
      days: LEAD_TIME_DAYS,
      max: MAX_DELIVERY_DISTANCE_KM,
      zones: zoneSummary(locale, dict),
    }),
  }));

  return (
    <>
      {/* The one schema on this site that changes what a search result looks
          like: Google renders these as expandable rows under the listing. */}
      <JsonLd
        data={graph(
          faqSchema(entries),
          breadcrumbSchema([
            { name: "Home", path: routes.home },
            { name: dict.faq.title, path: routes.faq },
          ]),
        )}
      />

      <PageIntro title={dict.faq.title} lead={dict.faq.lead} />

      <GridSection className="pb-[14svh]">
        <div className="col-start-2 col-end-5 px-(--grid-gutter) md:col-end-8">
          <dl className="border-t border-sky">
            {entries.map(({ question, answer }) => (
              <div
                key={question}
                className="border-b border-sky py-[4svh] md:grid md:grid-cols-7 md:gap-(--grid-gutter)"
              >
                <dt className="font-owners-medium text-[13px] uppercase tracking-wide md:col-span-3">
                  {question}
                </dt>
                <dd className="font-archivo-light mt-3 max-w-[52ch] text-[18px] leading-normal md:col-span-4 md:mt-0">
                  {answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </GridSection>

      <Footer />
    </>
  );
}
