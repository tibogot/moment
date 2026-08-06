/**
 * Month-grid maths, shared by the home page calendar and the compact picker in
 * the cart panel. Both lay out a Monday-first month over 7 columns padded to
 * whole weeks; only the cell chrome differs, so only the maths lives here.
 */

/**
 * Weekday and month names used to live here as English literals. They are now
 * generated per locale by `weekdayNames` and `formatMonth` in lib/i18n/format,
 * because the platform already knows how to say "woensdag" and a hand-written
 * list of three languages is three chances to misspell it.
 *
 * The Monday-first assumption below outlived them, and both sides depend on it.
 */

/** Monday-first offset for the 1st of the month. */
export function leadingBlanks(year: number, month: number) {
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

export function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Day numbers for the month, with `null` padding either side so the grid always
 * closes off on a whole week and the bottom border never stops mid-row.
 */
export function monthCells(year: number, month: number): (number | null)[] {
  const days: (number | null)[] = [
    ...Array.from({ length: leadingBlanks(year, month) }, () => null),
    ...Array.from({ length: daysInMonth(year, month) }, (_, index) => index + 1),
  ];

  while (days.length % 7 !== 0) days.push(null);
  return days;
}

