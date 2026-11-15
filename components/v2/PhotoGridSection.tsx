import Image from "next/image";
import type { ReactNode } from "react";
import { CellGrid } from "@/components/v2/CellGrid";
import { cn } from "@/lib/utils";

export type GridPhoto = {
  src: string;
  alt: string;
  /**
   * Where it sits, as Tailwind grid placements on the section's grid — cell
   * n is grid column n + 1. Give it as many rows as columns and the photo is
   * a 3/4 rectangle, the cell's own shape.
   */
  className: string;
};

type PhotoGridSectionProps = {
  photos: GridPhoto[];
  /** Rows per breakpoint, as `[--rows:n]` classes. */
  rowsClassName: string;
  /**
   * Content above the cells, in the same section — a page's title and lead.
   * The section then has one band at the top and one at the bottom, and a
   * single rule between the header and the cells instead of two bands.
   */
  header?: ReactNode;
};

/**
 * Photographs placed in the v2 cells, the cells drawn all round them — the
 * v2 counterpart of `SplitImageSection`.
 *
 * Each photo fills its block of cells edge to edge and is a
 * `data-grid-hole`, so no rule crosses it; the rules around it frame it.
 */
export function PhotoGridSection({
  photos,
  rowsClassName,
  header,
}: PhotoGridSectionProps) {
  const grid = (
    <div
      className={cn("relative grid", rowsClassName)}
      style={{
        gridTemplateColumns: "var(--v2-columns)",
        gridTemplateRows: "repeat(var(--rows), var(--v2-row))",
        // Without a header the cells sit between the section's own bands.
        paddingBlock: header ? undefined : "var(--grid-band)",
      }}
    >
      {photos.map((photo) => (
        <div
          key={photo.src}
          data-grid-hole
          // Sky behind the photo while it loads — see dev-notes, loading
          // states.
          className={cn("relative overflow-hidden bg-sky/20", photo.className)}
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(max-width: 48rem) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );

  if (!header) {
    return (
      <section className="relative w-full bg-cream">
        <CellGrid lineClassName="bg-sky" readout={false} />
        {grid}
      </section>
    );
  }

  // With a header: the section's frame and bands round the whole thing,
  // cells only under the header. The inner CellGrid (no bands) draws the
  // single rule between the two along its top edge.
  return (
    // The bottom band is the section's own padding, not a margin on the
    // cells: a child's bottom margin collapses through the section and the
    // band would end up outside it, the rules cut short above the footer.
    <section
      className="relative w-full bg-cream"
      style={{ paddingBlock: "var(--grid-band)" }}
    >
      <CellGrid lineClassName="bg-sky" readout={false} cells={false} />
      <div className="relative">{header}</div>
      <div className="relative">
        <CellGrid lineClassName="bg-sky" readout={false} bands={false} />
        {grid}
      </div>
    </section>
  );
}
