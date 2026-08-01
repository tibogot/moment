"use client";

import Image from "next/image";
import Link from "next/link";
import {
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
  notifyCartUpdated,
  subscribeCart,
} from "@/lib/cart-store";
import { DeliveryDatePicker } from "@/components/DeliveryDatePicker";
import { formatDeliveryDate, isBookable, LEAD_TIME_DAYS } from "@/lib/delivery";
import { routes } from "@/lib/routes";
import { useOverlayScrollLock } from "@/lib/useOverlayScrollLock";

type CartPanelProps = {
  open: boolean;
  onClose: () => void;
};

const ANIM_DURATION = 0.75;
const OPEN_EASE = "power3.out";
const CLOSE_EASE = "power3.inOut";

export function CartPanel({ open, onClose }: CartPanelProps) {
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
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useOverlayScrollLock(open);

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
      onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, pickerOpen]);

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

  const mutate = (action: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      notifyCartUpdated();
    });
  };

  const isEmpty = !cart || cart.lines.length === 0;
  const deliveryDate = cart?.deliveryDate ?? null;

  // A date saved days ago can go stale while the cart sits — the owners may
  // have closed it since. Shopify's hosted checkout will not let anyone edit a
  // cart attribute, so this panel is the last place it can be put right.
  const dateIsStale = Boolean(
    deliveryDate && availability && !isBookable(deliveryDate, availability),
  );
  const needsDate = !deliveryDate || dateIsStale;

  const chooseDate = (iso: string) => {
    setError(null);
    startTransition(async () => {
      const result = await setDeliveryDate(iso);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      notifyCartUpdated();
      setPickerOpen(false);
    });
  };

  return (
    <>
      <div
        ref={backdropRef}
        data-overlay-backdrop
        className="pointer-events-none fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden
        style={{ pointerEvents: open ? "auto" : "none" }}
      />

      <div
        ref={panelRef}
        data-overlay-panel
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[440px] flex-col bg-cream text-black"
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
        aria-hidden={!open}
        inert={!open}
      >
        {/* Same band height + type size as the closed navbar / search overlay. */}
        <div>
          <div className="flex min-h-(--grid-band) items-center justify-between px-6">
            <p className="font-owners-medium text-[12px] uppercase tracking-wide md:text-(length:--nav-text)">
              {pickerOpen
                ? "Delivery date"
                : `Cart${cart?.totalQuantity ? ` (${cart.totalQuantity})` : ""}`}
            </p>
            <button
              type="button"
              onClick={pickerOpen ? () => setPickerOpen(false) : onClose}
              className="font-owners-medium text-[11px] uppercase tracking-wide transition-opacity hover:opacity-60 md:text-(length:--nav-text)"
            >
              {pickerOpen ? "Back" : "Close"}
            </button>
          </div>
          <div className="h-px bg-sky" aria-hidden />
        </div>

        <div className="flex-1 overflow-y-auto" data-lenis-prevent>
          {pickerOpen && availability ? (
            <>
              <p className="font-archivo-light px-6 pt-5 text-[13px] leading-normal">
                Pick the day you want this delivered. Blue days are closed or
                already full — we need {LEAD_TIME_DAYS}{" "}
                days&apos; notice and we do not deliver on Sundays.
              </p>

              {error && (
                <p
                  role="alert"
                  className="font-archivo-light px-6 pt-3 text-[13px]"
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
            <p className="font-archivo-light px-6 py-10 text-[15px]">
              Your cart is empty.
            </p>
          ) : (
            <ul>
              {cart.lines.map((line) => (
                <li
                  key={line.id}
                  className="flex gap-4 border-b border-sky px-6 py-5"
                >
                  <Link
                    href={routes.product(line.productHandle)}
                    onClick={onClose}
                    className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden bg-sky/20"
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
                      onClick={onClose}
                      className="font-owners-medium text-[12px] uppercase tracking-wide"
                    >
                      {line.title}
                    </Link>
                    {line.variantTitle && (
                      <span className="font-archivo-light mt-1 text-[13px] opacity-70">
                        {line.variantTitle}
                      </span>
                    )}

                    <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                      <div className="flex items-center border border-sky">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          disabled={isPending}
                          onClick={() =>
                            mutate(() =>
                              updateCartLine(line.id, line.quantity - 1),
                            )
                          }
                          className="px-2.5 py-1 text-[13px] transition-opacity hover:opacity-60 disabled:opacity-40"
                        >
                          −
                        </button>
                        <span className="font-archivo-light min-w-6 text-center text-[13px]">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          disabled={isPending}
                          onClick={() =>
                            mutate(() =>
                              updateCartLine(line.id, line.quantity + 1),
                            )
                          }
                          className="px-2.5 py-1 text-[13px] transition-opacity hover:opacity-60 disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-archivo-light text-[13px]">
                        {line.lineTotal}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => mutate(() => removeFromCart(line.id))}
                      className="font-archivo-light mt-2 self-start text-[12px] underline underline-offset-2 transition-opacity hover:opacity-60 disabled:opacity-40"
                    >
                      Remove
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
                  Delivery
                </span>

                {deliveryDate && !dateIsStale ? (
                  <span className="flex items-baseline gap-3">
                    <span className="font-archivo-light text-[13px]">
                      {formatDeliveryDate(deliveryDate)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPickerOpen(true)}
                      className="font-archivo-light text-[12px] underline underline-offset-2 transition-opacity hover:opacity-60"
                    >
                      Change
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="font-archivo-light text-[13px] underline underline-offset-2 transition-opacity hover:opacity-60"
                  >
                    {dateIsStale ? "Pick another day" : "Choose a date"}
                  </button>
                )}
              </div>

              {dateIsStale && deliveryDate && (
                <p role="alert" className="font-archivo-light mt-2 text-[12px]">
                  {formatDeliveryDate(deliveryDate)} is no longer available.
                  Please pick another day.
                </p>
              )}
            </div>

            <div className="px-6 py-5">
              {error && (
                <p className="font-archivo-light mb-3 text-[13px]">{error}</p>
              )}

              <div className="flex items-baseline justify-between">
                <span className="font-owners-medium text-[12px] uppercase tracking-wide">
                  Total
                </span>
                <span className="font-archivo-light text-[15px]">
                  {cart.totalPrice}
                </span>
              </div>

              <p className="font-archivo-light mt-1 text-[12px] opacity-70">
                Taxes and delivery calculated at checkout.
              </p>

              {/* Without a day there is nothing to check out to, so the picker
                  takes the primary slot rather than disabling the button and
                  leaving the customer to work out why. */}
              {needsDate ? (
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="font-owners-medium mt-4 block w-full bg-black px-6 py-4 text-center text-[12px] uppercase tracking-wide text-cream transition-opacity hover:opacity-80"
                >
                  Choose a delivery date
                </button>
              ) : (
                <a
                  href={cart.checkoutUrl}
                  className="font-owners-medium mt-4 block bg-black px-6 py-4 text-center text-[12px] uppercase tracking-wide text-cream transition-opacity hover:opacity-80"
                >
                  Checkout
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
