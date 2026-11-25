import type { CSSProperties } from "react";
import Image, { type StaticImageData } from "next/image";
import { CellGrid } from "@/components/v2/CellGrid";
import { cn } from "@/lib/utils";

/**
 * /v2/systeme (23 November 2026): one grid for the whole page, to judge
 * whether it holds together from the hero to the footer.
 *
 * The rule, everywhere:
 * - 16 cells on desktop, 12 on a tablet, 4 on a phone (--s-cols): each
 *   page column cut in two, so every placement below is in whole cells.
 * - Every cell exactly 3/4 (--s-cell-w × --s-cell-h), never stretched. A
 *   block of n × n cells is 3/4 too.
 * - A section is a whole number of rows. Only the bands change height: on
 *   the full-screen hero the bottom band takes what is left over.
 * - Content sits in a block of cells (`data-grid-hole`): no rule crosses it,
 *   the rules around it stay.
 *
 * Cell n is grid column n + 1 (column 1 is the left margin).
 */

const CELL_W = "var(--s-cell-w)";
const CELL_H = "var(--s-cell-h)";

/** Grid of whole cells: --rows rows of exact 3/4 cells. */
function cellRows(): CSSProperties {
  return {
    gridTemplateColumns: "var(--s-grid-columns)",
    gridTemplateRows: `repeat(var(--rows), ${CELL_H})`,
  };
}

// ---------------------------------------------------------------- hero

/**
 * 100svh: the navbar's band on top, as many whole rows as fit, and a bottom
 * band of what is left (at least half a band), with the services in it. The
 * logo on a block of 4 cells, centred across, on the row nearest the middle.
 */
export function SystemHero({ services }: { services: string[] }) {
  const style = {
    // Whole rows in the screen, keeping at least half a band at the bottom.
    "--field": `round(down, calc(100svh - 1.5 * var(--grid-band)), ${CELL_H})`,
    "--foot": "calc(100svh - var(--grid-band) - var(--field))",
  } as CSSProperties;

  return (
    <section
      className="relative h-svh w-full overflow-hidden bg-cream"
      style={style}
    >
      <CellGrid
        lineClassName="bg-sky"
        subdivide={2}
        bottomBand="var(--foot)"
        readout={false}
      />

      {/* Logo: 4 cells wide, 1 row tall, centred on the middle line. */}
      <div
        data-grid-hole
        className="absolute flex items-center justify-center"
        style={{
          left: `calc(var(--grid-margin) + (var(--s-cols) / 2 - 2) * ${CELL_W})`,
          width: `calc(4 * ${CELL_W})`,
          top: `calc(var(--grid-band) + round(nearest, calc((var(--field) - ${CELL_H}) / 2), ${CELL_H}))`,
          height: CELL_H,
        }}
      >
        <Image
          src="/brand/Moment-Logotype.svg"
          alt="Moment"
          width={1437}
          height={220}
          priority
          className="h-auto w-[62%] brightness-0 md:w-[75%]"
        />
      </div>

      {/* The services, in the bottom band. */}
      <ul
        className="font-owners-medium absolute inset-x-0 bottom-0 flex items-center justify-center gap-x-[clamp(6px,2vw,14px)] px-(--grid-inset) text-[11px] tracking-wide uppercase md:text-[14px]"
        style={{ height: "var(--foot)" }}
      >
        {services.map((service, index) => (
          <li
            key={service}
            className="flex items-center gap-x-[clamp(6px,2vw,14px)] whitespace-nowrap"
          >
            {index > 0 && <span aria-hidden>-</span>}
            {service}
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * The hero without the 100svh lock (24 November 2026, the client agrees it
 * need not be exactly one screen): the logo's row is centred on the first
 * screen, both ways, and the grid is built from it — exact 3/4 cells up to
 * the navbar (the top row cut by it, as if the grid ran on under it) and
 * down past the fold, ending on the first row edge after 100svh, so the
 * next section carries on the same grid.
 */
export function SystemHeroCentred() {
  const style = {
    // Top of the logo's row, centred on the first screen.
    "--logo-top": `calc(50svh - ${CELL_H} / 2)`,
    // A row edge sits every cell height from it; the first one below the
    // section's top is at --first.
    "--first": `mod(var(--logo-top), ${CELL_H})`,
    // The first row edge at or after 100svh.
    height: `calc(var(--first) + round(up, calc(100svh - var(--first)), ${CELL_H}))`,
  } as CSSProperties;

  return (
    <section className="relative w-full overflow-hidden bg-cream" style={style}>
      <CellGrid
        lineClassName="bg-sky"
        subdivide={2}
        // A line-thick bottom band: the closing rule sits inside the
        // section instead of being clipped at its edge.
        bottomBand="var(--grid-line)"
        readout={false}
      />

      {/* Logo: 4 cells wide, 1 row tall, at the centre of the first screen.
          It is also the anchor the rows are built from. */}
      <div
        data-grid-hole
        data-grid-anchor
        className="absolute flex items-center justify-center"
        style={{
          left: `calc(var(--grid-margin) + (var(--s-cols) / 2 - 2) * ${CELL_W})`,
          width: `calc(4 * ${CELL_W})`,
          top: "var(--logo-top)",
          height: CELL_H,
        }}
      >
        <Image
          src="/brand/Moment-Logotype.svg"
          alt="Moment"
          width={1437}
          height={220}
          priority
          className="h-auto w-[62%] brightness-0 md:w-[75%]"
        />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- split

/**
 * Half text, half image, as on the events mockup. Desktop 16 × 6: image on
 * cells 9–16, title bottom-left on cells 1–6. Tablet 12 × 6: image 7–12.
 * Phone 4 × 6: image on top (4 × 3), title under it.
 *
 * Without a lead, the title alone on the last row, sized to one row: the
 * block that clears the rules hugs the type, so only the cells the word
 * actually touches open, and the grid stays closed around it — contain the
 * text, close every cell it does not need.
 */
export function SystemSplit({
  title,
  lead,
  image,
  hero = false,
}: {
  title: string;
  lead?: string;
  image: StaticImageData;
  /**
   * A page's first section (/v2/evenements): under the navbar's band, the
   * title as the page's h1, the last row closed by a rule of its own (the
   * footer after it opens on a band, not a rule).
   */
  hero?: boolean;
}) {
  const Heading = hero ? "h1" : "h2";
  return (
    <section
      className="relative w-full bg-cream"
      style={hero ? { paddingTop: "var(--grid-band)" } : undefined}
    >
      <CellGrid
        lineClassName="bg-sky"
        bands={hero}
        bottomBand={hero ? "var(--grid-line)" : undefined}
        readout={false}
        subdivide={2}
        diagonal
        linesOnTop
      />
      <div className="relative grid [--rows:6]" style={cellRows()}>
        <div
          data-grid-hole
          className="relative col-[2/span_4] row-[1/span_3] md:col-[8/span_6] md:row-[1/span_6] lg:col-[10/span_8]"
        >
          {/* Fills its block; the rules are drawn over it (linesOnTop), so
              they meet the photograph exactly. */}
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 48rem) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        {lead ? (
          <div
            data-grid-hole
            className={cn(
              "col-[2/span_4] flex min-w-0 flex-col justify-end gap-3 p-(--v2-pad) md:col-[2/span_5] lg:col-[2/span_6]",
              // A page's lead is longer than a section's: three rows from tablet
              // up (cells are short there); two on a phone.
              hero ? "row-[5/span_2] md:row-[4/span_3]" : "row-[5/span_2]",
            )}
          >
            <Heading className="font-owners-narrow-bold text-[13vw] leading-[0.9] tracking-[-0.005em] uppercase md:text-[length:calc(var(--s-cell-w)*0.85)]">
              {title}
            </Heading>
            <p
              className={cn(
                "font-archivo-light text-(length:--body-text) leading-snug",
                hero ? "max-w-[44ch]" : "max-w-[30ch]",
              )}
            >
              {lead}
            </p>
          </div>
        ) : (
          // The row is the frame; the hole is the word itself. The hole is
          // measured on the h2's content box, so the span's right padding
          // counts: a word ending close to a rule clears the next cell
          // too, and no vertical rule ever comes nearer than --v2-pad.
          <div className="col-[2/span_4] row-[6/span_1] flex items-end md:col-[2/span_6] lg:col-[2/span_8]">
            <h2
              data-grid-hole
              className="font-owners-narrow-bold w-fit p-(--v2-pad) text-[length:calc(var(--s-cell-h)*0.5)] leading-[0.85] tracking-[-0.005em] whitespace-nowrap uppercase"
            >
              <span className="block pr-(--v2-pad)">{title}</span>
            </h2>
          </div>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- steps

/**
 * "Comment ça marche ?" in 4 steps, each a square block of cells (so 3/4):
 * desktop 4 × 4 cells side by side, tablet 3 × 3, phone 2 × 2 in two rows.
 * The title in the first row.
 */
const STEP_PLACEMENT = [
  "col-[2/span_2] row-[2/span_2] md:col-[2/span_3] md:row-[2/span_3] lg:col-[2/span_4] lg:row-[2/span_4]",
  "col-[4/span_2] row-[2/span_2] md:col-[5/span_3] md:row-[2/span_3] lg:col-[6/span_4] lg:row-[2/span_4]",
  "col-[2/span_2] row-[4/span_2] md:col-[8/span_3] md:row-[2/span_3] lg:col-[10/span_4] lg:row-[2/span_4]",
  "col-[4/span_2] row-[4/span_2] md:col-[11/span_3] md:row-[2/span_3] lg:col-[14/span_4] lg:row-[2/span_4]",
];

export function SystemSteps({
  title,
  steps,
}: {
  title: string;
  steps: { title: string; body: string }[];
}) {
  return (
    <section className="relative w-full bg-cream">
      <CellGrid
        lineClassName="bg-sky"
        bands={false}
        readout={false}
        subdivide={2}
      />
      <div
        className="relative grid [--rows:5] md:[--rows:4] lg:[--rows:5]"
        style={cellRows()}
      >
        <div
          data-grid-hole
          className="col-[2/span_4] row-[1/span_1] flex items-end p-(--v2-pad) md:col-[2/span_8]"
        >
          <h2 className="font-owners-narrow-bold text-[7vw] leading-[0.9] tracking-[-0.005em] uppercase md:text-[length:calc(var(--s-cell-w)*0.55)]">
            {title}
          </h2>
        </div>

        <ol className="contents">
          {steps.slice(0, 4).map((step, index) => (
            <li
              key={step.title}
              data-grid-hole
              className={cn(
                "flex min-w-0 flex-col justify-between p-(--v2-pad) [container-type:inline-size]",
                STEP_PLACEMENT[index],
              )}
            >
              <span className="font-owners-narrow-bold text-[length:calc(100cqw*0.22)] leading-none tabular-nums">
                {`( ${String(index + 1).padStart(2, "0")} )`}
              </span>
              <span className="flex flex-col gap-2">
                <span className="font-owners-medium text-[12px] tracking-wide uppercase md:text-[13px]">
                  {step.title}
                </span>
                <span className="font-archivo-light text-[14px] leading-snug md:text-[16px]">
                  {step.body}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
