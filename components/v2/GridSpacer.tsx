import { CellGrid } from "@/components/v2/CellGrid";

/**
 * Breathing room between two sections, in whole rows of the 16 / 12 / 4
 * grid (one cell high each): the frame's spines and the rule along its top,
 * no cells. First used between the home's carousel and its three beats,
 * which read as one block without it (25 November 2026).
 */
export function GridSpacer({ rows = 1 }: { rows?: number }) {
  return (
    <section
      aria-hidden
      className="relative w-full bg-cream"
      style={{ height: `calc(var(--s-cell-h) * ${rows})` }}
    >
      <CellGrid
        lineClassName="bg-sky"
        bands={false}
        cells={false}
        readout={false}
        subdivide={2}
      />
    </section>
  );
}
