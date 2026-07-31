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
