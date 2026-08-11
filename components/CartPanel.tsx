"use client";

import Image from "next/image";
import { LocaleLink as Link } from "@/components/LocaleLink";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import { gsap } from "@/lib/gsapConfig";
import {
  removeFromCart,
  setDeliveryDate,
  updateCartLine,
} from "@/app/actions/cart";
import {
  getAvailabilitySnapshot,
  getCartSnapshot,
  getServerAvailabilitySnapshot,
  getServerCartSnapshot,
  getZonesSnapshot,
  refreshCart,
  setCart,
  subscribeCart,
} from "@/lib/cart-store";
import { DeliveryDatePicker } from "@/components/DeliveryDatePicker";
import { isBookable } from "@/lib/delivery";
import { checkoutBlocker } from "@/lib/checkout";
import { useDictionary, useLocale } from "@/components/LocaleProvider";
import { interpolate } from "@/lib/i18n/dictionaries";
import {
  closedWeekdaysNote,
  formatLongDate,
  formatMoney,
} from "@/lib/i18n/format";
import { routes } from "@/lib/routes";
import { blurFocusWithin } from "@/lib/overlayFocus";
import { useOverlayScrollLock } from "@/lib/useOverlayScrollLock";

type CartPanelProps = {
  open: boolean;
  onClose: () => void;
};

const ANIM_DURATION = 0.75;
const OPEN_EASE = "power3.out";
const CLOSE_EASE = "power3.inOut";

/**
 * Long enough that tapping `+` four times sends one write carrying the final
 * number instead of four, short enough that a single tap does not feel parked.
 * `cartLinesUpdate` takes an absolute quantity, so collapsing the taps is only
 * ever a matter of sending the last one.
 */
const QUANTITY_DEBOUNCE_MS = 300;

export function CartPanel({ open, onClose }: CartPanelProps) {
  const dict = useDictionary();
  const locale = useLocale();
  const t = dict.cart;
  const cart = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getServerCartSnapshot,
  );
  const availability = useSyncExternalStore(
    subscribeCart,
    getAvailabilitySnapshot,
    getServerAvailabilitySnapshot,
  );
  // Same snapshot on the server as before the first fetch, so this needs no
  // separate server getter: both sides start on the built-in table.
  const zones = useSyncExternalStore(
    subscribeCart,
    getZonesSnapshot,
    getZonesSnapshot,
  );
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Quantities the customer has asked for but Shopify has not confirmed yet,
  // keyed by line id — 0 means the line is on its way out. These are what the
  // list renders, so a tap lands on screen immediately and the network happens
  // behind it. A ref mirrors the state because the debounced writes below read
  // the latest target from outside the render.
  const [pending, setPending] = useState<Record<string, number>>({});
  const pendingRef = useRef(pending);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const queue = useRef<Promise<void>>(Promise.resolve());

  useOverlayScrollLock(open);

  const closePanel = useCallback(() => {
    blurFocusWithin(panelRef.current);
    onClose();
  }, [onClose]);

  // Park off-screen before paint — no Tailwind translate utilities, they stack
  // with GSAP's xPercent and leave the panel stuck out of view.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;

    gsap.set(panel, { xPercent: 100, visibility: "visible" });
    gsap.set(backdrop, { autoAlpha: 0, visibility: "visible" });
  }, []);

  useEffect(() => {
    if (!open) return;

    // Escape backs out of the picker first — closing the whole panel from
    // inside a sub-view loses more than the customer asked to lose.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (pickerOpen) {
        setPickerOpen(false);
        return;
      }
      closePanel();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closePanel, pickerOpen]);

  useEffect(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;

    const ease = open ? OPEN_EASE : CLOSE_EASE;
    const tl = gsap.timeline({
      defaults: { duration: ANIM_DURATION, ease, overwrite: "auto" },
    });

    if (open) {
      tl.to(backdrop, { autoAlpha: 1, duration: ANIM_DURATION * 0.85 }, 0);
      tl.to(panel, { xPercent: 0 }, 0);
    } else {
      // Reopening should show the cart, not wherever the last visit left off.
      // Reset once the panel is out of sight, or the view swaps under the
      // customer mid-slide.
      tl.to(
        panel,
        { xPercent: 100, onComplete: () => setPickerOpen(false) },
        0,
      );
      tl.to(backdrop, { autoAlpha: 0, duration: ANIM_DURATION * 0.7 }, 0.05);
    }

    return () => {
      tl.kill();
    };
  }, [open]);

  const writePending = (next: Record<string, number>) => {
    pendingRef.current = next;
    setPending(next);
  };

  const clearPending = (lineId: string) => {
    if (!(lineId in pendingRef.current)) return;
    const next = { ...pendingRef.current };
    delete next[lineId];
    writePending(next);
  };

  // One write at a time. Shopify does not merge concurrent cart mutations, and
  // two responses landing out of order would put an older cart back on screen.
  const enqueue = (lineId: string) => {
    const run = async () => {
      const target = pendingRef.current[lineId];
      if (target === undefined) return;

      try {
        const result =
          target === 0
            ? await removeFromCart(locale, lineId)
            : await updateCartLine(locale, lineId, target);

        if (!result.ok) {
          setError(dict.errors[result.code] ?? dict.errors.generic);
          clearPending(lineId);
          void refreshCart();
          return;
        }

        // The mutation already returned the new cart, so there is nothing left
        // to fetch. Hold the optimistic value if a newer tap is still queued
        // behind this one, or the number would flick back for a moment.
        setCart(result.cart);
        if (pendingRef.current[lineId] === target && !timers.current.has(lineId)) {
          clearPending(lineId);
        }
      } catch {
        setError(dict.errors.generic);
        clearPending(lineId);
        void refreshCart();
      }
    };

    queue.current = queue.current.then(run);
  };

  const setLineQuantity = (lineId: string, quantity: number) => {
    setError(null);
    writePending({ ...pendingRef.current, [lineId]: Math.max(0, quantity) });

    const existing = timers.current.get(lineId);
    if (existing) clearTimeout(existing);
    timers.current.set(
      lineId,
      setTimeout(() => {
        timers.current.delete(lineId);
        enqueue(lineId);
      }, QUANTITY_DEBOUNCE_MS),
    );
  };

  /**
   * Steps off the ref rather than the rendered quantity: taps landing in the
   * same frame all read the same render, so `line.quantity + 1` three times over
   * asks for 2 rather than 4. The ref always holds the latest target.
   */
  const stepLineQuantity = (lineId: string, rendered: number, delta: number) => {
    setLineQuantity(lineId, (pendingRef.current[lineId] ?? rendered) + delta);
  };

  useEffect(() => {
    const scheduled = timers.current;
    return () => {
      for (const timer of scheduled.values()) clearTimeout(timer);
    };
  }, []);

  // Line totals stay on Shopify's numbers rather than being guessed from a unit
  // price: discounts live on the server, and a total that flickers to a wrong
  // figure is worse than one that lands a moment late.
  const lines = (cart?.lines ?? [])
    .map((line) => ({ ...line, quantity: pending[line.id] ?? line.quantity }))
    .filter((line) => line.quantity > 0);

  const isEmpty = !cart || lines.length === 0;
  const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0);
  const deliveryDate = cart?.deliveryDate ?? null;

  // A date saved days ago can go stale while the cart sits — the owners may
  // have closed it since. Shopify's hosted checkout will not let anyone edit a
  // cart attribute, so this panel is the last place it can be put right.
  const dateIsStale = Boolean(
    deliveryDate && availability && !isBookable(deliveryDate, availability),
  );

  // Same gate as the cart page, from the same function. Two checkout buttons
  // with two opinions about whether a basket is allowed through is how a €40
  // order reaches a €125 zone.
  const blocker = cart
    ? checkoutBlocker(
        {
          deliveryDate,
          deliveryMethod: cart.deliveryMethod,
          deliveryAddress: cart.deliveryAddress,
          deliveryZone: cart.deliveryZone,
          subtotal: cart.subtotal,
        },
        availability,
        zones,
      )
    : { kind: "no-date" as const };

  const needsDate =
    blocker?.kind === "no-date" || blocker?.kind === "stale-date";

  const chooseDate = (iso: string) => {
    setError(null);
    startTransition(async () => {
      const result = await setDeliveryDate(locale, iso);
      if (!result.ok) {
        setError(dict.errors[result.code]);
        return;
      }
      setCart(result.cart);
      setPickerOpen(false);
    });
  };

  return (
    <>
      <div
        ref={backdropRef}
        data-overlay-backdrop
        className="pointer-events-none fixed inset-0 z-40 bg-black/40"
        onClick={closePanel}
        aria-hidden
        style={{ pointerEvents: open ? "auto" : "none" }}
      />

      <div
        ref={panelRef}
        data-overlay-panel
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-110 flex-col bg-cream text-black"
        role="dialog"
        aria-modal="true"
        aria-label={t.title}
        aria-hidden={!open}
        inert={!open}
      >
        {/* Same band height + type size as the closed navbar / search overlay. */}
        <div>
          <div className="flex min-h-(--grid-band) items-center justify-between px-6">
            <p className="font-owners-medium text-[12px] uppercase tracking-wide md:text-(length:--nav-text)">
              {pickerOpen
                ? t.deliveryDateTitle
                : `${t.title}${totalQuantity ? ` (${totalQuantity})` : ""}`}
            </p>
            <button
              type="button"
              onClick={pickerOpen ? () => setPickerOpen(false) : closePanel}
              className="font-owners-medium text-[11px] uppercase tracking-wide transition-opacity hover:opacity-60 md:text-(length:--nav-text)"
            >
              {pickerOpen ? dict.common.back : dict.common.close}
            </button>
          </div>
          <div className="h-px bg-sky" aria-hidden />
        </div>

        <div className="flex-1 overflow-y-auto" data-lenis-prevent>
          {pickerOpen && availability ? (
            <>
              <p className="font-archivo-light px-6 pt-5 text-[15px] leading-normal">
                {t.pickDayIntro}{" "}
                {interpolate(dict.delivery.calendarNote, {
                  days: availability.leadTimeDays,
                })}{" "}
                {closedWeekdaysNote(locale, dict, availability.closedWeekdays)}
              </p>

              {error && (
                <p
                  role="alert"
                  className="font-archivo-light px-6 pt-3 text-[15px]"
                >
                  {error}
                </p>
              )}

              <DeliveryDatePicker
                availability={availability}
                value={deliveryDate}
                onSelect={chooseDate}
                disabled={isPending}
              />
            </>
          ) : isEmpty ? (
            <p className="font-archivo-light px-6 py-10 text-[16px]">
              {t.empty}
            </p>
          ) : (
            <ul>
              {lines.map((line) => (
                <li
                  key={line.id}
                  className="flex gap-4 border-b border-sky px-6 py-5"
                >
                  <Link
                    href={routes.product(line.productHandle)}
                    onClick={closePanel}
                    className="relative aspect-4/5 w-20 shrink-0 overflow-hidden bg-sky/20"
                  >
                    {line.imageUrl && (
                      <Image
                        src={line.imageUrl}
                        alt={line.imageAlt}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link
                      href={routes.product(line.productHandle)}
                      onClick={closePanel}
                      className="font-owners-medium text-[12px] uppercase tracking-wide"
                    >
                      {line.title}
                    </Link>
                    {line.variantTitle && (
                      <span className="font-archivo-light mt-1 text-[15px] opacity-70">
                        {line.variantTitle}
                      </span>
                    )}

                    <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                      <div className="flex items-center border border-sky">
                        <button
                          type="button"
                          aria-label={t.decrease}
                          onClick={() =>
                            stepLineQuantity(line.id, line.quantity, -1)
                          }
                          className="px-2.5 py-1 text-[15px] transition-opacity hover:opacity-60"
                        >
                          −
                        </button>
                        <span className="font-archivo-light min-w-6 text-center text-[15px]">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={t.increase}
                          onClick={() =>
                            stepLineQuantity(line.id, line.quantity, 1)
                          }
                          className="px-2.5 py-1 text-[15px] transition-opacity hover:opacity-60"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-archivo-light text-[15px]">
                        {line.lineTotal}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setLineQuantity(line.id, 0)}
                      className="font-archivo-light mt-2 self-start text-[14px] underline underline-offset-2 transition-opacity hover:opacity-60"
                    >
                      {t.remove}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!isEmpty && !pickerOpen && (
          <div className="border-t border-sky">
            {/* The date has to be settled here. It travels to the order as a
                cart attribute, and Shopify's hosted checkout gives the customer
                no way to change it once they have left this panel. */}
            <div className="border-b border-sky px-6 py-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-owners-medium text-[12px] uppercase tracking-wide">
                  {t.delivery}
                </span>

                {deliveryDate && !dateIsStale ? (
                  <span className="flex items-baseline gap-3">
                    <span className="font-archivo-light text-[15px]">
                      {formatLongDate(locale, deliveryDate)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPickerOpen(true)}
                      className="font-archivo-light text-[14px] underline underline-offset-2 transition-opacity hover:opacity-60"
                    >
                      {t.change}
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="font-archivo-light text-[15px] underline underline-offset-2 transition-opacity hover:opacity-60"
                  >
                    {dateIsStale ? t.pickAnother : t.pick}
                  </button>
                )}
              </div>

              {dateIsStale && deliveryDate && (
                <p role="alert" className="font-archivo-light mt-2 text-[14px]">
                  {interpolate(t.staleDate, {
                    date: formatLongDate(locale, deliveryDate),
                  })}
                </p>
              )}
            </div>

            <div className="px-6 py-5">
              {error && (
                <p className="font-archivo-light mb-3 text-[15px]">{error}</p>
              )}

              <div className="flex items-baseline justify-between">
                <span className="font-owners-medium text-[12px] uppercase tracking-wide">
                  {t.total}
                </span>
                <span className="font-archivo-light text-[17px]">
                  {cart.totalPrice}
                </span>
              </div>

              <p className="font-archivo-light mt-1 text-[14px] opacity-70">
                {t.taxesNote}
              </p>

              {/* Without a day there is nothing to check out to, so the picker
                  takes the primary slot rather than disabling the button and
                  leaving the customer to work out why. */}
              {blocker?.kind === "below-minimum" && (
                <p role="alert" className="font-archivo-light mt-3 text-[14px]">
                  {interpolate(t.belowMinimumShort, {
                    zone: blocker.zone.id,
                    minimum: formatMoney(locale, blocker.zone.minimumOrder),
                    shortfall: formatMoney(locale, blocker.shortfall),
                  })}
                </p>
              )}

              {blocker?.kind === "no-address" && (
                <p role="alert" className="font-archivo-light mt-3 text-[14px]">
                  {t.noAddressShort}
                </p>
              )}

              {needsDate ? (
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="group mt-4 block w-full border border-sky bg-sky px-3 py-2.5 text-center transition-colors duration-500 hover:bg-cream"
                >
                  <span className="font-owners-medium inline-flex items-center justify-center gap-2 text-[11px] uppercase tracking-wide">
                    {t.chooseDate}
                    <span
                      className="transition-transform duration-500 group-hover:translate-x-1.5"
                      aria-hidden
                    >
                      &rarr;
                    </span>
                  </span>
                </button>
              ) : blocker ? (
                <span
                  aria-disabled
                  className="font-owners-medium mt-4 block w-full cursor-not-allowed border border-sky px-3 py-2.5 text-center text-[11px] uppercase tracking-wide opacity-40"
                >
                  {t.checkout}
                </span>
              ) : (
                <a
                  href={cart.checkoutUrl}
                  className="group mt-4 block w-full border border-sky bg-sky px-3 py-2.5 text-center transition-colors duration-500 hover:bg-cream"
                >
                  <span className="font-owners-medium inline-flex items-center justify-center gap-2 text-[11px] uppercase tracking-wide">
                    {t.checkout}
                    <span
                      className="transition-transform duration-500 group-hover:translate-x-1.5"
                      aria-hidden
                    >
                      &rarr;
                    </span>
                  </span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
