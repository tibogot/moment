import type { ShopifyProductDetails as ProductDetailsData } from "@/lib/shopify/queries";

type ProductDetailsProps = {
  details: ProductDetailsData;
};

const DETAIL_SECTIONS = [
  { key: "servingSize", label: "Serving size" },
  { key: "ingredients", label: "Ingredients" },
  { key: "allergens", label: "Allergens" },
  { key: "traces", label: "May contain traces of" },
  { key: "dietary", label: "Dietary" },
  { key: "servingInstructions", label: "Serving instructions" },
  { key: "storage", label: "Storage" },
] as const satisfies ReadonlyArray<{
  key: keyof ProductDetailsData;
  label: string;
}>;

export function ProductDetails({ details }: ProductDetailsProps) {
  const sections = DETAIL_SECTIONS.filter(({ key }) => details[key]);

  if (sections.length === 0) return null;

  return (
    <div className="mt-8 space-y-6 border-t border-sky pt-8">
      {sections.map(({ key, label }) => (
        <div key={key}>
          <h2 className="font-owners-medium text-[12px] uppercase tracking-wide">
            {label}
          </h2>
          <p className="font-archivo-light mt-2 text-[18px] leading-[1.6] whitespace-pre-line">
            {details[key]}
          </p>
        </div>
      ))}
    </div>
  );
}
