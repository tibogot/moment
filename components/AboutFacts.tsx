import type { Dictionary } from "@/lib/i18n/dictionaries";
import { GridSection } from "@/components/GridSection";
import TextReveal from "@/components/TextReveal";
import { REVEAL_BLOCK } from "@/lib/colors";
import { cn } from "@/lib/utils";

/**
 * The founding year, which is the same sentence in every language and so has no
 * entry in the dictionary. Still a placeholder — confirm it with the kitchen.
 */
const FOUNDED = "2015";

/**
 * The order the rows appear in. The words live in the dictionary under the same
 * keys, so adding a fact means adding it here and in three dictionaries — which
 * is the point: a fact that exists in one language and not the others would
 * otherwise ship silently.
 */
const FACT_KEYS = [
  "based",
  "since",
  "cookFor",
  "services",
  "deliveryArea",
  "leadTime",
  "diets",
  "languages",
] as const;

/**
 * The practical answers, set as a ruled two-column table. Plain text on the
 * page rather than a graphic, so it is readable to a search engine as well as
 * to somebody deciding whether to send an enquiry.
 */
export function AboutFacts({ copy }: { copy: Dictionary["about"]["facts"] }) {
  // Paired by key rather than by position: `since` carries a year, which is
  // the same in every language and therefore has no entry in `values`.
  const facts = FACT_KEYS.map((key) => ({
    term: copy.terms[key],
    value: key === "since" ? FOUNDED : copy.values[key],
  }));

  return (
    <GridSection className="pt-[12svh] pb-[14svh]">
      <div className="col-start-2 col-end-5 px-(--grid-gutter) pb-[5svh] md:col-end-9">
        <h2 className="font-owners-medium text-[12px] uppercase tracking-wide">
          {copy.label}
        </h2>
      </div>

      <div className="col-start-2 col-end-5 min-w-0 px-(--grid-gutter) pb-[6svh] text-left md:col-end-8">
        <TextReveal blockColor={REVEAL_BLOCK} stagger={0.12}>
          <p className="font-owners-narrow-bold max-w-full text-[8vw] leading-[0.95] tracking-[-0.005em] wrap-break-word uppercase md:text-[min(4.4vw,7svh)]">
            {copy.headline}
          </p>
        </TextReveal>
      </div>

      <div className="col-span-full border-t border-sky px-(--grid-margin)">
        <dl className="md:grid md:grid-cols-2">
          {facts.map((fact, index) => (
            <div
              key={fact.term}
              className={cn(
                "flex flex-col gap-1 border-b border-sky px-(--grid-gutter) py-[2.6svh] md:flex-row md:items-baseline md:justify-between md:gap-6 md:py-[3svh]",
                // Second column of the pair — the rule between them.
                index % 2 === 1 && "md:border-l",
              )}
            >
              <dt className="font-owners-medium shrink-0 text-[11px] uppercase tracking-wide">
                {fact.term}
              </dt>
              <dd className="font-archivo-light text-[16px] leading-normal md:max-w-[32ch] md:text-right md:text-[17px]">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </GridSection>
  );
}
