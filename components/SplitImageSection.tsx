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
  className,
}: SplitImageSectionProps) {
  // The image is positioned over the cells rather than placed as a grid item:
  // an explicitly-placed item would push the auto-flowed cells out of the way
  // and break the grid it is supposed to sit on.
  const frame = {
    left: `${((colStart - 1) / SPLIT_COLUMNS) * 100}%`,
    width: `${(colSpan / SPLIT_COLUMNS) * 100}%`,
    top: `${((rowStart - 1) / SPLIT_ROWS) * 100}%`,
    height: `${(rowSpan / SPLIT_ROWS) * 100}%`,
  };

  return (
    <section className={cn("relative w-full bg-cream", className)}>
      <GridLines lineClassName="bg-sky" />

      <div
        className="relative grid"
        style={{ gridTemplateColumns: MARGIN_COLUMNS }}
      >
        <div className="relative col-start-2">
          <div className="grid grid-cols-6 border-t border-r border-sky">
            {Array.from({ length: SPLIT_COLUMNS * SPLIT_ROWS }).map(
              (_, index) => (
                <div
                  key={index}
                  className="aspect-square border-b border-l border-sky"
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
