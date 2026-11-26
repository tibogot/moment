"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { removeFromCart, updateCartLine } from "@/app/actions/cart";
import { useDictionary, useLocale } from "@/components/LocaleProvider";
import { notifyCartUpdated } from "@/lib/cart-store";

type CartLineControlsProps = {
  lineId: string;
  quantity: number;
  /** Fewest identical pieces a product can be ordered in. */
  minimum: number;
};

/**
 * − n + and Retirer for one line of the cart page — the same controls as the
 * slide-out panel. The page only printed "Quantité 10": a customer told
 * "ajoutez 50 € pour commander" had to go back to the shop or open the panel
 * to act on it (audit, 26 November 2026).
 *
 * The page is server-rendered, so each change is saved and the route re-read
 * rather than patched in place; the buttons wait for it. "−" stops at the
 * per-product minimum, as in the panel; "Retirer" takes the line out.
 */
export function CartLineControls({
  lineId,
  quantity,
  minimum,
}: CartLineControlsProps) {
  const dict = useDictionary();
  const locale = useLocale();
  const router = useRouter();
  const t = dict.cart;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const save = (next: number) => {
    setError(null);
    startTransition(async () => {
      const result =
        next === 0
          ? await removeFromCart(locale, lineId)
          : await updateCartLine(locale, lineId, next);
      if (!result.ok) {
        setError(dict.errors[result.code] ?? dict.errors.generic);
        return;
      }
      notifyCartUpdated();
      router.refresh();
    });
  };

  return (
    <div className="mt-2 flex flex-col items-start gap-2">
      <div className="flex items-center border border-sky">
        <button
          type="button"
          aria-label={t.decrease}
          disabled={isPending || quantity <= minimum}
          onClick={() => save(quantity - 1)}
          className="px-2.5 py-1 text-[15px] transition-opacity hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-30"
        >
          −
        </button>
        <span
          className="font-archivo-light min-w-8 text-center text-[13px]"
          aria-live="polite"
        >
          {quantity}
        </span>
        <button
          type="button"
          aria-label={t.increase}
          disabled={isPending}
          onClick={() => save(quantity + 1)}
          className="px-2.5 py-1 text-[15px] transition-opacity hover:opacity-60 disabled:opacity-30"
        >
          +
        </button>
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => save(0)}
        className="font-archivo-light text-[13px] underline underline-offset-2 transition-opacity hover:opacity-60 disabled:opacity-40"
      >
        {t.remove}
      </button>
      {error && (
        <p role="alert" className="font-archivo-light text-[13px]">
          {error}
        </p>
      )}
    </div>
  );
}
