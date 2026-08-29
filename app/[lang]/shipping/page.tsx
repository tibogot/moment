import { LegalDoc, LegalSection } from "@/components/LegalDoc";
import { formatCutoffHour } from "@/lib/delivery";
import { formatSlot, formatWindow } from "@/lib/delivery-slots";
import { maxDeliveryDistanceKm } from "@/lib/delivery-zones";
import { toLocale } from "@/lib/i18n/config";
import { formatMoney } from "@/lib/i18n/format";
import { routes } from "@/lib/routes";
import { localizedMetadata } from "@/lib/seo";
import { getDeliveryRules } from "@/lib/shopify/zones";
import { formatAddressLine, SITE_DETAILS } from "@/lib/site";

export const generateMetadata = localizedMetadata("shipping", {
  path: routes.shipping,
});

/**
 * Delivery and returns, written from the rules the checkout actually enforces.
 *
 * This page used to be four paragraphs of "to be confirmed with operations".
 * The operations are now confirmed — the owners gave us the bands, the windows,
 * the cut-off and the cancellation policy on 29 August 2026 — so it is a server
 * component reading the same tables the cart prices against, for the same
 * reason the FAQ is: terms of sale that contradict the checkout are worse than
 * terms nobody wrote.
 *
 * Still untranslated, and deliberately. The legal pages bind, they now carry
 * fees, minimums and a refund rule, and they want a professional translator
 * rather than our French. See CLIENT-QUESTIONS.md §5.
 */
export default async function ShippingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = toLocale(lang);
  const { availability, zones, slots, pickupWindow } = await getDeliveryRules();

  const cutoff = formatCutoffHour(availability.cutoffHour);
  const maxKm = maxDeliveryDistanceKm(zones);

  return (
    <LegalDoc
      title="Shipping & returns"
      lead="How delivery, collection and cancellation work for Moment orders. The fees, minimums and lead times below are the ones the checkout applies."
    >
      <LegalSection title="Delivery area and fees">
        <p>
          We deliver up to {maxKm} km from the atelier at{" "}
          {formatAddressLine(SITE_DETAILS)}. The fee and the minimum order depend
          on the distance:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          {zones.zones.map((zone, index) => {
            const from = zones.zones[index - 1]?.maxDistanceKm ?? 0;

            return (
              <li key={zone.id}>
                {zone.maxDistanceKm === null
                  ? "Brussels-Capital Region"
                  : `${from}–${zone.maxDistanceKm} km`}
                {" — "}
                {formatMoney(locale, zone.fee)}, minimum order{" "}
                {formatMoney(locale, zone.minimumOrder)}
              </li>
            );
          })}
        </ul>
        <p>
          Orders over {formatMoney(locale, zones.freeDeliveryThreshold)} are
          delivered free of charge, in every band. Beyond {maxKm} km we quote by
          hand — the site will send you to the enquiry form rather than price
          the trip itself.
        </p>
        <p>
          {/* The client should know this is stated, and why. It is a pricing
              decision of theirs, not an implementation detail of ours. */}
          Distances are measured in a straight line from the atelier rather than
          by road, so the band you fall in is fixed the moment your address is
          saved and cannot change between then and checkout. Road distance is
          typically 20–30% greater, which means the bands are applied
          generously rather than strictly.
        </p>
      </LegalSection>

      <LegalSection title="Lead time and delivery windows">
        <p>
          Orders need at least {availability.leadTimeDays} days&apos; notice and
          close at {cutoff}. An order placed after {cutoff} counts as placed the
          following day, so the notice period starts from then. The calendar on
          the site only offers days that are still open.
        </p>
        <p>
          Deliveries run in two-hour windows, chosen when you order:{" "}
          {slots.map(formatSlot).join(", ")}. If the window you want is full,
          contact us — depending on your location and the route already planned,
          we may be able to add you to an existing round.
        </p>
        <p>
          Event catering is quoted rather than ordered online and its timings are
          agreed case by case.
        </p>
      </LegalSection>

      <LegalSection title="Collection">
        <p>
          Orders can be collected from the atelier at{" "}
          {formatAddressLine(SITE_DETAILS)}, free of charge and with no minimum
          order. Collection is available {formatWindow(pickupWindow)}.
        </p>
        <p>
          Pastries and other sweet items can be ordered for collection until{" "}
          {cutoff} on the day before. Everything else follows the standard{" "}
          {availability.leadTimeDays}-day notice period.
        </p>
      </LegalSection>

      <LegalSection title="Cancellation and refunds">
        <p>
          Any order may be cancelled free of charge up to 24 hours before the
          scheduled delivery date, and the full amount is refunded.
        </p>
        <p>
          Cancellations made less than 24 hours before delivery cannot, as a
          rule, be refunded: the products are fresh and prepared specifically for
          each order.
        </p>
        <p>
          If there is a problem with our service, or the products do not match
          the order, contact us immediately so we can put it right.
        </p>
      </LegalSection>

      <LegalSection title="Returns">
        <p>
          Because the goods are fresh and perishable, returns are limited and the
          statutory right of withdrawal for distance selling does not generally
          apply. Damaged or incorrect orders should be reported as soon as
          possible after delivery so we can replace or refund where appropriate.
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
