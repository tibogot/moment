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
  /** The diet words, for the accessible name and the hover title. */
  labels: DietLabels;
  className?: string;
};

export function DietCode({ tags, labels, className }: DietCodeProps) {
  const keys = dietCodes(tags);
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
