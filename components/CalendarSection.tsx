"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition } from "react";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { setDeliveryDate } from "@/app/actions/cart";
import { GridLines } from "@/components/GridLines";
import TextReveal from "@/components/TextReveal";
import { monthCells } from "@/lib/calendar";
import { notifyCartUpdated } from "@/lib/cart-store";
import { gsap } from "@/lib/gsapConfig";
import { blurFocusWithin } from "@/lib/overlayFocus";
import {
  LEAD_TIME_DAYS,
  dayState,
  formatDeliveryDate,
  parseISODate,
  toISODate,
  type DeliveryAvailability,
} from "@/lib/delivery";
import { routes } from "@/lib/routes";
import { useDictionary, useLocale } from "@/components/LocaleProvider";
import { interpolate } from "@/lib/i18n/dictionaries";
import { formatMonth, weekdayNames } from "@/lib/i18n/format";

import { cn } from "@/lib/utils";

import { REVEAL_BLOCK } from "@/lib/colors";

// The calendar sits in the page's 7 columns — a Monday-to-Sunday week is why
// the grid is 7 wide. The outer template only carries the margins; the inner
// grid-cols-7 fills the space between them, so the cell borders land exactly
// on the page's column lines.
const MARGIN_COLUMNS =
  "var(--grid-margin) minmax(0, 1fr) var(--grid-margin)";

const BAR_DURATION = 0.55;

// The site's CTA: a sky fill that swaps to cream on hover, with the arrow
// sliding out. The secondary is the same shape inverted, so the pair reads as
// one control group rather than two unrelated buttons.
const CTA_BASE =
  "group inline-block border border-sky px-3 py-2.5 transition-colors duration-500";
const CTA_PRIMARY = cn(CTA_BASE, "bg-sky hover:bg-cream");
const CTA_SECONDARY = cn(CTA_BASE, "bg-cream hover:bg-sky");

function CtaLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-owners-medium inline-flex items-center gap-2 text-[11px] uppercase tracking-wide">
      {children}
      <span
        className="transition-transform duration-500 group-hover:translate-x-1.5"
        aria-hidden
      >
        &rarr;
      </span>
    </span>
  );
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
  const dict = useDictionary();
  const locale = useLocale();
  const t = dict.home.calendar;
  const weekdays = useMemo(() => weekdayNames(locale), [locale]);
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
  const barRef = useRef<HTMLDivElement>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const cells = useMemo(() => monthCells(year, month), [year, month]);

  const isoFor = (day: number) => toISODate(new Date(year, month, day));

  const monthLabel = formatMonth(locale, cursor);
  const atFirstMonth =
    year === today.getFullYear() && month === today.getMonth();

  const shiftMonth = (delta: number) => setCursor(new Date(year, month + delta, 1));

  const chooseDay = (iso: string) => {
    setSelected(iso);
    setStatus({ kind: "idle" });
  };

  const dismissBar = () => {
    blurFocusWithin(barRef.current);
    setSelected(null);
    setStatus({ kind: "idle" });
  };

  const confirmDate = () => {
    if (!selected) return;

    startTransition(async () => {
      const result = await setDeliveryDate(selected);

      if (!result.ok) {
        setStatus({ kind: "error", message: dict.errors[result.code] });
        return;
      }

      // The action may have opened the cart that now holds this date, so the
      // navbar badge and panel need to re-read it.
      notifyCartUpdated();
      setStatus({ kind: "saved", date: result.date });
    });
  };

  // Park the bar below the fold before first paint, so it slides in on the
  // first selection rather than flashing at the bottom of the page on load.
  useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    gsap.set(bar, { yPercent: 100, visibility: "visible" });
  }, []);

  const barOpen = selected !== null;

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const tween = gsap.to(bar, {
      yPercent: barOpen ? 0 : 100,
      duration: BAR_DURATION,
      ease: barOpen ? "power3.out" : "power3.in",
      overwrite: "auto",
    });

    return () => {
      tween.kill();
    };
  }, [barOpen]);

  const isSaved = status.kind === "saved";

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
          <div className="px-(--grid-gutter) pb-[5svh]">
            <h2 className="font-owners-medium text-[12px] uppercase tracking-wide">
              {t.label}
            </h2>
            <div
              className="mt-4 h-px bg-sky"
              style={{
                marginInline: "calc(-1 * var(--grid-gutter))",
                width: "calc(100% + 2 * var(--grid-gutter))",
              }}
              aria-hidden
            />
          </div>

          {/* On a phone the month takes the whole width and Prev/Next sit
              under it. Sharing one row squeezed the longest names until the
              last letter wrapped onto its own line. */}
          <div className="flex flex-col items-start gap-4 px-(--grid-gutter) pb-[4svh] md:flex-row md:flex-wrap md:items-end md:justify-between">
            {/* text-left: TextReveal centres each split line unless an ancestor opts out.
                key remounts the reveal when Prev/Next changes the month. */}
            <div className="w-full min-w-0 text-left md:flex-1">
              <TextReveal key={monthLabel} blockColor={REVEAL_BLOCK} stagger={0.12}>
                <h2 className="font-owners-narrow-bold text-[13vw] leading-[0.85] wrap-break-word uppercase md:text-[min(9vw,14svh)]">
                  {monthLabel}
                </h2>
              </TextReveal>
            </div>

            <div className="flex items-center gap-4 md:pb-2">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                disabled={atFirstMonth}
                className="font-owners-medium text-[12px] uppercase tracking-wide transition-opacity hover:opacity-60 disabled:opacity-30"
              >
                {t.prev}
              </button>
              <span className="font-archivo-light text-[13px]">{year}</span>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                className="font-owners-medium text-[12px] uppercase tracking-wide transition-opacity hover:opacity-60"
              >
                {t.next}
              </button>
            </div>
          </div>

          {/* Day names sit above the rules, as in the reference. */}
          <div className="grid grid-cols-7">
            {weekdays.map((weekday) => (
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
              const state = dayState(iso, availability);
              const number = String(day).padStart(2, "0");

              // Only days the kitchen turned down get the solid fill. Painting
              // the lead time and the days already gone the same way made the
              // first half of every month read as "fully booked".
              if (state === "closed") {
                return (
                  <div
                    key={day}
                    className={cn(cellClassName, "bg-sky")}
                    aria-hidden
                  />
                );
              }

              if (state === "past") {
                return (
                  <div
                    key={day}
                    className={cn(
                      cellClassName,
                      "flex items-start justify-end bg-sky/25",
                    )}
                    aria-hidden
                  >
                    <span className="font-owners-medium text-[10px] md:text-[12px]">
                      {number}
                    </span>
                  </div>
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
                    {number}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="px-(--grid-gutter) pt-[4svh]">
            {/* The three cell treatments read as one scale of "less available"
                unless they are named. Body copy alone left visitors guessing
                which blue meant what. */}
            <ul className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <li className="flex items-center gap-2.5">
                <span
                  className="size-4 border border-sky bg-cream"
                  aria-hidden
                />
                <span className="font-owners-medium text-[12px] uppercase tracking-wide md:text-[13px]">
                  {t.legendOpen}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="size-4 border border-sky bg-sky" aria-hidden />
                <span className="font-owners-medium text-[12px] uppercase tracking-wide md:text-[13px]">
                  {t.legendClosed}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <span
                  className="size-4 border border-sky bg-sky/25"
                  aria-hidden
                />
                <span className="font-owners-medium text-[12px] uppercase tracking-wide md:text-[13px]">
                  {t.legendTooSoon}
                </span>
              </li>
            </ul>

            <p className="font-archivo-light mt-6 max-w-[44ch] text-[18px] leading-normal md:text-[min(1.35vw,2svh)]">
              {interpolate(t.note, { days: LEAD_TIME_DAYS })}
            </p>
          </div>
        </div>
      </div>

      {/* A bar rather than a dialog: picking a delivery day is a comparison, so
          the grid has to stay on screen and stay clickable while it is up. The
          confirm used to sit below the calendar, a full screen away from the
          cell being tapped on a phone. */}
      <div
        ref={barRef}
        className="fixed inset-x-0 bottom-0 z-30 invisible border-t border-sky bg-cream text-black"
        role="region"
        aria-label="Selected delivery date"
        aria-hidden={!barOpen}
        inert={!barOpen}
      >
        <div className="flex flex-col gap-4 px-(--grid-inset) py-5 md:flex-row md:items-center md:justify-between md:gap-8">
          <div className="flex min-w-0 items-baseline gap-4">
            {/* Dismiss sits with the text, away from the two CTAs — nothing
                good comes of putting "never mind" next to "confirm". */}
            <button
              type="button"
              onClick={dismissBar}
              aria-label="Dismiss"
              className="font-owners-medium shrink-0 text-[12px] uppercase tracking-wide opacity-60 transition-opacity hover:opacity-100 md:text-(length:--nav-text)"
            >
              {t.dismiss}
            </button>

            <div className="min-w-0">
            {isSaved ? (
              <p className="font-archivo-light text-[16px] leading-normal md:text-[18px]">
                {t.savedPrefix}{" "}
                <span className="font-owners-medium text-[14px] uppercase tracking-wide md:text-[15px]">
                  {formatDeliveryDate(status.date)}
                </span>
                {t.savedSuffix}
              </p>
            ) : (
              <>
                <p className="font-archivo-light text-[16px] leading-normal md:text-[18px]">
                  {t.deliveryOn}{" "}
                  <span className="font-owners-medium text-[14px] uppercase tracking-wide md:text-[15px]">
                    {selected ? formatDeliveryDate(selected) : ""}
                  </span>
                </p>
                {status.kind === "error" && (
                  <p role="alert" className="font-archivo-light mt-1 text-[14px] md:text-[15px]">
                    {status.message}
                  </p>
                )}
              </>
            )}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            {isSaved ? (
              <>
                <Link href={routes.shop} className={CTA_PRIMARY}>
                  <CtaLabel>{t.choosePlates}</CtaLabel>
                </Link>
                <Link href={routes.cart} className={CTA_SECONDARY}>
                  <CtaLabel>{dict.common.viewCart}</CtaLabel>
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={confirmDate}
                  disabled={isPending}
                  className={cn(CTA_PRIMARY, "disabled:opacity-40")}
                >
                  <CtaLabel>
                    {isPending ? t.saving : t.save}
                  </CtaLabel>
                </button>
                <Link href={routes.contact} className={CTA_SECONDARY}>
                  <CtaLabel>{t.askAboutDate}</CtaLabel>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
