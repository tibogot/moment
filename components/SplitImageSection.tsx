import Image from "next/image";
import { GridLines } from "@/components/GridLines";
import { cn } from "@/lib/utils";

// This section runs on 6 columns rather than the page's 7, so a half is
// exactly 3 columns. Three rows makes each half a 9-rectangle block.
const SPLIT_COLUMNS = 6;
const SPLIT_ROWS = 3;

const MARGIN_COLUMNS = "var(--grid-margin) minmax(0, 1fr) var(--grid-margin)";

type SplitImageSectionProps = {
  src: string;
  alt: string;
  /** 1-based placement within the 6 x 3 grid. */
  colStart: number;
  colSpan: number;
  rowStart?: number;
  rowSpan?: number;
  priority?: boolean;
  /**
   * Drop the top rule when this block continues a previous SplitImageSection.
   * Otherwise the previous block's bottom borders and this top border stack
   * into a double-weight line.
   */
  continueGrid?: boolean;
  className?: string;
};

export function SplitImageSection({
  src,
  alt,
  colStart,
  colSpan,
  rowStart = 1,
  rowSpan = SPLIT_ROWS,
  priority = false,
  continueGrid = false,
  className,
}: SplitImageSectionProps) {
  // The image is positioned over the cells rather than placed as a grid item:
  // an explicitly-placed item would push the auto-flowed cells out of the way
  // and break the grid it is supposed to sit on.
  // When the frame meets the right (or bottom) edge, pin with `right`/`bottom`
  // so percentage rounding can't leave a hairline gap beside the spine.
  const colEnd = colStart + colSpan - 1;
  const rowEnd = rowStart + rowSpan - 1;
  const frame = {
    left: `${((colStart - 1) / SPLIT_COLUMNS) * 100}%`,
    right:
      colEnd === SPLIT_COLUMNS
        ? "0"
        : `${((SPLIT_COLUMNS - colEnd) / SPLIT_COLUMNS) * 100}%`,
    top: `${((rowStart - 1) / SPLIT_ROWS) * 100}%`,
    bottom:
      rowEnd === SPLIT_ROWS
        ? "0"
        : `${((SPLIT_ROWS - rowEnd) / SPLIT_ROWS) * 100}%`,
  };

  return (
    <section className={cn("relative w-full bg-cream", className)}>
      <GridLines lineClassName="bg-sky" />

      <div
        className="relative grid"
        style={{ gridTemplateColumns: MARGIN_COLUMNS }}
      >
        <div className="relative col-start-2">
          <div
            className={cn(
              "grid grid-cols-6 border-sky",
              !continueGrid && "border-t",
            )}
          >
            {Array.from({ length: SPLIT_COLUMNS * SPLIT_ROWS }).map(
              (_, index) => (
                <div
                  key={index}
                  className={cn(
                    "aspect-square border-b border-sky",
                    index % SPLIT_COLUMNS !== 0 && "border-l",
                  )}
                />
              ),
            )}
          </div>

          <div className="absolute overflow-hidden" style={frame}>
            <Image
              src={src}
              alt={alt}
              fill
              priority={priority}
              sizes={`${Math.round((colSpan / SPLIT_COLUMNS) * 100)}vw`}
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
