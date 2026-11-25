import TextReveal from "@/components/TextReveal";
import { CellGrid } from "@/components/v2/CellGrid";
import { REVEAL_BLOCK } from "@/lib/colors";
import { cn } from "@/lib/utils";

type IntroCellsProps = {
  copy: { headline: string; body: string[] };
  /** h1 on the home: the line that names the trade and the city. */
  headingAs?: "h1" | "h2";
};

/**
 * The home's intro on the 16 / 12 / 4 grid (25 November 2026), in the shape
 * of the about page's statement (SplitStatementSection): the headline, then
 * two paragraphs side by side under it, the whole block centred — two
 * empty cells either side on desktop, one on a tablet — and the text
 * filling it (no measure cap), so its weight sits in the middle. No button: the section says
 * what Moment does and hands over to the products in the carousel below.
 *
 *   desktop  headline cells 3–14, the paragraphs' span (first line in
 *            by 2 cells);
 *            paragraphs cells 3–7 and 10–14, two cells apart
 *   tablet   headline cells 2–11; paragraphs cells 2–5 and 8–11
 *   phone    everything across the 4 cells, stacked
 *
 * The frame only, as on the FAQ; the text placed on the cells, a cell's
 * padding in from its line. A whole row between the headline and the
 * paragraphs; half a row above (a whole one sat the headline too far from
 * the hero) and below, where the carousel's tabs follow with no rule between
 * (it is `joined`).
 */
export function IntroCells({
  copy,
  headingAs: Heading = "h2",
}: IntroCellsProps) {
  return (
    <section className="relative w-full bg-cream">
      <CellGrid
        lineClassName="bg-sky"
        bands={false}
        cells={false}
        readout={false}
        subdivide={2}
      />
      <div
        className="relative grid gap-y-(--s-cell-h) pt-[calc(var(--s-cell-h)/2)] pb-[calc(var(--s-cell-h)/2)]"
        style={{ gridTemplateColumns: "var(--s-grid-columns)" }}
      >
        {/* text-left: TextReveal centres each split line unless an ancestor
            opts out. */}
        <div className="col-[2/span_4] min-w-0 px-(--v2-pad) text-left md:col-[3/span_10] lg:col-[4/span_12]">
          <TextReveal blockColor={REVEAL_BLOCK} stagger={0.12}>
            {/* First line set in by two cells, desktop only: a percentage of
                the headline (12 cells less a padding each side), not px —
                text-indent is inherited, and a px length set every word
                TextReveal splits in by two cells. */}
            <Heading className="font-owners-narrow-bold indent-first-line max-w-full text-[7vw] leading-[0.95] tracking-[-0.005em] text-balance wrap-break-word text-black uppercase md:text-[min(4.4vw,7svh)] lg:[--first-line-indent:calc((100%_+_2*var(--v2-pad))/6)]">
              {copy.headline}
            </Heading>
          </TextReveal>
        </div>

        {/* The paragraphs, two whole cells apart around the centre line:
            cells 3–7 and 10–14 on desktop, 2–5 and 8–11 on a tablet. */}
        <div className="col-[2/span_4] grid min-w-0 gap-y-[3svh] md:col-[3/span_10] md:grid-cols-10 lg:col-[4/span_12] lg:grid-cols-12">
          {copy.body.slice(0, 2).map((paragraph, index) => (
            <div
              key={paragraph}
              className={cn(
                "min-w-0 px-(--v2-pad) text-left",
                index === 0
                  ? "md:col-[1/span_4] lg:col-[1/span_5]"
                  : "md:col-[7/span_4] lg:col-[8/span_5]",
              )}
            >
              <TextReveal
                blockColor={REVEAL_BLOCK}
                stagger={0.08}
                duration={0.6}
              >
                <p className="font-archivo-light text-(length:--body-text) leading-normal wrap-break-word text-black text-pretty">
                  {paragraph}
                </p>
              </TextReveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
