import { LocaleLink as Link } from "@/components/LocaleLink";
import { GridSection } from "@/components/GridSection";
import TextReveal from "@/components/TextReveal";
import { REVEAL_BLOCK } from "@/lib/colors";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * Reasons run two to a row, split 4/3 of the page's 7 columns. The seam is a
 * real column line, so the rule between the cells continues the one the hero
 * and the services index already draw — and the uneven halves keep the block
 * from reading as a card grid.
 */
const reasons = [
  {
    index: "01",
    title: "One number to call",
    body: "The person who answers writes the menu, and is still the person answering the week of the delivery. Nothing is subcontracted, so nothing is lost between two companies.",
    span: "wide",
  },
  {
    index: "02",
    title: "Quoted per head, all in",
    body: "Delivery, service, equipment and collection are in the figure we send you. No line items appearing three days before the event.",
    span: "narrow",
  },
  {
    index: "03",
    title: "Diets planned, not patched",
    body: "Vegetarian, vegan and gluten-free versions of the same dish, labelled and boxed separately. Nobody is handed a plate of side dishes.",
    span: "wide",
  },
  {
    index: "04",
    title: "A window we keep",
    body: "Brussels traffic is a known quantity, so we leave early and we call before you have to. If something moves, you hear it at six in the morning, not at noon.",
    span: "narrow",
  },
] as const;

/**
 * The reasons index, sitting between the services block and the calendar —
 * after the visitor knows what we do, before they are asked to pick a date.
 */
export function WhyUsSection() {
  return (
    <GridSection className="pt-[12svh] pb-[14svh]">
      <div className="col-start-2 col-end-5 px-(--grid-gutter) pb-[5svh] md:col-end-9">
        <h2 className="font-owners-medium text-[12px] uppercase tracking-wide">
          Why choose us
        </h2>
      </div>

      <div className="col-start-2 col-end-5 min-w-0 px-(--grid-gutter) pb-[6svh] text-left md:col-end-8">
        <TextReveal blockColor={REVEAL_BLOCK} stagger={0.12}>
          <p className="font-owners-narrow-bold max-w-full text-[8vw] leading-[0.95] tracking-[-0.005em] wrap-break-word uppercase md:text-[min(4.4vw,7svh)]">
            Good food is the easy part. This is the rest of it.
          </p>
        </TextReveal>
      </div>

      <div className="col-span-full border-t border-sky px-(--grid-margin)">
        <ol className="md:grid md:grid-cols-7">
          {reasons.map((reason) => (
            <li
              key={reason.index}
              className={cn(
                "flex flex-col border-b border-sky px-(--grid-gutter) py-[5svh] transition-colors duration-500 md:py-[6svh] hover:bg-sky/30",
                // The wide cell carries the rule, so both rows break on the
                // same column line rather than on their own midpoints.
                reason.span === "wide"
                  ? "md:col-span-4 md:border-r"
                  : "md:col-span-3",
              )}
            >
              <span className="font-archivo-light text-[12px] tabular-nums">
                {reason.index}
              </span>

              {/* text-left: TextReveal centres each split line unless an
                  ancestor opts out. */}
              <div className="mt-[3svh] text-left">
                <TextReveal blockColor={REVEAL_BLOCK} stagger={0.12}>
                  <h3 className="font-owners-narrow-bold max-w-full text-[8.5vw] leading-[0.95] tracking-[-0.005em] wrap-break-word uppercase md:text-[min(2.8vw,4.4svh)]">
                    {reason.title}
                  </h3>
                </TextReveal>
              </div>

              <div className="mt-5 text-left md:mt-[4svh]">
                <TextReveal
                  blockColor={REVEAL_BLOCK}
                  stagger={0.08}
                  duration={0.6}
                >
                  <p className="font-archivo-light max-w-full text-[18px] leading-normal md:max-w-[42ch]">
                    {reason.body}
                  </p>
                </TextReveal>
              </div>
            </li>
          ))}
        </ol>

        {/* Closing row, outside the ruled cells: the block already ends on a
            rule, so the button hangs off it rather than sitting in a box. */}
        <div className="px-(--grid-gutter) pt-[5svh]">
          <Link
            href={routes.contact}
            className="group inline-block border border-sky bg-sky px-3 py-2.5 transition-colors duration-500 hover:bg-cream"
          >
            <span className="font-owners-medium inline-flex items-center gap-2 text-[11px] uppercase tracking-wide">
              Talk to us
              <span
                className="transition-transform duration-500 group-hover:translate-x-1.5"
                aria-hidden
              >
                &rarr;
              </span>
            </span>
          </Link>
        </div>
      </div>
    </GridSection>
  );
}
