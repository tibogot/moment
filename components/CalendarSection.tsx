"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { GridLines } from "@/components/GridLines";
import TextReveal from "@/components/TextReveal";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/** Matches --color-sky; TextReveal paints the block with an inline style. */
const SKY = "#a7c5ee";

// The calendar sits in the page's 7 columns — a Monday-to-Sunday week is why
// the grid is 7 wide. The outer template only carries the margins; the inner
// grid-cols-7 fills the space between them, so the cell borders land exactly
// on the page's column lines.
const MARGIN_COLUMNS =
  "var(--grid-margin) minmax(0, 1fr) var(--grid-margin)";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/** Deliveries need notice, so the first bookable day is this far out. */
const LEAD_TIME_DAYS = 2;

/** Sunday is closed. */
const CLOSED_WEEKDAYS = new Set([0]);

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Monday-first offset for the 1st of the month. */
function leadingBlanks(year: number, month: number) {
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function toKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

type CalendarSectionProps = {
  /** ISO dates (YYYY-MM-DD) already taken — rendered blue, with no number. */
  bookedDates?: string[];
  /** Overrides "today" in previews. */
  today?: Date;
};

export function CalendarSection({
  bookedDates = [],
  today,
}: CalendarSectionProps) {
  const now = useMemo(() => startOfDay(today ?? new Date()), [today]);
  const firstBookable = useMemo(() => addDays(now, LEAD_TIME_DAYS), [now]);
  const booked = useMemo(() => {
    return new Set(
      bookedDates.map((iso) => {
        const [year, month, day] = iso.split("-").map(Number);
        return toKey(new Date(year, month - 1, day));
      }),
    );
  }, [bookedDates]);

  const [cursor, setCursor] = useState(
    () => new Date(now.getFullYear(), now.getMonth(), 1),
  );
  const [selected, setSelected] = useState<Date | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  // Pad to whole weeks so the grid always closes off cleanly.
  const cells = useMemo(() => {
    const blanks = leadingBlanks(year, month);
    const total = daysInMonth(year, month);
    const days: (number | null)[] = [
      ...Array.from({ length: blanks }, () => null),
      ...Array.from({ length: total }, (_, index) => index + 1),
    ];

    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [year, month]);

  const isAvailable = (day: number) => {
    const date = new Date(year, month, day);
    if (CLOSED_WEEKDAYS.has(date.getDay())) return false;
    if (booked.has(toKey(date))) return false;
    return date.getTime() >= firstBookable.getTime();
  };

  const isSelected = (day: number) =>
    selected !== null &&
    selected.getFullYear() === year &&
    selected.getMonth() === month &&
    selected.getDate() === day;

  const monthLabel = cursor.toLocaleDateString("en-GB", { month: "long" });
  const atFirstMonth = year === now.getFullYear() && month === now.getMonth();

  const shiftMonth = (delta: number) => setCursor(new Date(year, month + delta, 1));

  return (
    <section className="relative w-full bg-cream pt-[10svh] pb-[14svh] text-black">
      <GridLines lineClassName="bg-sky" />

      <div
        className="relative grid"
        style={{ gridTemplateColumns: MARGIN_COLUMNS }}
      >
        <div className="col-start-2">
          <div className="flex flex-wrap items-end justify-between gap-4 px-(--grid-gutter) pb-[4svh]">
            {/* text-left: TextReveal centres each split line unless an ancestor opts out.
                key remounts the reveal when Prev/Next changes the month. */}
            <div className="min-w-0 flex-1 text-left">
              <TextReveal key={monthLabel} blockColor={SKY} stagger={0.12}>
                <h2 className="font-owners-narrow-bold text-[16vw] leading-[0.85] wrap-break-word uppercase md:text-[min(9vw,14svh)]">
                  {monthLabel}
                </h2>
              </TextReveal>
            </div>

            <div className="flex items-center gap-4 pb-2">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                disabled={atFirstMonth}
                className="font-owners-medium text-[12px] uppercase tracking-wide transition-opacity hover:opacity-60 disabled:opacity-30"
              >
                Prev
              </button>
              <span className="font-archivo-light text-[13px]">{year}</span>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                className="font-owners-medium text-[12px] uppercase tracking-wide transition-opacity hover:opacity-60"
              >
                Next
              </button>
            </div>
          </div>

          {/* Day names sit above the rules, as in the reference. */}
          <div className="grid grid-cols-7">
            {WEEKDAYS.map((weekday) => (
              <div
                key={weekday}
                className="font-owners-medium pb-2 text-center text-[9px] uppercase tracking-wide md:text-[11px]"
              >
                <span className="md:hidden">{weekday.slice(0, 1)}</span>
                <span className="hidden md:inline">{weekday}</span>
              </div>
            ))}
          </div>

          {/* border-t + border-r here close the grid; every cell carries
              border-l and border-b, so the lines never double up. */}
          <div className="grid grid-cols-7 border-t border-r border-sky">
            {cells.map((day, index) => {
              const cellClassName =
                "h-14 border-b border-l border-sky p-1.5 md:h-[13svh] md:p-2.5";

              if (day === null) {
                return (
                  <div key={`blank-${index}`} className={cellClassName} />
                );
              }

              const available = isAvailable(day);
              const selectedDay = isSelected(day);

              // Unavailable days are solid sky with no number at all.
              if (!available) {
                return (
                  <div
                    key={day}
                    className={cn(cellClassName, "bg-sky")}
                    aria-hidden
                  />
                );
              }

              return (
                <button
                  key={day}
                  type="button"
                  aria-pressed={selectedDay}
                  aria-label={`${day} ${monthLabel} ${year}`}
                  onClick={() => setSelected(new Date(year, month, day))}
                  className={cn(
                    cellClassName,
                    // Buttons centre their content by default; pin the number
                    // to the top-right corner of the cell instead.
                    "flex items-start justify-end transition-colors hover:bg-sky/30",
                    selectedDay && "bg-black text-cream hover:bg-black",
                  )}
                >
                  <span className="font-owners-medium text-[10px] md:text-[12px]">
                    {String(day).padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="px-(--grid-gutter) pt-[4svh]">
            <p className="font-archivo-light text-[15px] leading-normal">
              {selected
                ? `Delivery on ${selected.toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}.`
                : `Dated days are open for delivery. Blue days are already taken or closed — we need ${LEAD_TIME_DAYS} days' notice and we do not deliver on Sundays.`}
            </p>

            {selected && (
              <Link
                href={routes.contact}
                className="font-owners-medium mt-6 inline-block bg-black px-8 py-4 text-[12px] uppercase tracking-wide text-cream transition-opacity hover:opacity-80"
              >
                Request this date
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
