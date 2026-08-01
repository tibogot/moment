"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { setDeliveryDate } from "@/app/actions/cart";
import { GridLines } from "@/components/GridLines";
import TextReveal from "@/components/TextReveal";
import { notifyCartUpdated } from "@/lib/cart-store";
import {
  LEAD_TIME_DAYS,
  formatDeliveryDate,
  isBookable,
  parseISODate,
  toISODate,
  type DeliveryAvailability,
} from "@/lib/delivery";
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

/** Monday-first offset for the 1st of the month. */
function leadingBlanks(year: number, month: number) {
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

type Status =
  | { kind: "idle" }
  | { kind: "saved"; date: string }
  | { kind: "error"; message: string };

type CalendarSectionProps = {
  /**
   * Resolved on the server: today in Brussels, the lead time, and the days the
   * owners closed in the Shopify admin. The calendar never asks the visitor's
   * clock what day it is — a browser in another timezone would disagree with
   * the kitchen about which days are still bookable.
   */
  availability: DeliveryAvailability;
};

export function CalendarSection({ availability }: CalendarSectionProps) {
  const today = useMemo(
    () => parseISODate(availability.today) ?? new Date(),
    [availability.today],
  );

  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [isPending, startTransition] = useTransition();

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

  const isoFor = (day: number) => toISODate(new Date(year, month, day));

  const monthLabel = cursor.toLocaleDateString("en-GB", { month: "long" });
  const atFirstMonth =
    year === today.getFullYear() && month === today.getMonth();

  const shiftMonth = (delta: number) => setCursor(new Date(year, month + delta, 1));

  const chooseDay = (iso: string) => {
    setSelected(iso);
    setStatus({ kind: "idle" });
  };

  const confirmDate = () => {
    if (!selected) return;

    startTransition(async () => {
      const result = await setDeliveryDate(selected);

      if (!result.ok) {
        setStatus({ kind: "error", message: result.error });
        return;
      }

      // The action may have opened the cart that now holds this date, so the
      // navbar badge and panel need to re-read it.
      notifyCartUpdated();
      setStatus({ kind: "saved", date: result.date });
    });
  };

  return (
    <section className="relative w-full bg-cream pb-[14svh] text-black">
      {/* Full-bleed sky rule separating this block from Services above. */}
      <div className="h-px w-full bg-sky" aria-hidden />

      <GridLines lineClassName="bg-sky" />

      <div
        className="relative grid pt-[10svh]"
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

              const iso = isoFor(day);

              // Unavailable days are solid sky with no number at all.
              if (!isBookable(iso, availability)) {
                return (
                  <div
                    key={day}
                    className={cn(cellClassName, "bg-sky")}
                    aria-hidden
                  />
                );
              }

              const selectedDay = selected === iso;

              return (
                <button
                  key={day}
                  type="button"
                  aria-pressed={selectedDay}
                  aria-label={`${day} ${monthLabel} ${year}`}
                  onClick={() => chooseDay(iso)}
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
            {status.kind === "saved" ? (
              <>
                <p className="font-archivo-light text-[15px] leading-normal">
                  Delivery set for {formatDeliveryDate(status.date)}. It travels
                  with your order — you can keep shopping and change it here any
                  time before checkout.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={routes.shop}
                    className="font-owners-medium inline-block bg-black px-8 py-4 text-[12px] uppercase tracking-wide text-cream transition-opacity hover:opacity-80"
                  >
                    Choose your plates
                  </Link>
                  <Link
                    href={routes.cart}
                    className="font-owners-medium inline-block border border-black px-8 py-4 text-[12px] uppercase tracking-wide transition-opacity hover:opacity-60"
                  >
                    View cart
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="font-archivo-light text-[15px] leading-normal">
                  {selected
                    ? `Delivery on ${formatDeliveryDate(selected)}.`
                    : `Dated days are open for delivery. Blue days are already taken or closed — we need ${LEAD_TIME_DAYS} days' notice and we do not deliver on Sundays.`}
                </p>

                {status.kind === "error" && (
                  <p
                    role="alert"
                    className="font-archivo-light mt-3 text-[14px] leading-normal"
                  >
                    {status.message}
                  </p>
                )}

                {selected && (
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={confirmDate}
                      disabled={isPending}
                      className="font-owners-medium inline-block bg-black px-8 py-4 text-[12px] uppercase tracking-wide text-cream transition-opacity hover:opacity-80 disabled:opacity-40"
                    >
                      {isPending ? "Saving…" : "Request this date"}
                    </button>
                    <Link
                      href={routes.contact}
                      className="font-owners-medium inline-block border border-black px-8 py-4 text-[12px] uppercase tracking-wide transition-opacity hover:opacity-60"
                    >
                      Ask about this date
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
