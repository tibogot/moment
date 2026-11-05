"use client";

import { useTransition } from "react";
import { beginCheckout } from "@/app/actions/cart";
import { useDictionary, useLocale } from "@/components/LocaleProvider";
import { analyticsIds, trackBeginCheckout } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type CheckoutButtonProps = {
  className?: string;
  labelClassName?: string;
  /**
   * Called with the sentence to show when the server refuses — something moved
   * since the page loaded. The caller re-reads the cart, so the blocker it then
   * draws is the up-to-date reason.
   */
  onRefused: (message: string) => void;
};

/**
 * The one door to Shopify's checkout, shared by the cart page and the panel.
 *
 * A button rather than a link to `checkoutUrl`, because the rules are checked
 * again on the server at the moment of leaving — see `beginCheckout`. The page
 * never holds the checkout address at all.
 */
export function CheckoutButton({
  className,
  labelClassName,
  onRefused,
}: CheckoutButtonProps) {
  const dict = useDictionary();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const go = () => {
    startTransition(async () => {
      try {
        const result = await beginCheckout(locale, await analyticsIds());
        if (!result.ok) {
          onRefused(dict.errors[result.code] ?? dict.errors.generic);
          return;
        }
        trackBeginCheckout(result.value, result.items);
        // A beat for the event to leave before the page does. Without consent
        // there is no tag and nothing to wait for.
        if (typeof (window as { gtag?: unknown }).gtag === "function") {
          await new Promise((resolve) => setTimeout(resolve, 150));
        }
        window.location.assign(result.url);
      } catch {
        onRefused(dict.errors.generic);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={go}
      disabled={isPending}
      aria-busy={isPending}
      className={cn("group disabled:cursor-wait disabled:opacity-60", className)}
    >
      <span
        className={cn(
          "font-owners-medium inline-flex items-center gap-2 text-[11px] uppercase tracking-wide",
          labelClassName,
        )}
      >
        {dict.cart.checkout}
        <span
          className="transition-transform duration-500 group-hover:translate-x-1.5"
          aria-hidden
        >
          &rarr;
        </span>
      </span>
    </button>
  );
}
