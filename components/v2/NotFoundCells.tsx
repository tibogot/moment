import type { CSSProperties } from "react";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { CellGrid } from "@/components/v2/CellGrid";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type NotFoundCellsProps = {
  copy: Dictionary["common"]["notFound"];
  /**
   * false: "404" in one block of 4 × 2 cells. true: each digit in a block of
   * its own, 2 × 2 cells — a 3/4 rectangle, the rules running between the
   * digits (tablet and desktop; a phone, 4 cells wide, cannot centre three
   * 2-cell digits, so it keeps the one block).
   */
  split?: boolean;
  /** h1 on a page; h2 when two versions share the test page. */
  as?: "h1" | "h2";
};

/**
 * One screen: the viewport minus the announcement bar above the navbar,
 * which the layout pushes the page down by (--announcement-h, 0px when it
 * is off). Plain 100svh made these sections a bar's height taller than what
 * is visible, the bottom band off the screen.
 */
const SCREEN = "calc(100svh - var(--announcement-h, 0px))";
const CELL_W = "var(--s-cell-w)";
const CELL_H = "var(--s-cell-h)";

/**
 * The 404 on the 16 / 12 / 4 grid of /v2/systeme (25 November 2026), built
 * from the centred hero there: exactly one screen (SCREEN), the number's
 * rows and the text's under them centred on it as one group, the grid built from them — exact 3/4 cells up to the
 * navbar's band and down to a band of the same height at the bottom, so the
 * rows the two bands cut are cut alike and the screen stays symmetric.
 * Under the number, what happened and the way back, centred on 8 cells (4 on a phone).
 */
export function NotFoundCells({
  copy,
  split = false,
  as: Heading = "h1",
}: NotFoundCellsProps) {
  const style = {
    // The number (2 rows) and the text (2 rows) as one group, centred on
    // the screen: a number centred alone left no room for the text under it
    // inside one screen.
    "--number-top": `calc(${SCREEN} / 2 - 2 * ${CELL_H})`,
    height: SCREEN,
  } as CSSProperties;

  /** A block `span` cells wide, centred across the grid, `cells` from it. */
  const centred = (span: number | string, from = 0): CSSProperties => ({
    left: `calc(var(--grid-margin) + (var(--s-cols) / 2 - ${span} / 2 + ${from}) * ${CELL_W})`,
    width: `calc(${span} * ${CELL_W})`,
  });

  const digit =
    "font-owners-narrow-bold text-[length:calc(var(--s-cell-h)*1.6)] leading-none tracking-[-0.01em]";

  return (
    <section
      className="relative w-full overflow-hidden bg-cream text-black"
      style={style}
    >
      <CellGrid lineClassName="bg-sky" subdivide={2} readout={false} />

      {/* The anchor the rows are built from: the top of the number's rows.
          Its own element, never hidden, so the split version measures it too. */}
      <span
        aria-hidden
        data-grid-anchor
        className="absolute"
        style={{ top: "var(--number-top)" }}
      />

      <Heading>
        <span className="sr-only">{copy.title}</span>
        {/* One block of 4 × 2 cells: always on a phone, everywhere when not
            split. */}
        <span
          aria-hidden
          data-grid-hole
          className={cn(
            "absolute flex items-center justify-center",
            split && "md:hidden",
          )}
          style={{
            ...centred(4),
            top: "var(--number-top)",
            height: `calc(2 * ${CELL_H})`,
          }}
        >
          <span className={digit}>404</span>
        </span>
        {/* Split: each digit its own 2 × 2 block, tablet and desktop. */}
        {split &&
          ["4", "0", "4"].map((character, index) => (
            <span
              key={index}
              aria-hidden
              data-grid-hole
              className="absolute hidden items-center justify-center md:flex"
              style={{
                ...centred(6, index * 2),
                width: `calc(2 * ${CELL_W})`,
                top: "var(--number-top)",
                height: `calc(2 * ${CELL_H})`,
              }}
            >
              <span className={digit}>{character}</span>
            </span>
          ))}
      </Heading>

      {/* What happened and the way back: the 2 rows right under the number,
          centred on 8 cells (4 on a phone). */}
      <div
        data-grid-hole
        className="absolute flex flex-col items-center justify-center gap-3 p-(--v2-pad) text-center [--span:4] md:[--span:8]"
        style={{
          ...centred("var(--span)"),
          top: `calc(var(--number-top) + 2 * ${CELL_H})`,
          height: `calc(2 * ${CELL_H})`,
        }}
      >
        <p className="font-owners-medium text-[11px] tracking-wide uppercase md:text-[12px]">
          {copy.eyebrow}
        </p>
        <p className="font-archivo-light max-w-[40ch] text-(length:--body-text) leading-snug">
          {copy.lead}
        </p>
        <Link href={routes.home} className="group mt-1 inline-flex">
          {/* The site's own button: sky fill and rule, cream on hover. */}
          <span className="border border-sky bg-sky px-3 py-2.5 transition-colors duration-500 group-hover:bg-cream">
            <span className="font-owners-medium inline-flex items-center gap-2 text-[11px] tracking-wide uppercase">
              {copy.back}
              <span
                className="transition-transform duration-500 group-hover:translate-x-1.5"
                aria-hidden
              >
                &rarr;
              </span>
            </span>
          </span>
        </Link>
      </div>
    </section>
  );
}

/**
 * Where each "404" goes: its row and its first cell (1-based), on a phone
 * (4 cells), a tablet (12) and desktop (16). The digits take that cell and
 * the two to its right. A "404" in a row the screen has no room for is
 * hidden whole (the field clips at a row edge), never shown cut. None of
 * them meets the text block (rows 3–4 on a phone, 4–5 from tablet up, the
 * first cells).
 */
const SCATTER: {
  sm: [number, number];
  md: [number, number];
  lg: [number, number];
}[] = [
  { sm: [1, 1], md: [1, 2], lg: [1, 3] },
  { sm: [2, 2], md: [2, 8], lg: [2, 11] },
  { sm: [5, 1], md: [3, 4], lg: [3, 7] },
  { sm: [6, 2], md: [6, 9], lg: [5, 12] },
  { sm: [8, 1], md: [7, 3], lg: [6, 3] },
  { sm: [9, 2], md: [9, 7], lg: [6, 9] },
];

/**
 * The 404, third way (25 November 2026): no number in the middle, but
 * "404" as a pattern — one digit a cell, the three side by side, repeated
 * over the screen at places set per breakpoint (SCATTER), all in black.
 * (The repeats in the grid's colour were tried and dropped.) What happened
 * and the way back bottom-left, in a block of cells, as on the charter's
 * pages.
 *
 * Exactly one screen. Under the navbar's band, as many whole rows of exact
 * 3/4 cells as fit (keeping at least half a band below); the bottom band
 * takes the rest — the rule of /v2/systeme: bands absorb, cells never
 * stretch, no row is cut. (Rows cut by the band showed the tops of digits.)
 */
export function NotFoundScatter({
  copy,
  as: Heading = "h1",
  fullBleed = false,
}: Omit<NotFoundCellsProps, "split"> & {
  /**
   * The grid to the screen's edges (25 November 2026): no side margins, no
   * bands. The 16 / 12 / 4 cells divide the whole width; the rows, exact
   * 3/4, run from the navbar's rule — the row above it is cut by the top of
   * the screen, hidden under the navbar — and the last is cut by the bottom
   * of the screen, as if the grid ran on past it.
   */
  fullBleed?: boolean;
}) {
  const PLACED =
    "[grid-row:var(--r-sm)] [grid-column:var(--c-sm)] md:[grid-row:var(--r-md)] md:[grid-column:var(--c-md)] lg:[grid-row:var(--r-lg)] lg:[grid-column:var(--c-lg)]";

  return (
    <section
      className="relative w-full overflow-hidden bg-cream text-black"
      style={
        (fullBleed
          ? {
              // No margins: the cells divide the whole width. The grid
              // variables are redefined here, not inherited — they were
              // computed on .v2 with the margins in.
              "--grid-margin": "0px",
              "--s-cell-w": "calc(100cqw / var(--s-cols))",
              "--s-cell-h": "calc(var(--s-cell-w) * 4 / 3)",
              // Zero-width margin columns, so cell n is still column n + 1.
              "--s-grid-columns":
                "0px repeat(var(--s-cols), minmax(0, 1fr)) 0px",
              // The digits keep to the whole rows under the navbar.
              "--field": `round(down, calc(${SCREEN} - var(--grid-band)), var(--s-cell-h))`,
              height: SCREEN,
            }
          : {
              // Whole rows in the screen, at least half a band left at the
              // foot.
              "--field": `round(down, calc(${SCREEN} - 1.5 * var(--grid-band)), var(--s-cell-h))`,
              height: SCREEN,
              "--foot": `calc(${SCREEN} - var(--grid-band) - var(--field))`,
            }) as unknown as CSSProperties
      }
    >
      {fullBleed ? (
        <>
          <CellGrid
            lineClassName="bg-sky"
            subdivide={2}
            bands={false}
            readout={false}
          />
          {/* The rows are built from the navbar's rule. */}
          <span
            aria-hidden
            data-grid-anchor
            className="absolute"
            style={{ top: "var(--grid-band)" }}
          />
        </>
      ) : (
        <CellGrid
          lineClassName="bg-sky"
          subdivide={2}
          bottomBand="var(--foot)"
          readout={false}
        />
      )}

      {/* The field: whole rows only; a row past it is clipped whole. */}
      <div
        className="absolute inset-x-0 overflow-hidden"
        style={{ top: "var(--grid-band)", height: "var(--field)" }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: "var(--s-grid-columns)",
            gridAutoRows: "var(--s-cell-h)",
          }}
        >
          <Heading className="sr-only">{copy.title}</Heading>

          {SCATTER.flatMap((place, group) =>
            ["4", "0", "4"].map((character, index) => (
              <span
                key={`${group}-${index}`}
                aria-hidden
                className={cn(
                  "font-owners-narrow-bold flex items-center justify-center text-[length:calc(var(--s-cell-h)*0.8)] leading-none",
                  PLACED,
                )}
                style={
                  {
                    "--r-sm": place.sm[0],
                    "--c-sm": place.sm[1] + 1 + index,
                    "--r-md": place.md[0],
                    "--c-md": place.md[1] + 1 + index,
                    "--r-lg": place.lg[0],
                    "--c-lg": place.lg[1] + 1 + index,
                  } as CSSProperties
                }
              >
                {character}
              </span>
            )),
          )}

          {/* What happened and the way back: 2 rows, the first cells. */}
          <div
            data-grid-hole
            className="col-[2/span_4] row-[3/span_2] flex min-w-0 flex-col items-start justify-end gap-3 p-(--v2-pad) md:col-[2/span_6] md:row-[4/span_2]"
          >
            <p className="font-owners-medium text-[11px] tracking-wide uppercase md:text-[12px]">
              {copy.eyebrow}
            </p>
            <p className="font-archivo-light max-w-[36ch] text-(length:--body-text) leading-snug">
              {copy.lead}
            </p>
            <Link href={routes.home} className="group mt-1 inline-flex">
              <span className="border border-sky bg-sky px-3 py-2.5 transition-colors duration-500 group-hover:bg-cream">
                <span className="font-owners-medium inline-flex items-center gap-2 text-[11px] tracking-wide uppercase">
                  {copy.back}
                  <span
                    className="transition-transform duration-500 group-hover:translate-x-1.5"
                    aria-hidden
                  >
                    &rarr;
                  </span>
                </span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
