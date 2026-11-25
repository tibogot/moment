"use client";

import { useDictionary } from "@/components/LocaleProvider";
import {
  DELIVERY_METHODS,
  type DeliveryMethod,
} from "@/lib/delivery/order-preferences";
import { cn } from "@/lib/utils";

type DeliveryMethodToggleProps = {
  /** Null until the customer has picked one: there is no default. */
  value: DeliveryMethod | null;
  onChange: (method: DeliveryMethod) => void;
  disabled?: boolean;
  className?: string;
};

/**
 * Livraison à domicile | Click & collect, at the top of both checkout
 * surfaces (the slide-out panel and the cart page).
 *
 * It used to be chosen only on the product page and merely shown here. But a
 * basket filled from the shop grid never passes that bar, and a cart that
 * opened on "Choisir une date de livraison" with no way out read as "they only
 * deliver" to someone who meant to collect. The cart is the last stop before
 * Shopify's checkout, which cannot change the method, so it is where the
 * choice has to be editable.
 *
 * No default on purpose: neither button is pressed until one is clicked, and
 * the date and time stay hidden until then — nobody pays a delivery fee they
 * did not notice they had chosen.
 */
export function DeliveryMethodToggle({
  value,
  onChange,
  disabled = false,
  className,
}: DeliveryMethodToggleProps) {
  const dict = useDictionary();

  return (
    <div
      role="group"
      aria-label={dict.orderBar.howLike}
      className={cn("grid grid-cols-2 border border-sky", className)}
    >
      {DELIVERY_METHODS.map((method, index) => (
        <button
          key={method}
          type="button"
          aria-pressed={value === method}
          disabled={disabled}
          onClick={() => {
            if (value !== method) onChange(method);
          }}
          className={cn(
            "font-owners-medium px-2 py-2.5 text-center text-[11px] uppercase tracking-wide transition-colors duration-300 disabled:opacity-40",
            index > 0 && "border-l border-sky",
            value === method ? "bg-sky" : "hover:bg-sky/30",
          )}
        >
          {dict.deliveryMethods[method].label}
        </button>
      ))}
    </div>
  );
}
