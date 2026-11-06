"use client";

import {
  CheckoutNotice,
  CheckoutNoticeAction,
} from "@/components/CheckoutNotice";
import { useDictionary, useLocale } from "@/components/LocaleProvider";
import type { CheckoutBlocker } from "@/lib/delivery/checkout";
import { interpolate } from "@/lib/i18n/dictionaries";
import { formatMoney } from "@/lib/i18n/format";

type CheckoutBlockerNoticeProps = {
  blocker: CheckoutBlocker | null;
  /** The slide-out panel's shorter wording, for its narrower column. */
  compact?: boolean;
  /** Collection rather than delivery — changes the wording of the time. */
  pickup?: boolean;
  /** Opens the window picker, wherever this surface keeps it. */
  onChooseSlot: () => void;
  /** Opens the address lookup, wherever this surface keeps it. */
  onAddAddress: () => void;
  /** Set while that picker is already open, so the notice steps aside. */
  hideSlot?: boolean;
  hideAddress?: boolean;
  className?: string;
};

/**
 * Why checkout is not available yet, in the customer's terms — the pieces per
 * product, the minimum order, the collection minimum, the delivery window, the
 * address.
 *
 * One component for both checkout surfaces, the cart page and the slide-out
 * panel, because they apply the same gate (`checkoutBlocker`) and must say the
 * same thing about it. Shopify's hosted checkout cannot edit a cart attribute
 * or refuse a basket, so each of these has to be settled before handing over.
 *
 * The two date blockers are not here: each surface fixes those with its own
 * calendar, laid out differently.
 */
export function CheckoutBlockerNotice({
  blocker,
  compact = false,
  pickup = false,
  onChooseSlot,
  onAddAddress,
  hideSlot = false,
  hideAddress = false,
  className,
}: CheckoutBlockerNoticeProps) {
  const dict = useDictionary();
  const locale = useLocale();
  const t = dict.cart;

  if (!blocker) return null;

  switch (blocker.kind) {
    case "below-piece-minimum":
      return (
        <CheckoutNotice tone="blocker" title={t.beforeCheckout} className={className}>
          {interpolate(t.belowPieceMinimum, {
            minimum: blocker.minimum,
            items: blocker.lines
              .map((line) => `${line.title} (${line.quantity}/${blocker.minimum})`)
              .join(", "),
          })}
        </CheckoutNotice>
      );

    case "below-minimum":
      return (
        <CheckoutNotice tone="blocker" title={t.beforeCheckout} className={className}>
          {interpolate(compact ? t.belowMinimumShort : t.belowMinimum, {
            zone: blocker.zone.id,
            minimum: formatMoney(locale, blocker.zone.minimumOrder),
            shortfall: formatMoney(locale, blocker.shortfall),
          })}
        </CheckoutNotice>
      );

    case "below-pickup-minimum":
      return (
        <CheckoutNotice tone="blocker" title={t.beforeCheckout} className={className}>
          {interpolate(t.belowPickupMinimum, {
            minimum: formatMoney(locale, blocker.minimum),
            shortfall: formatMoney(locale, blocker.shortfall),
          })}
        </CheckoutNotice>
      );

    case "no-slot":
    case "stale-slot":
      if (hideSlot) return null;
      return (
        <CheckoutNotice
          tone="blocker"
          title={t.beforeCheckout}
          className={className}
          action={
            <CheckoutNoticeAction onClick={onChooseSlot}>
              {pickup ? t.chooseSlotPickup : t.chooseSlot}
            </CheckoutNoticeAction>
          }
        >
          {blocker.kind === "stale-slot"
            ? interpolate(t.staleSlot, { slot: blocker.slot })
            : pickup
              ? dict.delivery.pickupSlotIntro
              : t.pickSlotIntro}
        </CheckoutNotice>
      );

    case "no-address":
      if (hideAddress) return null;
      // The remedy is the point: a blocker the customer can clear right here,
      // not one that sends them back to a product page.
      return (
        <CheckoutNotice
          tone="blocker"
          title={t.beforeCheckout}
          className={className}
          action={
            <CheckoutNoticeAction onClick={onAddAddress}>
              {dict.orderBar.addAddress}
            </CheckoutNoticeAction>
          }
        >
          {compact ? t.noAddressShort : t.noAddress}
        </CheckoutNotice>
      );

    default:
      return null;
  }
}
