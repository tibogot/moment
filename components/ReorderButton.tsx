"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { reorder } from "@/app/actions/cart";
import { useLocale } from "@/components/LocaleProvider";
import { notifyCartUpdated } from "@/lib/cart-store";
import { interpolate } from "@/lib/i18n/dictionaries";
import { href, routes } from "@/lib/routes";

type ReorderButtonProps = {
  orderId: string;
  /** Passed in by the account page rather than read from the client
   * dictionary, which only carries the sections every page needs. */
  labels: {
    reorder: string;
    reordering: string;
    skipped: string;
    nothingLeft: string;
    failed: string;
    expired: string;
    reload: string;
    goToCart: string;
  };
};

/**
 * "Recommander", for one past order.
 *
 * A clean reorder goes straight to the basket, which is where the day and the
 * window still have to be chosen. A partial one stays on the page long enough
 * to say what was left out — arriving at a basket with two products missing
 * and no explanation reads as a bug.
 */
export function ReorderButton({ orderId, labels }: ReorderButtonProps) {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    text: string;
    showCart: boolean;
    showReload?: boolean;
  } | null>(null);

  function handleClick() {
    setMessage(null);
    startTransition(async () => {
      const result = await reorder(locale, orderId);

      if (!result.ok) {
        // An expired sign-in is fixed by reloading: the account page sends an
        // expiring session through the refresh route on its way in.
        setMessage(
          result.code === "session_expired"
            ? { text: labels.expired, showCart: false, showReload: true }
            : { text: labels.failed, showCart: false },
        );
        return;
      }
      if (result.added === 0) {
        setMessage({ text: labels.nothingLeft, showCart: false });
        return;
      }

      // The navbar badge and the slide-out panel read the shared cart store,
      // which does not know a server action just filled the basket.
      notifyCartUpdated();
      if (result.skipped > 0) {
        setMessage({
          text: interpolate(labels.skipped, { count: String(result.skipped) }),
          showCart: true,
        });
        return;
      }

      router.push(href(locale, routes.cart));
    });
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="font-owners-medium border border-black px-5 py-2.5 text-[11px] uppercase tracking-wide transition-opacity hover:opacity-60 disabled:opacity-40"
      >
        {isPending ? labels.reordering : labels.reorder}
      </button>
      {message && (
        <p role="status" className="font-archivo-light text-[13px]">
          {message.text}{" "}
          {message.showReload && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="underline"
            >
              {labels.reload}
            </button>
          )}
          {message.showCart && (
            <a href={href(locale, routes.cart)} className="underline">
              {labels.goToCart}
            </a>
          )}
        </p>
      )}
    </div>
  );
}
