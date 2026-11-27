import type { StaticImageData } from "next/image";
import { CdnImage as Image } from "@/components/CdnImage";
import TextReveal from "@/components/TextReveal";
import { CellGrid } from "@/components/v2/CellGrid";
import { RowSnap } from "@/components/v2/RowSnap";
import { REVEAL_BLOCK, REVEAL_BLOCK_ON_SKY } from "@/lib/colors";
import { cn } from "@/lib/utils";

type StoryCellsProps = {
  label: string;
  title: string;
  body: string;
  /** A URL from the Studio, or a bundled photograph. */
  src: string | StaticImageData;
  /** The Studio's description of the photo; empty = decorative. */
  alt?: string;
  /** Which half the photograph takes from tablet up. */
  imageSide?: "left" | "right";
  /** The middle one of the three is on sky, as on the live home. */
  theme?: "cream" | "sky";
};

/**
 * The live home's three beats — la cuisine, la livraison, la table
 * (StickyTitleSection) — on the 16 / 12 / 4 grid (25 November 2026). Same
 * idea: half text, half photograph, the photograph changing side each time,
 * the middle one on sky.
 *
 * Eight rows of cells, everywhere.
 *   desktop  photograph 8 × 8 cells (a 3/4 portrait), edge to edge, rules
 *            over it; the text's half one block of 8 × 8 cells, the text
 *            held at its top (sticky, under the navbar) while the
 *            photograph scrolls past, as on the live home
 *   tablet   the same on 6 cells a half
 *   phone    the text on rows 1–4, the photograph under it, 4 × 4 cells
 *
 * The text half has no rule inside it: a held title moving over cells would
 * cross their lines.
 */
/** The faint cells under the held text: 45% of the rules' colour. */
const FAINT = {
  cream: "rgb(167 197 238 / 0.45)",
  sky: "rgb(248 247 242 / 0.45)",
} as const;

export function StoryCells({
  label,
  title,
  body,
  src,
  alt = "",
  imageSide = "right",
  theme = "cream",
}: StoryCellsProps) {
  const sky = theme === "sky";
  const imageLeft = imageSide === "left";

  return (
    <section
      className={cn("relative w-full text-black", sky ? "bg-sky" : "bg-cream")}
    >
      <CellGrid
        lineClassName={sky ? "bg-cream" : "bg-sky"}
        bands={false}
        readout={false}
        subdivide={2}
        linesOnTop
      />
      <div
        className="relative grid"
        style={{
          gridTemplateColumns: "var(--s-grid-columns)",
          gridTemplateRows: "repeat(8, var(--s-cell-h))",
        }}
      >
        {/* The text's half: one block of all 8 rows from tablet up (rows
            1–4 on a phone), the grid's own rules taken out of it. Its cells
            are drawn again, faint, as its background; the text is held on
            top of them in an opaque panel that slides down through them as
            the photograph scrolls past — the live home's effect, on the
            grid's cells. */}
        <div
          data-grid-hole
          className={cn(
            "relative col-[2/span_4] row-[1/span_4] min-w-0 text-left md:row-[1/span_8]",
            imageLeft
              ? "md:col-[8/span_6] lg:col-[10/span_8]"
              : "md:col-[2/span_6] lg:col-[2/span_8]",
          )}
        >
          {/* The faint cells: a rule every cell across and every row down,
              centred on the lines like the grid's own. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden md:block"
            style={{
              backgroundImage: `linear-gradient(to right, ${FAINT[theme]} var(--grid-line), transparent var(--grid-line)), linear-gradient(to bottom, ${FAINT[theme]} var(--grid-line), transparent var(--grid-line))`,
              backgroundSize: "var(--s-cell-w) 100%, 100% var(--s-cell-h)",
              backgroundPosition:
                "calc(var(--grid-line) / -2) 0, 0 calc(var(--grid-line) / -2)",
            }}
          />
          {/* The held panel: opaque, closed by a full rule along its foot,
              so it reads as a panel moving through the cells. Whole rows
              high (RowSnap), so at rest its rules fall on row lines: the
              label at the foot of the first row, its rule that row's line,
              the panel's foot rule another. */}
          <RowSnap
            className={cn(
              "relative md:sticky md:top-[calc(var(--grid-band)_+_var(--announcement-h,0px))] md:border-b",
              sky ? "bg-sky md:border-cream" : "bg-cream md:border-sky",
            )}
          >
            <div
              className={cn(
                "flex h-(--s-cell-h) items-end border-b px-(--v2-pad) pb-(--v2-pad)",
                sky ? "border-cream" : "border-sky",
              )}
            >
              <span className="font-owners-medium flex items-center gap-2 text-[12px] tracking-wide uppercase">
                {/* A small 3/4 rectangle before the label — the grid's cell
                    as a bullet (25 November 2026, to try) — in the rules'
                    colour: sky on cream, cream on sky. */}
                <span
                  aria-hidden
                  className={cn(
                    "inline-block h-[0.8em] w-[0.6em] shrink-0",
                    sky ? "bg-cream" : "bg-sky",
                  )}
                />
                {label}
              </span>
            </div>
            <div className="flex flex-col gap-[3svh] p-(--v2-pad)">
              <TextReveal
                blockColor={sky ? REVEAL_BLOCK_ON_SKY : REVEAL_BLOCK}
                stagger={0.12}
              >
                <h2 className="font-owners-narrow-bold text-[8vw] leading-[0.95] tracking-[-0.005em] text-balance wrap-break-word uppercase md:text-[min(3.2vw,5svh)]">
                  {title}
                </h2>
              </TextReveal>
              <TextReveal
                blockColor={sky ? REVEAL_BLOCK_ON_SKY : REVEAL_BLOCK}
                stagger={0.08}
                duration={0.6}
              >
                <p className="font-archivo-light max-w-[52ch] text-(length:--body-text) leading-normal text-pretty">
                  {body}
                </p>
              </TextReveal>
            </div>
          </RowSnap>
        </div>

        {/* The photograph: 8 × 8 cells (6 × 8 on a tablet, 4 × 4 on a
            phone), edge to edge. */}
        <div
          data-grid-hole
          className={cn(
            "relative col-[2/span_4] row-[5/span_4] overflow-hidden md:row-[1/span_8]",
            imageLeft
              ? "md:col-[2/span_6] lg:col-[2/span_8]"
              : "md:col-[8/span_6] lg:col-[10/span_8]",
          )}
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 48rem) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
