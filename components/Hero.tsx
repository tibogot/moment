import { GridLines } from "@/components/GridLines";
import { HeroParallaxImage } from "@/components/HeroParallaxImage";
import TextReveal from "@/components/TextReveal";
import { GRID_COLUMNS, GRID_COLUMNS_MOBILE, type GridHole } from "@/lib/grid";

/**
 * The hero draws its rules and type in cream, so the reveal wipes in cream —
 * the cream sections use sky for the same reason.
 */
const CREAM = "#f8f7f2";

/** Cells the type sits in, so the rules can be dropped there. */
const holes: GridHole[] = [
  { col: [1, 5], row: [2, 3] }, // headline
  { col: [6, 7], row: [3, 3] }, // paragraph
];

const mobileHoles: GridHole[] = [
  { col: [1, 3], row: [3, 3] }, // headline
  { col: [2, 3], row: [2, 2] }, // paragraph
];

export function Hero() {
  return (
    <section
      className="relative h-svh w-full overflow-hidden"
      data-transparent-nav
    >
      <HeroParallaxImage src="/images/anita-austvika.jpg" />
      <div className="absolute inset-0 bg-black/20" aria-hidden />

      <GridLines
        ruled
        columns={GRID_COLUMNS_MOBILE}
        holes={mobileHoles}
        className="md:hidden"
      />
      <GridLines
        ruled
        columns={GRID_COLUMNS}
        holes={holes}
        className="hidden md:block"
      />

      <div
        className="absolute inset-0 grid text-cream"
        style={{
          gridTemplateColumns: "var(--grid-columns)",
          gridTemplateRows: "var(--grid-rows)",
        }}
      >
        {/* text-left is required: the TextReveal CSS centres each split line
            unless an ancestor opts out. */}
        <div className="col-start-2 col-end-5 row-start-4 row-end-5 min-w-0 self-end px-(--grid-gutter) pb-4 text-left md:col-end-7 md:row-start-3 md:row-end-5 md:pb-[3.3svh]">
          <TextReveal animateOnScroll={false} blockColor={CREAM} delay={0.25}>
            <h1
              className="font-owners-narrow-bold max-w-full leading-[0.9] tracking-[-0.005em] uppercase"
              style={{ fontSize: "var(--hero-headline)" }}
            >
              Un moment
              <br />
              gourmand,
              <br />
              simplement.
            </h1>
          </TextReveal>
        </div>

        <div className="col-start-3 col-end-5 row-start-3 row-end-4 min-w-0 self-end px-(--grid-gutter) pb-4 text-right md:col-start-7 md:col-end-9 md:row-start-4 md:row-end-5 md:pb-[4.3svh]">
          <TextReveal
            animateOnScroll={false}
            blockColor={CREAM}
            delay={0.5}
            stagger={0.08}
            duration={0.6}
          >
            <p
              className="font-archivo-light max-w-full leading-[1.43]"
              style={{ fontSize: "var(--hero-body)" }}
            >
              Moment, c&apos;est un traiteur pour particuliers et entreprises,
              celles qui veulent projeter leur image auprès de leurs clients.
            </p>
          </TextReveal>
        </div>
      </div>
    </section>
  );
}
