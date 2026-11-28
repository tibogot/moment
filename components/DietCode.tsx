import { normalizeTag } from "@/lib/shopify/filters";
import type { DietLabels } from "@/components/DietBadges";
import { cn } from "@/lib/utils";

/**
 * The diet as the owners' labels write it (28 November 2026): in parentheses,
 * lowercase, in Owners Medium — "(gf, v)", "(vg)", "(v)" — the logo's
 * parentheses again. gf for gluten free first, then v (vegetarian) or vg
 * (vegan; vegan implies vegetarian, so it shows alone). From the product's
 * Shopify tags, the same ones the shop's filters use, so a code and a filter
 * can never disagree.
 *
 * The codes are the packaging's, in English in every language; the words
 * are spelt out for screen readers and in the hover title, and the shop's
 * diet filter gives the key.
 */
export const DIET_CODES = {
  "sans-gluten": "gf",
  vegetarien: "v",
  vegan: "vg",
} as const;

/**
 * The product types whose labels carry no diet code: a cold-pressed juice is
 * fruit and vegetables only, always vegan and gluten free, so the can says
 * "Cold Pressed Juice" there instead (28 November 2026). The French type the
 * owners use today and the English family name, in case they switch. Their
 * tags stay, so the diet filters still find them.
 */
const NO_CODE_TYPES = new Set(["jus presses a froid", "cold pressed juice"]);

const normalizeType = (type: string) =>
  type
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z]+/g, " ")
    .trim();

/** False for the juices, whose labels carry no diet code. */
export function showsDietCode(productType: string | null | undefined) {
  return !productType || !NO_CODE_TYPES.has(normalizeType(productType));
}

export function dietCodes(tags: readonly string[]) {
  const set = new Set(tags.map(normalizeTag));
  const keys = [
    set.has("sans-gluten") ? "sans-gluten" : null,
    set.has("vegan") ? "vegan" : set.has("vegetarien") ? "vegetarien" : null,
  ].filter((key): key is keyof typeof DIET_CODES => key !== null);
  return keys;
}

type DietCodeProps = {
  tags: readonly string[];
  /** The product's type: no code for the juices (showsDietCode). */
  productType?: string | null;
  /** The diet words, for the accessible name and the hover title. */
  labels: DietLabels;
  className?: string;
};

export function DietCode({
  tags,
  productType,
  labels,
  className,
}: DietCodeProps) {
  const keys = showsDietCode(productType) ? dietCodes(tags) : [];
  if (keys.length === 0) return null;
  const words = keys.map((key) => labels[key]).join(", ");

  return (
    <abbr
      title={words}
      aria-label={words}
      className={cn(
        "font-owners-medium no-underline decoration-transparent",
        className,
      )}
    >
      ({keys.map((key) => DIET_CODES[key]).join(", ")})
    </abbr>
  );
}
