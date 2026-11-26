import { LocaleLink as Link } from "@/components/LocaleLink";
import type { Locale } from "@/lib/i18n/config";
import { interpolate, type Dictionary } from "@/lib/i18n/dictionaries";
import { formatMoney } from "@/lib/i18n/format";
import { routes } from "@/lib/routes";
import type { ZoneTable } from "@/lib/delivery/zones";
import { cn } from "@/lib/utils";

type OrderRulesNoteProps = {
  locale: Locale;
  dict: Dictionary;
  zones: ZoneTable;
  className?: string;
};

/**
 * One line with the order minimums and the delivery fees, before the cart.
 *
 * The audit of 26 November 2026: a customer met the minimum (and the fee) only
 * in the cart, after choosing a day and a slot — "il manque 50 €" as the last
 * step. Grape & Fig puts its minimum on the home banner. The figures are read
 * from the same Shopify settings the cart enforces, never typed here, so the
 * line cannot disagree with the checkout.
 */
export function OrderRulesNote({
  locale,
  dict,
  zones,
  className,
}: OrderRulesNoteProps) {
  const bands = zones.zones;
  if (bands.length === 0) return null;

  const minimum = Math.min(...bands.map((zone) => zone.minimumOrder));
  const fees = bands.map((zone) => zone.fee);
  const feeMin = Math.min(...fees);
  const feeMax = Math.max(...fees);
  const money = (amount: number) => formatMoney(locale, amount);

  const t = dict.product.orderRules;
  const fee =
    feeMin === feeMax
      ? interpolate(t.feeOne, { fee: money(feeMin) })
      : interpolate(t.feeRange, { min: money(feeMin), max: money(feeMax) });

  return (
    <p
      className={cn(
        "font-archivo-light text-[13px] leading-normal opacity-80",
        className,
      )}
    >
      {interpolate(t.line, {
        minimum: money(minimum),
        fee,
        pickup: money(zones.pickupMinimumOrder),
      })}{" "}
      <Link
        href={routes.shipping}
        className="underline underline-offset-2 transition-opacity hover:opacity-60"
      >
        {t.link}
      </Link>
    </p>
  );
}
