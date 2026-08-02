import { GridSection } from "@/components/GridSection";
import TextReveal from "@/components/TextReveal";
import { REVEAL_BLOCK } from "@/lib/colors";

const principles = [
  {
    index: "01",
    title: "Seasonal, or not at all",
    body: "The menu follows the market rather than the other way round. Asparagus in May, tomatoes when they actually taste of something, chicory and game through the winter. If it is not good this week, it is not on the list this week.",
  },
  {
    index: "02",
    title: "Cooked, never assembled",
    body: "Stocks reduced overnight, dressings mixed at the last minute, pastry laminated by hand. Everything leaves our own kitchen in Brussels, made from raw ingredients that same morning — nothing reheated, nothing bought in finished.",
  },
  {
    index: "03",
    title: "Delivered ready to serve",
    body: "Insulated boxes, portions already set, garnishes kept separate. You unwrap it, arrange it and serve it. No kitchen needed at your end, and nothing that has to be plated by someone who would rather be hosting.",
  },
  {
    index: "04",
    title: "One kitchen, one standard",
    body: "The same food goes to a two-person desk lunch and a two-hundred-guest reception. Scale changes the number of hands and the hour we start, not the recipe or what we are willing to send out.",
  },
] as const;

/**
 * The working principles, as a ruled index. Rows run the full width like the
 * collections block — the rules reach the viewport edges while the type stays
 * on the page's columns.
 */
export function AboutPrinciples() {
  return (
    <GridSection className="pt-[12svh] pb-[14svh]">
      <div className="col-start-2 col-end-5 px-(--grid-gutter) pb-[5svh] md:col-end-9">
        <h2 className="font-owners-medium text-[12px] uppercase tracking-wide">
          How we work
        </h2>
      </div>

      <div className="col-span-full border-t border-sky px-(--grid-margin)">
        <ol>
          {principles.map((principle) => (
            <li
              key={principle.index}
              className="grid border-b border-sky px-(--grid-gutter) py-[5svh] transition-colors duration-500 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-x-(--grid-gutter) md:py-[6svh] hover:bg-sky/30"
            >
              {/* text-left: TextReveal centres each split line unless an
                  ancestor opts out. */}
              <div className="flex items-start gap-4 text-left md:gap-6">
                <span className="font-archivo-light shrink-0 pt-[0.5em] text-[12px] tabular-nums">
                  {principle.index}
                </span>

                <TextReveal blockColor={REVEAL_BLOCK} stagger={0.12}>
                  <h3 className="font-owners-narrow-bold max-w-full text-[9vw] leading-[0.95] tracking-[-0.005em] wrap-break-word uppercase md:text-[min(3.4vw,5.5svh)]">
                    {principle.title}
                  </h3>
                </TextReveal>
              </div>

              <div className="mt-5 text-left md:mt-0 md:pt-[0.6em]">
                <TextReveal
                  blockColor={REVEAL_BLOCK}
                  stagger={0.08}
                  duration={0.6}
                >
                  <p className="font-archivo-light max-w-full text-[18px] leading-normal md:max-w-[48ch]">
                    {principle.body}
                  </p>
                </TextReveal>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </GridSection>
  );
}
