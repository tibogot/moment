"use client";

import { useState, useTransition } from "react";
import { setDeliveryDate } from "@/app/actions/cart";
import { DeliveryDatePicker } from "@/components/DeliveryDatePicker";
import { notifyCartUpdated } from "@/lib/cart-store";
import {
  LEAD_TIME_DAYS,
  formatDeliveryDate,
  isBookable,
  type DeliveryAvailability,
} from "@/lib/delivery";
import { useRouter } from "next/navigation";

type CartDeliverySectionProps = {
  availability: DeliveryAvailability;
  deliveryDate: string | null;
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
  deliveryDate,
  totalPrice,
  checkoutUrl,
}: CartDeliverySectionProps) {
  const router = useRouter();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const dateIsStale = Boolean(
    deliveryDate && !isBookable(deliveryDate, availability),
  );
  const needsDate = !deliveryDate || dateIsStale;

  const chooseDate = (iso: string) => {
    setError(null);
    startTransition(async () => {
      const result = await setDeliveryDate(iso);
      if (!result.ok) {
        setError(result.error);
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
            Delivery
          </span>

          {deliveryDate && !dateIsStale ? (
            <span className="flex items-baseline gap-4">
              <span className="font-archivo-light text-[13px]">
                {formatDeliveryDate(deliveryDate)}
              </span>
              <button
                type="button"
                onClick={() => setPickerOpen((open) => !open)}
                className="font-archivo-light text-[13px] underline underline-offset-4 transition-opacity hover:opacity-60"
              >
                {pickerOpen ? "Done" : "Change"}
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setPickerOpen((open) => !open)}
              className="font-archivo-light text-[13px] underline underline-offset-4 transition-opacity hover:opacity-60"
            >
              {dateIsStale ? "Pick another day" : "Pick a date"}
            </button>
          )}
        </div>

        {dateIsStale && deliveryDate && (
          <p role="alert" className="font-archivo-light mt-2 text-[13px]">
            {formatDeliveryDate(deliveryDate)} is no longer available. Please
            pick another day.
          </p>
        )}

        {error && (
          <p role="alert" className="font-archivo-light mt-2 text-[13px]">
            {error}
          </p>
        )}

        {pickerOpen && (
          <div className="mt-5 max-w-[420px] border border-sky">
            <p className="font-archivo-light px-6 pt-5 text-[13px] leading-normal">
              Blue days are closed or already full — we need {LEAD_TIME_DAYS}{" "}
              days&apos; notice and we do not deliver on Sundays.
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
          Total
        </span>
        <span className="font-archivo-light text-[15px]">{totalPrice}</span>
      </div>

      {needsDate ? (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="font-owners-medium mt-8 inline-block bg-black px-8 py-4 text-[12px] uppercase tracking-wide text-cream transition-opacity hover:opacity-80"
        >
          Choose a delivery date
        </button>
      ) : (
        <a
          href={checkoutUrl}
          className="font-owners-medium mt-8 inline-block bg-black px-8 py-4 text-[12px] uppercase tracking-wide text-cream transition-opacity hover:opacity-80"
        >
          Checkout
        </a>
      )}
    </>
  );
}
