import type { CSSProperties } from "react";
import { GridLines } from "@/components/GridLines";
import { ParallaxImage } from "@/components/ParallaxImage";
import { cn } from "@/lib/utils";

// This section runs on 6 columns rather than the page's 7, so a half is
// exactly 3 columns. Three rows makes each half a 9-rectangle block.
const SPLIT_COLUMNS = 6;
const SPLIT_ROWS = 3;

const MARGIN_COLUMNS = "var(--grid-margin) minmax(0, 1fr) var(--grid-margin)";

type GridPlacement = {
  colStart: number;
  colSpan: number;
  rowStart?: number;
  rowSpan?: number;
};

type SplitImageSectionProps = {
  src: string;
  alt: string;
  /** 1-based placement within the 6 x 3 grid. */
  colStart: number;
  colSpan: number;
  rowStart?: number;
  rowSpan?: number;
  /** Taller grid + alternate placement below the md breakpoint. */
  mobile?: GridPlacement & { rows?: number };
  priority?: boolean;
  /**
   * Drop the top rule when this block continues a previous SplitImageSection.
   * Otherwise the previous block's bottom borders and this top border stack
   * into a double-weight line.
   */
  continueGrid?: boolean;
  /**
   * Replace the last row's cell border-b with a viewport-wide sky rule —
   * same full-bleed separators used above the calendar / intro.
   */
  fullBleedBottom?: boolean;
  className?: string;
};

function computeFrame(
  placement: GridPlacement,
  columns: number,
  rows: number,
): CSSProperties {
  const rowStart = placement.rowStart ?? 1;
  const rowSpan = placement.rowSpan ?? rows;
  const colEnd = placement.colStart + placement.colSpan - 1;
  const rowEnd = rowStart + rowSpan - 1;

  // The image is positioned over the cells rather than placed as a grid item:
  // an explicitly-placed item would push the auto-flowed cells out of the way
  // and break the grid it is supposed to sit on.
  // When the frame meets the right (or bottom) edge, pin with `right`/`bottom`
  // so percentage rounding can't leave a hairline gap beside the spine.
  return {
    left: `${((placement.colStart - 1) / columns) * 100}%`,
    right:
      colEnd === columns
        ? "0"
        : `${((columns - colEnd) / columns) * 100}%`,
    top: `${((rowStart - 1) / rows) * 100}%`,
    bottom:
      rowEnd === rows ? "0" : `${((rows - rowEnd) / rows) * 100}%`,
  };
}

function SplitGrid({
  rows,
  continueGrid,
  fullBleedBottom,
}: {
  rows: number;
  continueGrid: boolean;
  fullBleedBottom: boolean;
}) {
  return (
    <div
      className={cn("grid grid-cols-6 border-sky", !continueGrid && "border-t")}
    >
      {Array.from({ length: SPLIT_COLUMNS * rows }).map((_, index) => {
        const isLastRow = Math.floor(index / SPLIT_COLUMNS) === rows - 1;

        return (
          <div
            key={index}
            className={cn(
              // Portrait, matching the panels on the home page rather than the
              // square this used to be. The cells here are the only ones on the
              // site whose proportion was declared outright, so they were also
              // the only ones that stayed square at every width.
              "aspect-3/4 border-sky",
              !(fullBleedBottom && isLastRow) && "border-b",
              index % SPLIT_COLUMNS !== 0 && "border-l",
            )}
          />
        );
      })}
    </div>
  );
}

function SplitImageBlock({
  src,
  alt,
  placement,
  rows,
  columns,
  continueGrid,
  fullBleedBottom,
  priority,
}: {
  src: string;
  alt: string;
  placement: GridPlacement;
  rows: number;
  columns: number;
  continueGrid: boolean;
  fullBleedBottom: boolean;
  priority: boolean;
}) {
  return (
    <>
      <SplitGrid
        rows={rows}
        continueGrid={continueGrid}
        fullBleedBottom={fullBleedBottom}
      />
      <ParallaxImage
        src={src}
        alt={alt}
        priority={priority}
        sizes={`${Math.round((placement.colSpan / columns) * 100)}vw`}
        className="absolute"
        style={computeFrame(placement, columns, rows)}
      />
    </>
  );
}

export function SplitImageSection({
  src,
  alt,
  colStart,
  colSpan,
  rowStart = 1,
  rowSpan = SPLIT_ROWS,
  mobile,
  priority = false,
  continueGrid = false,
  fullBleedBottom = false,
  className,
}: SplitImageSectionProps) {
  const desktopPlacement = { colStart, colSpan, rowStart, rowSpan };
  const mobileRows = mobile?.rows ?? SPLIT_ROWS;
  const mobilePlacement = mobile
    ? {
        colStart: mobile.colStart,
        colSpan: mobile.colSpan,
        rowStart: mobile.rowStart,
        rowSpan: mobile.rowSpan,
      }
    : desktopPlacement;

  return (
    <section className={cn("relative w-full bg-cream", className)}>
      <GridLines lineClassName="bg-sky" />

      <div
        className="relative grid"
        style={{ gridTemplateColumns: MARGIN_COLUMNS }}
      >
        <div className="relative col-start-2">
          {mobile ? (
            <>
              <div className="md:hidden">
                <SplitImageBlock
                  src={src}
                  alt={alt}
                  placement={mobilePlacement}
                  rows={mobileRows}
                  columns={SPLIT_COLUMNS}
                  continueGrid={continueGrid}
                  fullBleedBottom={fullBleedBottom}
                  priority={priority}
                />
              </div>
              <div className="hidden md:block">
                <SplitImageBlock
                  src={src}
                  alt={alt}
                  placement={desktopPlacement}
                  rows={SPLIT_ROWS}
                  columns={SPLIT_COLUMNS}
                  continueGrid={continueGrid}
                  fullBleedBottom={fullBleedBottom}
                  priority={priority}
                />
              </div>
            </>
          ) : (
            <SplitImageBlock
              src={src}
              alt={alt}
              placement={desktopPlacement}
              rows={SPLIT_ROWS}
              columns={SPLIT_COLUMNS}
              continueGrid={continueGrid}
              fullBleedBottom={fullBleedBottom}
              priority={priority}
            />
          )}
        </div>
      </div>

      {fullBleedBottom && <div className="h-px w-full bg-sky" aria-hidden />}
    </section>
  );
}
