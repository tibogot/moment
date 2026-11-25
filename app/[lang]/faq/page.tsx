import Image from "next/image";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { CellGrid } from "@/components/v2/CellGrid";
import { FaqAccordion } from "@/components/v2/FaqAccordion";
import {
  DEFAULT_NEXT_DAY_CUTOFF_HOUR,
  formatCutoffHour,
} from "@/lib/delivery/dates";
import { formatSlot, type DeliverySlot } from "@/lib/delivery/slots";
import { freeDeliveryThresholdFor, type ZoneTable } from "@/lib/delivery/zones";
import { toLocale, type Locale } from "@/lib/i18n/config";
import {
  getDictionary,
  interpolate,
  type Dictionary,
} from "@/lib/i18n/dictionaries";
import { closedWeekdaysNote, formatMoney } from "@/lib/i18n/format";
import { resolveFaq } from "@/lib/faq";
import { routes } from "@/lib/routes";
import { breadcrumbSchema, faqSchema, graph } from "@/lib/schema";
import { localizedMetadata } from "@/lib/seo";
import { getFaqPage } from "@/lib/sanity/queries";
import { getDeliveryRules } from "@/lib/shopify/zones";
import { formatAddressLine, SITE_DETAILS } from "@/lib/site";
// Provisional: the client will pick the panel's photograph.
import orderingImage from "@/public/images/onur-kaya.jpg";

/**
 * "Comment ça marche & FAQ", on the v2 grid since 24 November 2026 — the 16 /
 * 12 / 4 grid of /v2/systeme, the frame only (no cells drawn in the content),
 * after Thibault's mockup and grapeandfig.com/pages/how-we-work:
 * - the title, the lead under it;
 * - the steps in one row, each a quarter of the grid (4 cells of 16, 3 of
 *   12, 2 of 4), its text a cell's padding in from its cell line, like the title;
 *   the number in sky; 2 × 2 on a phone. From the Studio, at most 4 short
 *   ones — the built-in ones until the owners publish theirs (lib/faq.ts);
 * - the questions, as an accordion. All folded on arrival. The first is a rich
 *   panel after grapeandfig's "Ordering Online": "Commander & se faire
 *   livrer", six blocks (zones, slots, notice, pieces, collection, the day
 *   before), each a title and a sentence (`faq.ordering`) and its live
 *   figures — on three quarters of the grid, a photograph on the fourth
 *   (desktop). Then the Studio's questions;
 * - a full-width sky band sending to the contact page.
 *
 * Every number on this page is read from the tables the checkout prices
 * against — the bands, the windows, the cut-off, the free-delivery
 * threshold, the atelier's own address — and printed once, in the panel.
 * The steps and the answers are prose the owners write in the Studio and
 * never quote a figure, so a settings change can't leave one stale.
 */
export const generateMetadata = localizedMetadata("faq", {
  path: routes.faq,
});

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

function slotSummary(slots: DeliverySlot[]) {
  return slots.map(formatSlot).join(" · ");
}

const LABEL = "font-owners-medium text-[12px] tracking-wide uppercase";

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

  const closedDays = closedWeekdaysNote(
    locale,
    dict,
    availability.closedWeekdays,
  );
  const glance = dict.faq.glance;
  const ordering = dict.faq.ordering;
  // The rich panel's blocks: a title and a sentence from the dictionaries,
  // then the live figures — the same ones "La livraison en bref" printed.
  const blocks: { title: string; body: string; values: string[] }[] = [
    { ...ordering.zones, values: zoneSummary(locale, dict, zones) },
    { ...ordering.slots, values: [slotSummary(slots)] },
    {
      ...ordering.notice,
      values: [
        interpolate(glance.noticeValue, {
          days: availability.leadTimeDays,
          cutoff: formatCutoffHour(availability.cutoffHour),
        }),
        ...(closedDays ? [closedDays] : []),
      ],
    },
    {
      ...ordering.pieces,
      values: [
        interpolate(glance.piecesValue, {
          pieces: zones.minimumPiecesPerProduct,
        }),
      ],
    },
    {
      ...ordering.pickup,
      values: [
        interpolate(glance.pickupValue, {
          address: formatAddressLine(SITE_DETAILS),
          minimum: formatMoney(locale, zones.pickupMinimumOrder),
          slots: pickupSlots.map(formatSlot).join(", "),
        }),
      ],
    },
    {
      ...ordering.nextDay,
      values: [
        interpolate(glance.nextDayValue, {
          cutoff: formatCutoffHour(
            availability.nextDay?.cutoffHour ?? DEFAULT_NEXT_DAY_CUTOFF_HOUR,
          ),
          minimum: formatMoney(locale, zones.nextDayPickupMinimumOrder),
        }),
      ],
    },
  ];

  // Steps and questions from the Studio, or the built-in texts until it has
  // some — see lib/faq.ts.
  const { steps, questions } = resolveFaq(faqContent, dict, locale);

  const orderingPanel = (
    // Out to the content's full width, then quarters of the grid, each block
    // a cell's padding in from its cell line — the same columns as the steps.
    <div className="-mx-(--v2-pad) grid gap-y-[5svh] pt-[1svh] md:grid-cols-2 lg:grid-cols-4">
      <div className="relative hidden aspect-3/4 overflow-hidden lg:col-start-4 lg:row-span-2 lg:row-start-1 lg:mx-(--v2-pad) lg:block">
        <Image
          src={orderingImage}
          alt=""
          fill
          sizes="25vw"
          className="object-cover"
        />
      </div>
      {blocks.map((block) => (
        <div key={block.title} className="min-w-0 px-(--v2-pad)">
          <h4 className="font-owners-medium text-[13px] tracking-wide uppercase">
            {block.title}
          </h4>
          <p className="font-archivo-light mt-2 text-(length:--body-text) leading-snug">
            {block.body}
          </p>
          <ul className="font-archivo-light mt-2 text-(length:--body-text) leading-snug text-black/70">
            {block.values.map((value) => (
              <li key={value}>{value}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
  const cta = dict.faq.contactCta;

  // The panel as plain text for the search engines: the same figures.
  const orderingText = blocks
    .map(({ title, body, values }) => `${title}. ${body} ${values.join(" · ")}`)
    .join(" ");

  return (
    <>
      {/* The one schema on this site that changes what a search result looks
          like: Google renders these as expandable rows under the listing. */}
      <JsonLd
        data={graph(
          faqSchema([
            { question: ordering.title, answer: orderingText },
            ...questions,
          ]),
          breadcrumbSchema(locale, [
            { name: dict.nav.home, path: routes.home },
            { name: dict.faq.title, path: routes.faq },
          ]),
        )}
      />

      <div className="v2">
        <section
          className="relative w-full bg-cream"
          style={{ paddingTop: "var(--grid-band)" }}
        >
          {/* The frame: the navbar's rule and the two spines. */}
          <CellGrid
            lineClassName="bg-sky"
            subdivide={2}
            cells={false}
            readout={false}
            bottomBand="0px"
          />
          <div
            className="relative grid"
            style={{ gridTemplateColumns: "var(--s-grid-columns)" }}
          >
            <div className="col-[2/-2] min-w-0 pt-[7svh] pb-[9svh] [&>*:not(ol)]:mx-(--v2-pad)">
              <h1 className="font-owners-narrow-bold max-w-[24ch] text-[11vw] leading-[0.9] tracking-[-0.005em] uppercase md:text-[min(5vw,9svh)]">
                {dict.faq.title}
              </h1>
              <p className="font-archivo-light mt-[3svh] max-w-[68ch] text-(length:--body-text) leading-normal">
                {dict.faq.lead}
              </p>

              {/* The steps: a quarter of the grid each from tablet up, so
                  each starts on a cell line (4 cells of 16, 3 of 12). */}
              <ol
                aria-label={dict.faq.stepsTitle}
                className="mt-[7svh] grid grid-cols-2 gap-y-[5svh] md:grid-cols-4"
              >
                {steps.map((step) => (
                  <li key={step.index} className="min-w-0 px-(--v2-pad)">
                    <span
                      aria-hidden
                      className="font-owners-narrow-bold block text-[clamp(32px,3.2vw,52px)] leading-none text-sky tabular-nums"
                    >
                      {step.index}
                    </span>
                    <p className="font-archivo-light mt-[2svh] text-(length:--body-text) leading-snug">
                      {step.title}
                    </p>
                    <p className="font-archivo-light mt-1 max-w-[30ch] text-(length:--body-text) leading-snug">
                      {step.body}
                    </p>
                  </li>
                ))}
              </ol>

              <h2 className={`${LABEL} mt-[10svh]`}>
                {dict.faq.questionsTitle}
              </h2>
              <div className="mt-[2.5svh]">
                <FaqAccordion
                  entries={[
                    { question: ordering.title, answer: orderingPanel },
                    ...questions,
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Still a question: the sky band, full width. */}
        <section className="w-full bg-sky px-(--grid-inset) py-[12svh] text-center">
          <h2 className="font-owners-narrow-bold text-[8vw] leading-[0.9] tracking-[-0.005em] uppercase md:text-[min(3vw,6svh)]">
            {cta.title}
          </h2>
          <p className="font-archivo-light mx-auto mt-[2.5svh] max-w-[46ch] text-(length:--body-text) leading-normal">
            {cta.body}
          </p>
          <Link
            href={routes.contact}
            className="font-owners-medium mt-[4svh] inline-block bg-cream px-6 py-3.5 text-[12px] tracking-wide uppercase transition-opacity hover:opacity-80"
          >
            {cta.button}
          </Link>
        </section>
      </div>
      <Footer />
    </>
  );
}
