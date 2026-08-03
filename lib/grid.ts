/**
 * The layout grid is a margin box: an outer margin on all four sides, then
 * COLUMNS x ROWS ruled cells inside it. The top and bottom margin bands hold
 * the navbar / breathing room and sit outside the ruled area.
 *
 * The matching CSS track templates live in globals.css as --grid-columns and
 * --grid-rows, so placement can use plain Tailwind col-/row- utilities.
 */
export const GRID_COLUMNS = 7;
export const GRID_COLUMNS_MOBILE = 3;
export const GRID_ROWS = 3;

/**
 * A block of cells where the interior rules are suppressed, so lines don't run
 * through type. Coordinates are 1-based and inclusive.
 */
export type GridHole = {
  col: [number, number];
  row: [number, number];
};

/** Cells the hero type sits in, so the rules can be dropped there. */
export const HERO_GRID_HOLES: GridHole[] = [
  { col: [1, 5], row: [2, 3] }, // headline
  { col: [5, 7], row: [3, 3] }, // paragraph (+ col 5 drops the left rule)
];

export const HERO_GRID_HOLES_MOBILE: GridHole[] = [
  { col: [1, 3], row: [3, 3] }, // headline
  { col: [1, 3], row: [2, 2] }, // paragraph (+ col 1 drops the left rule)
];

/**
 * `sizes` hints for next/image, mirroring --grid-margin and --grid-gutter in
 * globals.css. Keeps srcset selection honest and silences Next.js dev warnings
 * when a fill image is narrower than the viewport.
 */
export const GRID_VIEWPORT_IMAGE_SIZES = "100vw";

/** Content column on mobile (margin box minus gutter padding on both sides). */
export const GRID_CONTENT_IMAGE_SIZES =
  "(max-width: 48rem) calc(100vw - 2 * max(1.25rem, 4.9vw) - 2 * max(0.75rem, 3.5vw)), 1px";
