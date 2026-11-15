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
  DEFAULT_NEXT_DAY_CUTOFF_HOUR,
  formatCutoffHour,
} from "@/lib/delivery/dates";
import { formatSlot, type DeliverySlot } from "@/lib/delivery/slots";
import { freeDeliveryThresholdFor, type ZoneTable } from "@/lib/delivery/zones";
import { closedWeekdaysNote, formatMoney } from "@/lib/i18n/format";
import { routes } from "@/lib/routes";
import { resolveFaq } from "@/lib/faq";
import { breadcrumbSchema, faqSchema, graph } from "@/lib/schema";
import { localizedMetadata } from "@/lib/seo";
import { getFaqPage } from "@/lib/sanity/queries";
import { getDeliveryRules } from "@/lib/shopify/zones";
import { formatAddressLine, SITE_DETAILS } from "@/lib/site";

export const generateMetadata = localizedMetadata("faq", {
  path: routes.faq,
});

/**
 * The delivery bands, written out from the same table the cart prices against.
 *
 * Not copy. A FAQ that quotes fees is the first thing to go stale after a price
 * change, and a page quoting one fee while the checkout charges another is
 * worse than no page — so the numbers are read from the live `ZoneTable`
 * (Shopify's `delivery_zone` entries, or `DEFAULT_ZONE_TABLE`) and the
 * dictionary only holds the words around them.
 */
function zoneSummary(locale: Locale, dict: Dictionary, zones: ZoneTable) {
  return zones.zones.map((zone, index) => {
    const previous = zones.zones[index - 1]?.maxDistanceKm ?? 0;
    const where =
      zone.maxDistanceKm === null
        ? dict.faq.zoneBrussels
        : `${previous}–${zone.maxDistanceKm} km`;
    const minimum = interpolate(dict.faq.zoneMinimum, {
      amount: formatMoney(locale, zone.minimumOrder),
    });
    const free = interpolate(dict.faq.zoneFree, {
      amount: formatMoney(locale, freeDeliveryThresholdFor(zone, zones)),
    });

    return `${where} · ${formatMoney(locale, zone.fee)} · ${minimum} · ${free}`;
  });
}

/** The delivery windows, from the same table the picker offers. */
function slotSummary(slots: DeliverySlot[]) {
  return slots.map(formatSlot).join(" · ");
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = toLocale(lang);
  const [dict, { availability, zones, slots, pickupSlots }, faqContent] =
    await Promise.all([
      getDictionary(locale),
      getDeliveryRules(),
      getFaqPage(),
    ]);

  // Every number on this page is read from the tables the checkout prices
  // against — the bands, the windows, the cut-off, the free-delivery threshold,
  // the atelier's own address — and printed once, in "Delivery at a glance".
  // The steps and the answers are prose the owners write in the Studio and
  // never quote a figure, so a settings change can't leave one stale.
  const closedDays = closedWeekdaysNote(
    locale,
    dict,
    availability.closedWeekdays,
  );
  const glance = dict.faq.glance;
  const glanceRows: { label: string; value: string | string[] }[] = [
    { label: glance.zones, value: zoneSummary(locale, dict, zones) },
    { label: glance.slots, value: slotSummary(slots) },
    {
      label: glance.notice,
      value: interpolate(glance.noticeValue, {
        days: availability.leadTimeDays,
        cutoff: formatCutoffHour(availability.cutoffHour),
      }),
    },
    // Only when there is one: "open every day" needs no row.
    ...(closedDays ? [{ label: glance.closed, value: closedDays }] : []),
    {
      label: glance.pieces,
      value: interpolate(glance.piecesValue, {
        pieces: zones.minimumPiecesPerProduct,
      }),
    },
    {
      label: glance.pickup,
      value: interpolate(glance.pickupValue, {
        address: formatAddressLine(SITE_DETAILS),
        minimum: formatMoney(locale, zones.pickupMinimumOrder),
        slots: pickupSlots.map(formatSlot).join(", "),
      }),
    },
    {
      label: glance.nextDay,
      value: interpolate(glance.nextDayValue, {
        cutoff: formatCutoffHour(
          availability.nextDay?.cutoffHour ?? DEFAULT_NEXT_DAY_CUTOFF_HOUR,
        ),
        minimum: formatMoney(locale, zones.nextDayPickupMinimumOrder),
      }),
    },
  ];

  // Steps and questions from the Studio, or the built-in texts until it has
  // some — see lib/faq.ts.
  const { steps, questions: entries } = resolveFaq(faqContent, dict, locale);

  return (
    <>
      {/* The one schema on this site that changes what a search result looks
          like: Google renders these as expandable rows under the listing. */}
      <JsonLd
        data={graph(
          faqSchema(entries),
          breadcrumbSchema(locale, [
            { name: dict.nav.home, path: routes.home },
            { name: dict.faq.title, path: routes.faq },
          ]),
        )}
      />

      <PageIntro title={dict.faq.title} lead={dict.faq.lead} />

      <GridSection className="pb-[14svh]">
        <div className="col-start-2 col-end-5 px-(--grid-gutter) md:col-end-8">
          <h2 className="font-owners-medium text-[12px] uppercase tracking-wide">
            {dict.faq.stepsTitle}
          </h2>
          {/* Same row as the questions below — label on the left three
              columns, text on the right four — so the page reads as one
              table: first how to order, then what people ask. */}
          <ol className="mt-[3svh] border-t border-sky">
            {steps.map(({ index, title, body }) => (
              <li
                key={index}
                className="border-b border-sky py-[4svh] md:grid md:grid-cols-7 md:gap-(--grid-gutter)"
              >
                <p className="flex gap-5 md:col-span-3">
                  <span className="font-archivo-light text-[14px] tabular-nums">
                    {index}
                  </span>
                  <span className="font-owners-medium text-[13px] uppercase tracking-wide">
                    {title}
                  </span>
                </p>
                <p className="font-archivo-light mt-3 max-w-[52ch] text-[18px] leading-normal md:col-span-4 md:mt-0">
                  {body}
                </p>
              </li>
            ))}
          </ol>

          {/* The figures the steps and answers point to, straight from the
              delivery rules. Same rows again, so the page stays one table. */}
          <h2 className="font-owners-medium mt-[10svh] text-[12px] uppercase tracking-wide">
            {dict.faq.glanceTitle}
          </h2>
          <dl className="mt-[3svh] border-t border-sky">
            {glanceRows.map(({ label, value }) => (
              <div
                key={label}
                className="border-b border-sky py-[3svh] md:grid md:grid-cols-7 md:gap-(--grid-gutter)"
              >
                <dt className="font-owners-medium text-[13px] uppercase tracking-wide md:col-span-3">
                  {label}
                </dt>
                <dd className="font-archivo-light mt-3 max-w-[52ch] text-[18px] leading-normal md:col-span-4 md:mt-0">
                  {Array.isArray(value) ? (
                    <ul>
                      {value.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  ) : (
                    value
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <h2 className="font-owners-medium mt-[10svh] text-[12px] uppercase tracking-wide">
            {dict.faq.questionsTitle}
          </h2>
          <dl className="mt-[3svh] border-t border-sky">
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
