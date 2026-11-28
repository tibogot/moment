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
import { CellGrid } from "@/components/v2/CellGrid";
import { monthCells } from "@/lib/calendar";
import { notifyCartUpdated, openCartPanel } from "@/lib/cart-store";
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
 * The delivery calendar on the 16 / 12 / 4 grid (/v2/systeme, then the v2
 * home). Same behaviour as CalendarGrid (availability from Shopify, four day
 * states, month arrows bounded by the booking window, the bar that saves the
 * date to the cart) — that logic is copied from it; only the shape changes.
 *
 * The shape of /v2's calendar (25 November 2026), which read calmer than
 * days drawn as the page's own cells: the page's cells hidden (the frame
 * only), the month an object of its own with its own rules — but sized on
 * the grid: exactly 7 cells wide from tablet up, so every day is one cell,
 * 3/4. Desktop: the month on cells 9–15 (16 left free), the information on
 * 1–7 — label, month, arrows, legend at the top, the note and the way to
 * the shop at the foot. Tablet: month on 6–12, information on 1–5. Phone:
 * stacked, the month across the 4 cells.
 *
 * Days: large black numbers for the ones that can be booked, the chosen one
 * in parentheses — "( 24 )" —, closed or full ones with the brand card's
 * diagonal, today marked; "( moment )" in two free cells of the month.
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

export function CalendarCells({
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
              <button
                type="button"
                onClick={openCartPanel}
                className={CTA_SECONDARY}
              >
                <CtaLabel>{dict.common.viewCart}</CtaLabel>
              </button>
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

  // "( moment )" in a two-cell slot among the empty cells, as on page 4 of
  // the charter: the last two cells when at least two are free after the
  // last day, else the first two when at least two are free before the 1st,
  // else not this month — it never displaces a day.
  const logoSlot = (() => {
    const first = cells.findIndex((day) => day !== null);
    const last =
      cells.length - 1 - [...cells].reverse().findIndex((day) => day !== null);
    if (cells.length - 1 - last >= 2) return cells.length - 2;
    if (first >= 2) return 0;
    return null;
  })();

  /**
   * One day: a cell of the month's block, which draws its own rules (left
   * and bottom here; the block closes the top and the right). From tablet up
   * the block is 7 cells of the page grid wide, so each day is one cell, 3/4.
   */
  const renderDay = (day: number | null, index: number) => {
    const base =
      "relative aspect-3/4 min-w-0 border-b border-l border-sky [container-type:inline-size]";

    if (logoSlot !== null && index === logoSlot + 1) return null;
    if (logoSlot !== null && index === logoSlot) {
      return (
        <div
          key="logo"
          aria-hidden
          // No aspect ratio: the row's 3/4 days set its height.
          className="col-span-2 flex min-w-0 items-center justify-center border-b border-l border-sky"
        >
          {/* Black as on the charter; 70% of the slot leaves the "m"'s
              width free each side — its exclusion zone. */}
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

    if (day === null)
      return <div key={`blank-${index}`} className={base} aria-hidden />;

    const iso = isoFor(day);
    const state = dayState(iso, availability);
    const number = String(day).padStart(2, "0");
    const selectedDay = selected === iso;
    // Today, marked whatever its state: a word at the cell's foot from
    // tablet up, a dot on a phone, where the cell is too narrow for it.
    const todayMark =
      iso === availability.today ? (
        <>
          <span className="font-owners-medium pointer-events-none absolute bottom-[8cqw] left-[9cqw] hidden text-[length:max(8px,11cqw)] leading-none tracking-wide text-black uppercase md:block">
            {t.today}
          </span>
          <span className="pointer-events-none absolute bottom-[12cqw] left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-black md:hidden" />
        </>
      ) : null;

    if (state !== "open") {
      // Closed, full, too soon or gone: the diagonal, the number small in
      // the corner the "/" never reaches; the tint tells "too soon / gone"
      // from "closed or full".
      const tinted = state === "past" || state === "beyond";
      return (
        <div key={day} className={base} aria-hidden>
          <div className={cn("absolute inset-0", tinted && "bg-sky/25")}>
            <Diagonal />
          </div>
          <span className="font-owners-medium absolute top-[8cqw] left-[9cqw] text-[length:max(9px,16cqw)] leading-none text-black/60">
            {number}
          </span>
          {todayMark}
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
        className={cn(base, "group outline-none")}
      >
        {/* The days that can be booked in black, the strongest type in the
            month. Hover and keyboard focus fill the cell with the grid's
            colour, light (40%). The chosen day fills with it, full, at the
            same size, in parentheses (black was tried and dropped) — it used to shrink to fit them, which
            read as less chosen, not more (25 November 2026). */}
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 transition-colors duration-300",
            selectedDay
              ? "bg-(--palette-line)"
              : "group-hover:bg-(--palette-line)/40 group-focus-visible:bg-(--palette-line)/40",
          )}
        />
        <span
          className={cn(
            "font-owners-narrow-bold relative flex h-full items-center justify-center text-[length:42cqw] leading-none tracking-[-0.01em] whitespace-nowrap",
            "text-black",
          )}
        >
          {selectedDay ? `( ${number} )` : number}
        </span>
        {todayMark}
      </button>
    );
  };

  const arrows = (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => shiftMonth(-1)}
        disabled={atFirstMonth}
        className="font-owners-medium text-[12px] tracking-wide uppercase transition-opacity hover:opacity-60 disabled:opacity-30"
      >
        {t.prev}
      </button>
      <span className="font-archivo-light text-[13px]">{year}</span>
      <button
        type="button"
        onClick={() => shiftMonth(1)}
        disabled={atLastMonth}
        className="font-owners-medium text-[12px] tracking-wide uppercase transition-opacity hover:opacity-60 disabled:opacity-30"
      >
        {t.next}
      </button>
    </div>
  );

  // The swatches are 3/4 rectangles, not squares: the design has none.
  const legend = (
    <ul className="flex flex-wrap gap-x-6 gap-y-3">
      <li className="flex items-center gap-2.5">
        <span
          className="h-4 w-3 shrink-0 border border-sky bg-cream"
          aria-hidden
        />
        <span className={LEGEND}>{t.legendOpen}</span>
      </li>
      <li className="flex items-center gap-2.5">
        <span
          className="relative h-4 w-3 shrink-0 border border-sky"
          aria-hidden
        >
          <Diagonal />
        </span>
        <span className={LEGEND}>{t.legendClosed}</span>
      </li>
      <li className="flex items-center gap-2.5">
        <span
          className="relative h-4 w-3 shrink-0 border border-sky bg-sky/25"
          aria-hidden
        >
          <Diagonal />
        </span>
        <span className={LEGEND}>{t.legendTooSoon}</span>
      </li>
    </ul>
  );

  return (
    // The bottom border closes the section, pulled up by a rule and raised a
    // layer: a section after it that opens on a rule draws that rule on the
    // same pixels; one that opens on a band (the footer) leaves it showing.
    <section className="relative z-1 -mb-(--grid-line) w-full border-b border-sky bg-cream text-black">
      {/* The frame only: the month is an object of its own on the page, its
          rules its own, as on /v2's calendar. */}
      <CellGrid
        lineClassName="bg-sky"
        bands={false}
        cells={false}
        readout={false}
        subdivide={2}
      />
      <div
        className="relative grid gap-y-[6svh] py-[calc(var(--s-cell-h)/2)]"
        style={{ gridTemplateColumns: "var(--s-grid-columns)" }}
      >
        {/* The information: cells 1–7 on desktop, 1–4 on a tablet. The
            month, its arrows and the legend, then the note and the way to
            the shop. From a tablet up it is held under the navbar while the
            month scrolls by (28 November 2026, like the story sections'
            panels, StoryCells), as far from the bar as it sits at rest. */}
        <div className="col-[2/span_4] flex min-w-0 flex-col gap-[6svh] px-(--v2-pad) md:sticky md:top-[calc(var(--grid-band)_+_var(--announcement-h,0px)_+_var(--s-cell-h)/2)] md:col-[2/span_5] md:row-[1] md:self-start lg:col-[2/span_7]">
          <div className="flex flex-col gap-[3svh]">
            <h2 className={cn(LEGEND, "flex items-center gap-2")}>
              {/* The site's small 3/4 rectangle before a label. */}
              <span
                aria-hidden
                className="inline-block h-[0.8em] w-[0.6em] shrink-0 bg-sky"
              />
              {t.label}
            </h2>
            <p className="font-owners-narrow-bold text-[13vw] leading-[0.85] uppercase md:text-[length:calc(var(--s-cell-h)*0.8)]">
              {monthLabel}
            </p>
            <p aria-live="polite" className="sr-only">
              {monthLabel} {year}
            </p>
            {arrows}
            {legend}
          </div>
          <div className="flex flex-col">
            <p className="font-archivo-light max-w-[44ch] text-(length:--body-text) leading-snug">
              {interpolate(t.note, { days: availability.leadTimeDays })}
              {closedDays ? ` ${closedDays}` : ""}
            </p>
            <Link
              href={routes.shop}
              className={cn(CTA_PRIMARY, "mt-4 self-start")}
            >
              <CtaLabel>{t.choosePlates}</CtaLabel>
            </Link>
          </div>
        </div>

        {/* The month: exactly 7 cells wide from tablet up — cells 9–15 on
            desktop (cell 16 left free, so the block does not touch the
            frame), 6–12 on a tablet — so each day is one cell, 3/4. The
            weekdays above it, outside the block. */}
        <div className="col-[2/span_4] min-w-0 md:col-[7/span_7] md:row-[1] lg:col-[10/span_7]">
          <div className="grid grid-cols-7">
            {weekdays.map((weekday) => (
              <div
                key={weekday}
                aria-hidden
                className="font-owners-medium pb-2 text-[9px] tracking-wide uppercase md:px-(--v2-pad) md:text-[11px]"
              >
                <span className="md:hidden">{weekday.slice(0, 1)}</span>
                <span className="hidden md:inline">{weekday.slice(0, 3)}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 border-t border-r border-sky">
            {cells.map((day, index) => renderDay(day, index))}
          </div>
        </div>
      </div>

      {isClient && createPortal(bar, document.body)}
    </section>
  );
}
