"use client";

import { useState, useTransition } from "react";
import { setDeliveryDate, setDeliveryNote } from "@/app/actions/cart";
import { DeliveryDatePicker } from "@/components/DeliveryDatePicker";
import { notifyCartUpdated } from "@/lib/cart-store";
import { isBookable, type DeliveryAvailability } from "@/lib/delivery";
import { checkoutBlocker } from "@/lib/checkout";
import { useDictionary, useLocale } from "@/components/LocaleProvider";
import { interpolate } from "@/lib/i18n/dictionaries";
import {
  closedWeekdaysNote,
  formatLongDate,
  formatMoney,
} from "@/lib/i18n/format";
import { zoneById, type ZoneId, type ZoneTable } from "@/lib/delivery-zones";
import {
  DELIVERY_NOTE_MAX,
  needsAddress,
  type DeliveryMethod,
} from "@/lib/order-preferences";
import { useRouter } from "next/navigation";

type CartDeliverySectionProps = {
  availability: DeliveryAvailability;
  zones: ZoneTable;
  deliveryDate: string | null;
  deliveryMethod: DeliveryMethod | null;
  deliveryAddress: string | null;
  deliveryNote: string | null;
  deliveryZone: ZoneId | null;
  subtotal: number;
  totalPrice: string;
  checkoutUrl: string;
};

/**
 * The delivery date, the total and the checkout button as one block, because
 * the date gates the button: Shopify's hosted checkout cannot edit a cart
 * attribute, so leaving this page without a day means the order arrives with
 * nowhere to put it. Mirrors the footer of the cart panel.
 */
export function CartDeliverySection({
  availability,
  zones,
  deliveryDate,
  deliveryMethod,
  deliveryAddress,
  deliveryNote,
  deliveryZone,
  subtotal,
  totalPrice,
  checkoutUrl,
}: CartDeliverySectionProps) {
  const dict = useDictionary();
  const locale = useLocale();
  const closedDays = closedWeekdaysNote(
    locale,
    dict,
    availability.closedWeekdays,
  );
  const t = dict.cart;
  const router = useRouter();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noteSaved, setNoteSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const dateIsStale = Boolean(
    deliveryDate && !isBookable(deliveryDate, availability),
  );

  const blocker = checkoutBlocker(
    {
      deliveryDate,
      deliveryMethod,
      deliveryAddress,
      deliveryZone,
      subtotal,
    },
    availability,
    zones,
  );

  // The two date blockers are the ones this section can fix in place, by
  // opening its own picker. The rest send the customer somewhere else.
  const needsDate =
    blocker?.kind === "no-date" || blocker?.kind === "stale-date";

  const zone = deliveryZone ? zoneById(zones, deliveryZone) : null;

  const saveNote = (value: string) => {
    if (value.trim() === (deliveryNote ?? "").trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await setDeliveryNote(value);
      if (!result.ok) {
        setError(dict.errors[result.code]);
        return;
      }
      setNoteSaved(true);
      notifyCartUpdated();
      router.refresh();
    });
  };

  const chooseDate = (iso: string) => {
    setError(null);
    startTransition(async () => {
      const result = await setDeliveryDate(iso);
      if (!result.ok) {
        setError(dict.errors[result.code]);
        return;
      }
      notifyCartUpdated();
      setPickerOpen(false);
      // The date is server-rendered on this page, so the route has to re-read
      // the cart for the row above to catch up.
      router.refresh();
    });
  };

  return (
    <>
      {/* Carried as a cart attribute, so it follows the order into the
          Shopify admin. */}
      <div className="border-t border-sky py-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span className="font-owners-medium text-[12px] uppercase tracking-wide">
            {t.delivery}
          </span>

          {deliveryDate && !dateIsStale ? (
            <span className="flex items-baseline gap-4">
              <span className="font-archivo-light text-[13px]">
                {formatLongDate(locale, deliveryDate)}
              </span>
              <button
                type="button"
                onClick={() => setPickerOpen((open) => !open)}
                className="font-archivo-light text-[13px] underline underline-offset-4 transition-opacity hover:opacity-60"
              >
                {pickerOpen ? t.done : t.change}
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setPickerOpen((open) => !open)}
              className="font-archivo-light text-[13px] underline underline-offset-4 transition-opacity hover:opacity-60"
            >
              {dateIsStale ? t.pickAnother : t.pick}
            </button>
          )}
        </div>

        {/* Read-only: these are chosen on the product page, and repeating the
            editors here would be a third place to keep in step. Showing them
            still matters — the customer has to be able to check what they
            picked before handing over to Shopify's checkout. */}
        {deliveryMethod && (
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
            <span className="font-owners-medium text-[12px] uppercase tracking-wide">
              {t.method}
            </span>
            <span className="font-archivo-light text-[13px]">
              {dict.deliveryMethods[deliveryMethod].label}
            </span>
          </div>
        )}

        {deliveryAddress && needsAddress(deliveryMethod) && (
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
            <span className="font-owners-medium text-[12px] uppercase tracking-wide">
              {t.address}
            </span>
            <span className="font-archivo-light text-[13px]">
              {deliveryAddress}
            </span>
          </div>
        )}

        {/* Only for delivery: "ring at reception" means nothing to someone
            collecting from the atelier themselves. Saved on blur rather than
            behind a button — a note nobody remembers to submit is a note the
            driver never gets. */}
        {needsAddress(deliveryMethod) && (
          <div className="mt-3">
            <label
              htmlFor="delivery-note"
              className="font-owners-medium text-[12px] uppercase tracking-wide"
            >
              {t.note}
            </label>
            <textarea
              id="delivery-note"
              rows={2}
              defaultValue={deliveryNote ?? ""}
              maxLength={DELIVERY_NOTE_MAX}
              placeholder={t.notePlaceholder}
              disabled={isPending}
              onBlur={(event) => saveNote(event.target.value)}
              className="font-archivo-light mt-2 w-full resize-none border border-sky bg-transparent px-3 py-2 text-[13px] leading-normal outline-none transition-colors duration-300 focus:bg-sky/20 disabled:opacity-40"
            />
            {noteSaved && (
              <p
                role="status"
                className="font-archivo-light mt-1 text-[12px] opacity-60"
              >
                {t.noteSaved}
              </p>
            )}
          </div>
        )}

        {/* The fee is what Shopify will charge at checkout, shown here so it
            is not a surprise on the last screen. */}
        {zone && needsAddress(deliveryMethod) && (
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
            <span className="font-owners-medium text-[12px] uppercase tracking-wide">
              {t.deliveryFee}
            </span>
            <span className="font-archivo-light text-[13px]">
              {interpolate(t.zoneLine, {
                fee: formatMoney(locale, zone.fee),
                zone: zone.id,
                minimum: formatMoney(locale, zone.minimumOrder),
              })}
            </span>
          </div>
        )}

        {dateIsStale && deliveryDate && (
          <p role="alert" className="font-archivo-light mt-2 text-[13px]">
            {interpolate(t.staleDate, {
              date: formatLongDate(locale, deliveryDate),
            })}
          </p>
        )}

        {error && (
          <p role="alert" className="font-archivo-light mt-2 text-[13px]">
            {error}
          </p>
        )}

        {pickerOpen && (
          <div className="mt-5 max-w-105 border border-sky">
            <p className="font-archivo-light px-6 pt-5 text-[13px] leading-normal">
              {interpolate(dict.delivery.calendarNote, {
                days: availability.leadTimeDays,
              })}
              {closedDays ? ` ${closedDays}` : ""}
            </p>
            <DeliveryDatePicker
              availability={availability}
              value={deliveryDate}
              onSelect={chooseDate}
              disabled={isPending}
            />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between border-t border-sky pt-6">
        <span className="font-owners-medium text-[12px] uppercase tracking-wide">
          {t.total}
        </span>
        <span className="font-archivo-light text-[15px]">{totalPrice}</span>
      </div>

      {/* Why checkout is not available yet, in the customer's terms. Shopify's
          hosted checkout cannot edit a cart attribute or refuse a basket, so
          every one of these has to be settled before we hand over. */}
      {blocker?.kind === "below-minimum" && (
        <p role="alert" className="font-archivo-light mt-6 text-[13px]">
          {interpolate(t.belowMinimum, {
            zone: blocker.zone.id,
            minimum: formatMoney(locale, blocker.zone.minimumOrder),
            shortfall: formatMoney(locale, blocker.shortfall),
          })}
        </p>
      )}

      {blocker?.kind === "no-address" && (
        <p role="alert" className="font-archivo-light mt-6 text-[13px]">
          {t.noAddress}
        </p>
      )}

      {needsDate ? (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="group mt-8 inline-block border border-sky bg-sky px-3 py-2.5 transition-colors duration-500 hover:bg-cream"
        >
          <span className="font-owners-medium inline-flex items-center gap-2 text-[11px] uppercase tracking-wide">
            {t.chooseDate}
            <span
              className="transition-transform duration-500 group-hover:translate-x-1.5"
              aria-hidden
            >
              &rarr;
            </span>
          </span>
        </button>
      ) : blocker ? (
        <span
          aria-disabled
          className="font-owners-medium mt-8 inline-block cursor-not-allowed border border-sky px-3 py-2.5 text-[11px] uppercase tracking-wide opacity-40"
        >
          {t.checkout}
        </span>
      ) : (
        <a
          href={checkoutUrl}
          className="group mt-8 inline-block border border-sky bg-sky px-3 py-2.5 transition-colors duration-500 hover:bg-cream"
        >
          <span className="font-owners-medium inline-flex items-center gap-2 text-[11px] uppercase tracking-wide">
            {t.checkout}
            <span
              className="transition-transform duration-500 group-hover:translate-x-1.5"
              aria-hidden
            >
              &rarr;
            </span>
          </span>
        </a>
      )}
    </>
  );
}
