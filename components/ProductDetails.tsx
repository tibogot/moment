import type { ShopifyProductDetails as ProductDetailsData } from "@/lib/shopify/queries";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type ProductDetailsProps = {
  details: ProductDetailsData;
  copy: Dictionary["product"];
};

/**
 * Render order. The heading for each comes from the dictionary under the same
 * key, so a section cannot be added here without a label existing for it.
 */
const DETAIL_SECTIONS = [
  "servingSize",
  "ingredients",
  "allergens",
  "traces",
  "dietary",
  "servingInstructions",
  "storage",
] as const satisfies ReadonlyArray<keyof ProductDetailsData>;

export function ProductDetails({ details, copy }: ProductDetailsProps) {
  const sections = DETAIL_SECTIONS.filter((key) => details[key]);

  if (sections.length === 0) return null;

  return (
    <div className="mt-8 space-y-6 border-t border-sky pt-8">
      {sections.map((key) => (
        <div key={key}>
          <h2 className="font-owners-medium text-[12px] uppercase tracking-wide">
            {copy[key]}
          </h2>
          <p className="font-archivo-light mt-2 text-[18px] leading-[1.6] whitespace-pre-line">
            {details[key]}
          </p>
        </div>
      ))}
    </div>
  );
}
