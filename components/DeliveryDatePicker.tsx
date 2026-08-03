"use client";

import { useMemo, useState } from "react";
import { monthCells, monthName, WEEKDAYS } from "@/lib/calendar";
import {
  dayState,
  parseISODate,
  toISODate,
  type DeliveryAvailability,
} from "@/lib/delivery";
import { cn } from "@/lib/utils";

type DeliveryDatePickerProps = {
  availability: DeliveryAvailability;
  /** The date already on the cart, if any. */
  value: string | null;
  onSelect: (iso: string) => void;
  disabled?: boolean;
};

/**
 * The dense month grid used inside the cart panel. The home page has its own
 * full-bleed calendar sized to the page columns — this one has to survive a
 * 440px drawer, so the cells are square and the weekday names are initials.
 * Both read the same `dayState`, so a day that is blue here is blue there.
 */
export function DeliveryDatePicker({
  availability,
  value,
  onSelect,
  disabled = false,
}: DeliveryDatePickerProps) {
  const today = useMemo(
    () => parseISODate(availability.today) ?? new Date(),
    [availability.today],
  );

  // Open on the month of the date already chosen, so "Change" lands where the
  // customer left off rather than back at today.
  const [cursor, setCursor] = useState(() => {
    const selected = value ? parseISODate(value) : null;
    const anchor = selected ?? today;
    return new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const cells = useMemo(() => monthCells(year, month), [year, month]);
  const label = monthName(cursor);
  const atFirstMonth =
    year === today.getFullYear() && month === today.getMonth();

  const shiftMonth = (delta: number) =>
    setCursor(new Date(year, month + delta, 1));

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          disabled={atFirstMonth}
          className="font-owners-medium text-[11px] uppercase tracking-wide transition-opacity hover:opacity-60 disabled:opacity-30"
        >
          Prev
        </button>
        <span className="font-owners-medium text-[12px] uppercase tracking-wide">
          {label} <span className="font-archivo-light">{year}</span>
        </span>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="font-owners-medium text-[11px] uppercase tracking-wide transition-opacity hover:opacity-60"
        >
          Next
        </button>
      </div>

      <div className="px-6 pb-6">
        <div className="grid grid-cols-7">
          {WEEKDAYS.map((weekday) => (
            <div
              key={weekday}
              className="font-owners-medium pb-2 text-center text-[10px] uppercase tracking-wide opacity-60"
            >
              {weekday.slice(0, 1)}
            </div>
          ))}
        </div>

        {/* Same border trick as the home page grid: the wrapper closes the top
            and right, every cell carries left and bottom. */}
        <div className="grid grid-cols-7 border-t border-r border-sky">
          {cells.map((day, index) => {
            const cellClassName =
              "aspect-square border-b border-l border-sky flex items-center justify-center";

            if (day === null) {
              return <div key={`blank-${index}`} className={cellClassName} />;
            }

            const iso = toISODate(new Date(year, month, day));
            const state = dayState(iso, availability);
            const number = String(day).padStart(2, "0");

            if (state === "closed") {
              return (
                <div
                  key={day}
                  className={cn(cellClassName, "bg-sky")}
                  title="Not available for delivery"
                  aria-hidden
                />
              );
            }

            // Past days keep their number, dimmed. They are simply gone, and
            // blanking them made the start of the month look fully booked.
            if (state === "past") {
              return (
                <div
                  key={day}
                  className={cn(cellClassName, "bg-sky/25")}
                  aria-hidden
                >
                  <span className="font-owners-medium text-[12px]">
                    {number}
                  </span>
                </div>
              );
            }

            const isSelected = value === iso;

            return (
              <button
                key={day}
                type="button"
                disabled={disabled}
                aria-pressed={isSelected}
                aria-label={`${day} ${label} ${year}`}
                onClick={() => onSelect(iso)}
                className={cn(
                  cellClassName,
                  "transition-colors hover:bg-sky/30 disabled:opacity-40",
                  isSelected && "bg-black text-cream hover:bg-black",
                )}
              >
                <span className="font-owners-medium text-[12px]">{number}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
