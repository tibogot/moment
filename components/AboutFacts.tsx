import { GridSection } from "@/components/GridSection";
import TextReveal from "@/components/TextReveal";
import { REVEAL_BLOCK } from "@/lib/colors";
import { cn } from "@/lib/utils";

/**
 * Placeholder values — confirm the founding year, the delivery radius and the
 * lead times with the kitchen before launch. They are the answers people search
 * for, so they are worth getting exactly right.
 */
const facts = [
  { term: "Based", value: "Brussels, Belgium" },
  { term: "Since", value: "2015" },
  { term: "We cook for", value: "Private hosts, offices, agencies, embassies" },
  { term: "Services", value: "Daily delivery, event catering, coffee desk" },
  {
    term: "Delivery area",
    value: "Brussels-Capital Region, and the ring on request",
  },
  { term: "Lead time", value: "48 hours for delivery, two weeks for events" },
  {
    term: "Diets",
    value: "Vegetarian, vegan and gluten-free on every menu",
  },
  { term: "Languages", value: "English, Français, Nederlands" },
] as const;

/**
 * The practical answers, set as a ruled two-column table. Plain text on the
 * page rather than a graphic, so it is readable to a search engine as well as
 * to somebody deciding whether to send an enquiry.
 */
export function AboutFacts() {
  return (
    <GridSection className="pt-[12svh] pb-[14svh]">
      <div className="col-start-2 col-end-5 px-(--grid-gutter) pb-[5svh] md:col-end-9">
        <h2 className="font-owners-medium text-[12px] uppercase tracking-wide">
          At a glance
        </h2>
      </div>

      <div className="col-start-2 col-end-5 min-w-0 px-(--grid-gutter) pb-[6svh] text-left md:col-end-8">
        <TextReveal blockColor={REVEAL_BLOCK} stagger={0.12}>
          <p className="font-owners-narrow-bold max-w-full text-[8vw] leading-[0.95] tracking-[-0.005em] wrap-break-word uppercase md:text-[min(4.4vw,7svh)]">
            The details people ask before they ask for a menu.
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
