"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { setDeliveryDate } from "@/app/actions/cart";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { useDictionary, useLocale } from "@/components/LocaleProvider";
import TextReveal from "@/components/TextReveal";
import { CellGrid } from "@/components/v2/CellGrid";
import { monthCells } from "@/lib/calendar";
import { notifyCartUpdated } from "@/lib/cart-store";
import { REVEAL_BLOCK } from "@/lib/colors";
import {
  dayState,
  parseISODate,
  refreshAvailability,
  toISODate,
  type DeliveryAvailability,
} from "@/lib/delivery/dates";
import { finishIfReducedMotion, gsap } from "@/lib/gsap";
import { useIsClient } from "@/lib/hooks/useIsClient";
import { interpolate } from "@/lib/i18n/dictionaries";
import {
  closedWeekdaysNote,
  formatLongDate,
  formatMonth,
  weekdayNames,
} from "@/lib/i18n/format";
import { blurFocusWithin } from "@/lib/overlayFocus";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * The delivery calendar on the v2 grid. Same behaviour as v1
 * (`components/CalendarSection.tsx`, untouched): availability from Shopify,
 * re-derived in the browser; four day states; month arrows bounded by the
 * booking window; a bar that saves the date to the cart.
 *
 * What changes is the shape. A calendar is a tool: the month should be seen
 * whole and picked from at a glance, so it is compact. Days stay 3/4 like
 * every cell on the site (4/3 was tried and broke the system), and with 7
 * days a row the calendar is about 1.15 times as tall as it is wide, so its
 * width follows the screen's height (the days at most 62svh wide), keeping six weeks to
 * about 70% of the screen on any display. Full-width versions were one to
 * one and a half screens tall.
 *
 * Desktop: the information carries the left half (label, the month in large
 * type, arrows, legend, note, the way to the shop) and the calendar sits in
 * cells 5–8 against the right inset. Phone and tablet stack them. Only the
 * weeks the month needs (4 to 6).
 *
 * The days follow page 4 of the charter: large numbers in the grid's colour,
 * and the chosen day in parentheses — "( 24 )" — because "the parentheses
 * isolate a precise moment". Closed or full days carry the brand card's
 * diagonal.
 */

/**
 * The diagonal for a day that cannot be booked, bottom-left to top-right like
 * the brand card's, in --palette-line — the colour the rules take, palette
 * preview included.
 *
 * An SVG line, not a gradient: a gradient's hard stops are not anti-aliased,
 * so a slanted one renders as a staircase on a standard-density screen. The
 * SVG stretches with its cell (preserveAspectRatio none) while the stroke
 * stays the rules' 2px (non-scaling-stroke). Its parent must be positioned.
 */
function Diagonal() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 size-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <line
        x1="0"
        y1="100"
        x2="100"
        y2="0"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        style={{ stroke: "var(--palette-line)" }}
      />
    </svg>
  );
}

const BAR_DURATION = 0.55;

// The site's CTA pair, as in v1: sky fill to cream on hover, and its inverse.
const CTA_BASE =
  "group inline-block border border-sky px-3 py-2.5 transition-colors duration-500";
const CTA_PRIMARY = cn(CTA_BASE, "bg-sky hover:bg-cream");
const CTA_SECONDARY = cn(CTA_BASE, "bg-cream hover:bg-sky");

const LEGEND = "font-owners-medium text-[12px] uppercase tracking-wide";

function CtaLabel({ children }: { children: ReactNode }) {
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

export function CalendarGrid({
  availability: builtAvailability,
}: {
  /** Resolved on the server: today in Brussels, lead time, closed days. */
  availability: DeliveryAvailability;
}) {
  const isClient = useIsClient();
  const availability = useMemo(
    () =>
      isClient ? refreshAvailability(builtAvailability) : builtAvailability,
    [isClient, builtAvailability],
  );
  const dict = useDictionary();
  const locale = useLocale();
  const t = dict.home.calendar;
  const weekdays = useMemo(() => weekdayNames(locale), [locale]);
  const closedDays = closedWeekdaysNote(
    locale,
    dict,
    availability.closedWeekdays,
  );
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

  // Only the weeks this month needs: 4, 5 or 6 rows.
  const cells = useMemo(() => monthCells(year, month), [year, month]);

  // "( moment )" in a two-cell slot among the empty cells, as on page 4 of
  // the charter, at the far end of the free run so it stands apart from the
  // days whenever there is room: the last two cells of the month's grid when
  // at least two are free after the last day, else the first two when at
  // least two are free before the 1st, else not this month — it never
  // displaces a day.
  const logoSlot = useMemo(() => {
    const first = cells.findIndex((day) => day !== null);
    const last =
      cells.length - 1 - [...cells].reverse().findIndex((day) => day !== null);
    if (cells.length - 1 - last >= 2) return cells.length - 2;
    if (first >= 2) return 0;
    return null;
  }, [cells]);

  const isoFor = (day: number) => toISODate(new Date(year, month, day));
  const monthLabel = formatMonth(locale, cursor);
  const atFirstMonth =
    year === today.getFullYear() && month === today.getMonth();
  const lastBookable = useMemo(
    () => parseISODate(availability.lastBookable) ?? today,
    [availability.lastBookable, today],
  );
  const atLastMonth =
    year === lastBookable.getFullYear() && month === lastBookable.getMonth();

  const shiftMonth = (delta: number) =>
    setCursor(new Date(year, month + delta, 1));

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
      const result = await setDeliveryDate(locale, selected);
      if (!result.ok) {
        setStatus({ kind: "error", message: dict.errors[result.code] });
        return;
      }
      notifyCartUpdated();
      setStatus({ kind: "saved", date: result.date });
    });
  };

  // The bar is portalled to <body> (see below), so it only exists once on
  // the client: park it below the fold as soon as it does.
  useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    gsap.set(bar, { yPercent: 100, visibility: "visible" });
  }, [isClient]);

  const barOpen = selected !== null;

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const tween = finishIfReducedMotion(
      gsap.to(bar, {
        yPercent: barOpen ? 0 : 100,
        duration: BAR_DURATION,
        ease: barOpen ? "power3.out" : "power3.in",
        overwrite: "auto",
      }),
    );
    return () => {
      tween.kill();
    };
  }, [barOpen]);

  const isSaved = status.kind === "saved";

  // A bar rather than a dialog, as in v1: the calendar stays on screen and
  // clickable while it is up. Portalled to <body> because `.v2` is a size
  // container, and containment makes it the box `position: fixed` resolves
  // against — inside it the bar would pin to the page, not the screen.
  const bar = (
    <div
      ref={barRef}
      className="fixed inset-x-0 bottom-0 z-30 invisible border-t border-sky bg-cream text-black"
      role="region"
      aria-label={dict.orderBar.selectedDate}
      aria-hidden={!barOpen}
      inert={!barOpen}
    >
      <div className="flex flex-col gap-4 px-(--grid-inset) py-5 md:flex-row md:items-center md:justify-between md:gap-8">
        <div className="flex min-w-0 items-baseline gap-4">
          <button
            type="button"
            onClick={dismissBar}
            // "Annuler", not "Fermer": beside a delivery date, "fermé" reads
            // as "closed", the legend's word for a day that can't be booked.
            // No aria-label, so screen readers hear what is on screen.
            className="font-owners-medium shrink-0 text-[12px] uppercase tracking-wide opacity-60 transition-opacity hover:opacity-100 md:text-(length:--nav-text)"
          >
            {t.dismiss}
          </button>
          <div className="min-w-0">
            {isSaved ? (
              <p className="font-archivo-light text-[16px] leading-normal md:text-[18px]">
                {t.savedPrefix}{" "}
                <span className="font-owners-medium text-[14px] uppercase tracking-wide md:text-[15px]">
                  {formatLongDate(locale, status.date)}
                </span>
                {t.savedSuffix}
              </p>
            ) : (
              <>
                <p className="font-archivo-light text-[16px] leading-normal md:text-[18px]">
                  {t.deliveryOn}{" "}
                  <span className="font-owners-medium text-[14px] uppercase tracking-wide md:text-[15px]">
                    {selected ? formatLongDate(locale, selected) : ""}
                  </span>
                </p>
                {status.kind === "error" && (
                  <p
                    role="alert"
                    className="font-archivo-light mt-1 text-[14px] md:text-[15px]"
                  >
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
                <CtaLabel>{isPending ? t.saving : t.save}</CtaLabel>
              </button>
              <Link href={routes.contact} className={CTA_SECONDARY}>
                <CtaLabel>{t.askAboutDate}</CtaLabel>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <section className="relative w-full bg-cream text-black">
      {/* Frame only: the calendar draws its own cells. */}
      <CellGrid lineClassName="bg-sky" readout={false} cells={false} />

      {/*
        One grid on the page's columns (cell n = grid column n + 1), blocks
        inset by the gutter. Phone and tablet stack: info, note, calendar.
        Desktop: info and note in cells 1–4, the calendar in cells 5–8,
        against the right inset.
      */}
      <div
        className="relative grid lg:items-start"
        style={{
          gridTemplateColumns: "var(--v2-columns)",
          paddingBlock: "var(--grid-band)",
        }}
      >
        {/* Info: label, the month, arrows, legend. */}
        <div className="col-[2/span_4] min-w-0 px-(--grid-gutter) pt-(--grid-gutter) text-left md:col-[2/span_6] lg:col-[2/span_4] lg:row-[1]">
          <h2 className={LEGEND}>{t.label}</h2>
          <div className="mt-[3svh] min-w-0">
            <TextReveal
              key={monthLabel}
              blockColor={REVEAL_BLOCK}
              stagger={0.12}
            >
              <p className="font-owners-narrow-bold text-[13vw] leading-[0.85] wrap-break-word uppercase md:text-[min(7vw,11svh)] lg:text-[min(6.4vw,14svh)]">
                {monthLabel}
              </p>
            </TextReveal>
          </div>
          <p aria-live="polite" className="sr-only">
            {monthLabel} {year}
          </p>

          <div className="mt-[3svh] flex items-center gap-4">
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
              disabled={atLastMonth}
              className="font-owners-medium text-[12px] uppercase tracking-wide transition-opacity hover:opacity-60 disabled:opacity-30"
            >
              {t.next}
            </button>
          </div>

          <ul className="mt-[4svh] flex flex-wrap gap-x-6 gap-y-3">
            <li className="flex items-center gap-2.5">
              <span className="size-4 border border-sky bg-cream" aria-hidden />
              <span className={LEGEND}>{t.legendOpen}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="relative size-4 border border-sky" aria-hidden>
                <Diagonal />
              </span>
              <span className={LEGEND}>{t.legendClosed}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span
                className="relative size-4 border border-sky bg-sky/25"
                aria-hidden
              >
                <Diagonal />
              </span>
              <span className={LEGEND}>{t.legendTooSoon}</span>
            </li>
          </ul>
        </div>

        {/* Note and the way to the shop. */}
        <div className="col-[2/span_4] mt-[3svh] mb-[4svh] min-w-0 px-(--grid-gutter) md:col-[2/span_6] lg:col-[2/span_4] lg:row-[2] lg:mt-[4svh] lg:mb-0">
          <p className="font-archivo-light max-w-[44ch] text-(length:--body-text) leading-normal">
            {interpolate(t.note, { days: availability.leadTimeDays })}
            {closedDays ? ` ${closedDays}` : ""}
          </p>
          <Link href={routes.shop} className={cn(CTA_PRIMARY, "mt-5")}>
            <CtaLabel>{t.choosePlates}</CtaLabel>
          </Link>
        </div>

        {/*
          The calendar. Days are 3/4 like every cell on the site; its width
          follows the screen's height (the days at most 62svh wide, the gutter-inset column
          otherwise), so six weeks always take about 70% of the screen and
          the month is seen whole, at a glance — wide screens included.
        */}
        <div className="col-[2/span_4] w-full max-w-[calc(62svh+2*var(--grid-gutter))] justify-self-end px-(--grid-gutter) pb-(--grid-gutter) md:col-[2/span_6] lg:col-[6/span_4] lg:row-[1/span_2] lg:pt-(--grid-gutter)">
          <div className="grid grid-cols-7">
            {weekdays.map((weekday) => (
              <div
                key={weekday}
                className="font-owners-medium pb-2 text-left text-[9px] uppercase tracking-wide md:text-[11px] md:px-1"
              >
                <span className="md:hidden">{weekday.slice(0, 1)}</span>
                <span className="hidden md:inline">{weekday.slice(0, 3)}</span>
              </div>
            ))}
          </div>

          {/* border-t + border-r close the grid; every day carries border-l +
              border-b, so no line doubles up. A size container, so the
              numbers scale with the calendar. */}
          <div className="grid grid-cols-7 border-t border-r border-sky [container-type:inline-size]">
            {cells.map((day, index) => {
              const cellClassName =
                "aspect-3/4 min-w-0 border-b border-l border-sky p-1";

              // The logo slot spans two cells; its second cell is not drawn.
              if (logoSlot !== null && index === logoSlot + 1) return null;
              if (logoSlot !== null && index === logoSlot) {
                return (
                  <div
                    key="logo"
                    // No aspect ratio: the row's 3/4 days set its height.
                    className="col-span-2 flex min-w-0 items-center justify-center border-b border-l border-sky"
                  >
                    {/* Black as on the charter; 70% of the slot leaves at
                        least the width of the "m" free each side — its
                        exclusion zone — and stays above the 45px minimum. */}
                    <Image
                      src="/brand/Moment-Logotype.svg"
                      alt=""
                      width={1437}
                      height={220}
                      className="h-auto w-[70%] brightness-0"
                    />
                  </div>
                );
              }

              if (day === null) {
                return <div key={`blank-${index}`} className={cellClassName} />;
              }

              const iso = isoFor(day);
              const state = dayState(iso, availability);
              const number = String(day).padStart(2, "0");
              const selectedDay = selected === iso;

              // Page 4 of the charter: a large number in the grid's colour
              // (--palette-line, so the palette preview recolours it); the
              // chosen day in parentheses — "the parentheses isolate a
              // precise moment" — with thin spaces so it fits the cell.
              const numberEl = (
                <span className="font-owners-narrow-bold text-[length:calc(100cqw/7*0.4)] leading-none tracking-[-0.01em] whitespace-nowrap">
                  {selectedDay ? `( ${number} )` : number}
                </span>
              );
              const dayClassName = cn(
                cellClassName,
                "flex items-center justify-center",
              );
              // Days that cannot be booked: the number small in the top-left
              // corner — the one the "/" diagonal never reaches — so the line
              // crosses the cell cleanly — and the large numbers are left to
              // the days you can book, which stand out the more for it.
              const cornerNumber = (
                <span className="font-owners-medium relative text-[length:max(9px,calc(100cqw/7*0.15))] leading-none">
                  {number}
                </span>
              );
              const unavailableClassName = cn(
                cellClassName,
                "relative flex items-start justify-start",
              );

              if (state === "closed") {
                return (
                  <div
                    key={day}
                    className={cn(unavailableClassName, "text-black/60")}
                    aria-hidden
                  >
                    <Diagonal />
                    {cornerNumber}
                  </div>
                );
              }

              if (state === "past" || state === "beyond") {
                return (
                  <div
                    key={day}
                    className={cn(
                      unavailableClassName,
                      "bg-sky/25 text-black/60",
                    )}
                    // Every day that cannot be booked carries the diagonal,
                    // as in the brand reference; the tint tells "too soon /
                    // gone" from "closed or full".
                    aria-hidden
                  >
                    <Diagonal />
                    {cornerNumber}
                  </div>
                );
              }

              return (
                <button
                  key={day}
                  type="button"
                  aria-pressed={selectedDay}
                  aria-label={`${day} ${monthLabel} ${year}`}
                  onClick={() => chooseDay(iso)}
                  className={cn(
                    dayClassName,
                    "transition-colors duration-300 outline-none",
                    // Hover and keyboard focus invert the cell — the grid's
                    // colour fills it, the number takes the page's — like the
                    // site's buttons; the chosen day keeps that inversion
                    // and goes in parentheses. Palette variables, so it holds
                    // in the sky preview too.
                    selectedDay
                      ? "bg-(--palette-line) text-(--palette-page)"
                      : "text-(--palette-line) hover:bg-(--palette-line) hover:text-(--palette-page) focus-visible:bg-(--palette-line) focus-visible:text-(--palette-page)",
                  )}
                >
                  {numberEl}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {isClient && createPortal(bar, document.body)}
    </section>
  );
}
