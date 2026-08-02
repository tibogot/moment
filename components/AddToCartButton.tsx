"use client";

import { useState, useTransition } from "react";
import { addToCart } from "@/app/actions/cart";
import { notifyCartUpdated } from "@/lib/cart-store";
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
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const disabled = !variantId || !available || isPending;

  const handleClick = () => {
    if (!variantId) return;
    setError(null);

    startTransition(async () => {
      const result = await addToCart(variantId);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      notifyCartUpdated();
      window.dispatchEvent(new Event("cart-open"));
    });
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          "group inline-block border border-sky bg-sky px-3 py-2.5 transition-colors duration-500",
          disabled
            ? "cursor-not-allowed opacity-40"
            : "hover:bg-cream",
        )}
      >
        <span className="font-owners-medium inline-flex items-center gap-2 text-[11px] uppercase tracking-wide">
          {!available ? "Sold out" : isPending ? "Adding…" : "Add to cart"}
          {!disabled && (
            <span
              className="transition-transform duration-500 group-hover:translate-x-1.5"
              aria-hidden
            >
              &rarr;
            </span>
          )}
        </span>
      </button>

      {error && (
        <p className="font-archivo-light mt-3 text-[13px] text-black">
          {error}
        </p>
      )}
    </div>
  );
}
