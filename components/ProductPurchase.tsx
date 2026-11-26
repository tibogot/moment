"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { useDictionary } from "@/components/LocaleProvider";
import type { AnalyticsItem } from "@/lib/analytics";
import type { ShopifyVariant } from "@/lib/shopify/queries";
import { cn } from "@/lib/utils";

type ProductPurchaseProps = {
  variants: ShopifyVariant[];
  /** The variant shown first (the first one for sale). */
  defaultVariantId: string | null;
  analyticsItem: AnalyticsItem;
  minimumQuantity: number;
  /** Rendered between the price and the size picker — the description. */
  children?: React.ReactNode;
};

/** Shopify's placeholder title for a product without options. */
const DEFAULT_TITLE = "Default Title";

/**
 * The price, the size and Add to cart on a product page (26 November 2026).
 *
 * The site used to read only the first variant, so a salad set up in M and L
 * showed one price and could only be bought in one size. With two variants or
 * more, the sizes appear as buttons — named as in Shopify ("M", "L") — and the
 * price and the variant added to the cart follow the choice. A product without
 * options looks exactly as before.
 */
export function ProductPurchase({
  variants,
  defaultVariantId,
  analyticsItem,
  minimumQuantity,
  children,
}: ProductPurchaseProps) {
  const dict = useDictionary();
  const choices = variants.filter((variant) => variant.title !== DEFAULT_TITLE);
  const hasChoice = choices.length > 1;
  const [selectedId, setSelectedId] = useState(
    defaultVariantId ?? variants[0]?.id ?? null,
  );
  const selected =
    variants.find((variant) => variant.id === selectedId) ?? variants[0];

  return (
    <>
      <p className="font-archivo-light mt-4 text-[16px]" aria-live="polite">
        {selected?.price}
      </p>

      {children}

      {hasChoice && (
        <fieldset className="mt-8">
          <legend className="font-owners-medium text-[12px] tracking-wide uppercase">
            {dict.product.size}
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {choices.map((variant) => {
              const active = variant.id === selected?.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  aria-pressed={active}
                  disabled={!variant.availableForSale}
                  onClick={() => setSelectedId(variant.id)}
                  className={cn(
                    "font-owners-medium min-w-14 border border-sky px-4 py-2.5 text-[12px] tracking-wide uppercase transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-40",
                    active ? "bg-sky" : "hover:bg-sky/30",
                  )}
                >
                  {variant.title}
                  <span className="font-archivo-light ml-2 normal-case opacity-70">
                    {variant.price}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <AddToCartButton
        // A new key per size: the stepper starts again at the minimum.
        key={selected?.id}
        variantId={selected?.id ?? null}
        available={selected?.availableForSale ?? false}
        analyticsItem={{
          ...analyticsItem,
          price: Number(selected?.priceAmount) || analyticsItem.price,
        }}
        minimumQuantity={minimumQuantity}
        className={hasChoice ? "mt-5" : "mt-8"}
      />
    </>
  );
}
