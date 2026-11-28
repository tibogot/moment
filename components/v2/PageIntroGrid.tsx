import TextReveal from "@/components/TextReveal";
import { CellGrid } from "@/components/v2/CellGrid";
import { REVEAL_BLOCK } from "@/lib/colors";

type PageIntroGridProps = {
  title: string;
  lead?: string;
  /**
   * "small" for a page whose title is a long phrase rather than one word
   * ("Comment ça marche ? & FAQ"): about two-thirds of the usual size.
   * "intro": the home's intro headline ("Moment livre vos
   * petits-déjeuners…", IntroCells), same size and leading (Où nous
   * trouver, 28 November 2026).
   */
  size?: "default" | "small" | "intro";
  /**
   * Where the lead sits under the title: pushed right (the default, the
   * events and coffee pages), or from the left under the title's first
   * letter (Où nous trouver, 28 November 2026).
   */
  leadSide?: "right" | "left";
  /** A button under the lead (Collaborations: "Devenir partenaire"). */
  action?: { href: string; label: string };
};

/**
 * An inner page's header on the v2 grid: the v2 counterpart of
 * `components/PageIntro.tsx`, same title and lead, same type sizes.
 *
 * Built like the home's intro section (`IntroGridSection`): frame and bands,
 * cells not drawn, the two blocks in a subgrid on the page's columns — the
 * title from the page inset, the lead under it, pushed right, at a fixed gap.
 *
 * On the page grid (16 / 12 / 4 cells, --s-grid-columns), like the home and
 * the FAQ, with the text a cell's padding (--v2-pad) in from the lines.
 *
 * Columns, as cells:  mobile 4 — title 1–4, lead 2–4
 *                     tablet 12 — title 1–12, lead 5–12
 *                     desktop 16 — title 1–14, lead 9–16
 */
export function PageIntroGrid({ title, lead, size }: PageIntroGridProps) {
  return (
    <section className="relative w-full bg-cream">
      <CellGrid lineClassName="bg-sky" readout={false} cells={false} />
      <div style={{ paddingBlock: "var(--grid-band)" }}>
        <PageIntroContent title={title} lead={lead} size={size} />
      </div>
    </section>
  );
}

/**
 * The title and lead alone, without a section round them — for a page whose
 * first section continues straight into something else, like the photographs
 * on /events (`PhotoGridSection`'s `header`): one section, one band.
 */
export function PageIntroContent({
  title,
  lead,
  size = "default",
  leadSide = "right",
  action,
}: PageIntroGridProps) {
  return (
    <div
      className="relative grid"
      style={{ gridTemplateColumns: "var(--s-grid-columns)" }}
    >
      <div className="col-[2/span_4] grid grid-cols-subgrid gap-y-[5svh] pt-[8svh] pb-[7svh] md:col-[2/span_12] lg:col-[2/span_16]">
        <div className="col-[1/span_4] min-w-0 px-(--v2-pad) text-left md:col-[1/span_12] lg:col-[1/span_14]">
          <TextReveal
            blockColor={REVEAL_BLOCK}
            animateOnScroll={false}
            delay={0.15}
          >
            <h1
              className={`font-owners-narrow-bold max-w-full tracking-[-0.005em] wrap-break-word text-black uppercase ${
                size === "intro"
                  ? "text-[7vw] leading-[0.95] md:text-[min(4.4vw,7svh)]"
                  : size === "small"
                    ? "text-[8vw] leading-[0.9] md:text-[min(5.2vw,8svh)]"
                    : "text-[11vw] leading-[0.9] md:text-[min(8vw,12svh)]"
              }`}
            >
              {title}
            </h1>
          </TextReveal>
        </div>

        {lead && (
          <div
            className={
              leadSide === "left"
                ? "col-[1/span_4] min-w-0 px-(--v2-pad) text-left md:col-[1/span_8] lg:col-[1/span_8]"
                : "col-[2/span_3] min-w-0 px-(--v2-pad) text-left md:col-[5/span_8] lg:col-[9/span_8]"
            }
          >
            <TextReveal
              blockColor={REVEAL_BLOCK}
              animateOnScroll={false}
              delay={0.35}
            >
              <p className="font-archivo-light max-w-full text-(length:--body-text) leading-normal wrap-break-word text-black">
                {lead}
              </p>
            </TextReveal>
            {action && (
              <a
                href={action.href}
                className="mt-[4svh] inline-block border border-sky bg-sky px-3 py-2.5 transition-colors duration-500 hover:bg-cream"
              >
                <span className="font-owners-medium text-[14px] uppercase tracking-wide">
                  {action.label}
                </span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
