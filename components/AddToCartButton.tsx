"use client";

import { useDictionary, useLocale } from "@/components/LocaleProvider";

import { useState, useTransition } from "react";
import { addToCart } from "@/app/actions/cart";
import { setCart } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

type AddToCartButtonProps = {
  variantId: string | null;
  available: boolean;
  className?: string;
};

export function AddToCartButton({
  variantId,
  available,
  className,
}: AddToCartButtonProps) {
  const locale = useLocale();
  const dict = useDictionary();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const disabled = !variantId || !available || isPending;

  const handleClick = () => {
    if (!variantId) return;
    setError(null);

    startTransition(async () => {
      const result = await addToCart(locale, variantId, quantity);

      if (!result.ok) {
        setError(dict.errors[result.code]);
        return;
      }

      setQuantity(1);
      // The mutation handed the new cart back, so the panel it is about to open
      // is already filled in — no refetch to wait on behind the slide-in.
      setCart(result.cart);
      window.dispatchEvent(new Event("cart-open"));
    });
  };

  const controlClass = cn(
    "border border-sky bg-sky transition-colors duration-500",
    disabled ? "opacity-40" : "hover:bg-cream",
  );

  return (
    <div className={className}>
      <div className="flex items-stretch gap-3">
        <div className={cn("flex shrink-0 items-stretch", controlClass)}>
          <button
            type="button"
            aria-label={dict.cart.decrease}
            disabled={disabled || quantity <= 1}
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            className="px-3 py-2.5 text-[13px] transition-opacity hover:opacity-60 disabled:cursor-not-allowed"
          >
            −
          </button>
          <span className="font-archivo-light flex min-w-8 items-center justify-center border-x border-sky px-3 py-2.5 text-center text-[13px]">
            {quantity}
          </span>
          <button
            type="button"
            aria-label={dict.cart.increase}
            disabled={disabled}
            onClick={() => setQuantity((current) => current + 1)}
            className="px-3 py-2.5 text-[13px] transition-opacity hover:opacity-60 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          className={cn(
            "min-w-0 flex-1 px-3 py-2.5",
            controlClass,
            disabled ? "cursor-not-allowed" : "",
          )}
        >
          <span className="font-owners-medium inline-flex w-full items-center justify-center text-[11px] uppercase tracking-wide">
            {!available ? dict.product.soldOut : isPending ? dict.product.adding : dict.product.addToCart}
          </span>
        </button>
      </div>

      {error && (
        <p className="font-archivo-light mt-3 text-[13px] text-black">{error}</p>
      )}
    </div>
  );
}
