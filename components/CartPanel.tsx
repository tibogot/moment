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
import { removeFromCart, updateCartLine } from "@/app/actions/cart";
import {
  getCartSnapshot,
  getServerCartSnapshot,
  notifyCartUpdated,
  subscribeCart,
} from "@/lib/cart-store";
import { routes } from "@/lib/routes";
import { useOverlayScrollLock } from "@/lib/useOverlayScrollLock";

type CartPanelProps = {
  open: boolean;
  onClose: () => void;
};

const ANIM_DURATION = 0.55;
const ANIM_EASE = "power4.inOut";

export function CartPanel({ open, onClose }: CartPanelProps) {
  const cart = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getServerCartSnapshot,
  );
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useOverlayScrollLock(open);

  // Park off-screen before paint — no Tailwind translate utilities, they stack
  // with GSAP's xPercent and leave the panel stuck out of view.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;

    gsap.set(panel, { xPercent: 100 });
    gsap.set(backdrop, { autoAlpha: 0 });
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;

    const tl = gsap.timeline({
      defaults: { duration: ANIM_DURATION, ease: ANIM_EASE, overwrite: "auto" },
    });

    if (open) {
      tl.to(backdrop, { autoAlpha: 1 }, 0);
      tl.to(panel, { xPercent: 0 }, 0);
    } else {
      tl.to(panel, { xPercent: 100 }, 0);
      tl.to(backdrop, { autoAlpha: 0 }, 0);
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

  return (
    <>
      <div
        ref={backdropRef}
        className="pointer-events-none fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden
        style={{ pointerEvents: open ? "auto" : "none" }}
      />

      <div
        ref={panelRef}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[440px] flex-col bg-cream text-black"
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
        aria-hidden={!open}
        inert={!open}
      >
        <div className="flex items-center justify-between border-b border-sky px-6 py-5">
          <p className="font-owners-medium text-[12px] uppercase tracking-wide">
            Cart{cart?.totalQuantity ? ` (${cart.totalQuantity})` : ""}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="font-owners-medium text-[11px] uppercase tracking-wide transition-opacity hover:opacity-60"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto" data-lenis-prevent>
          {isEmpty ? (
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

        {!isEmpty && (
          <div className="border-t border-sky px-6 py-5">
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

            <a
              href={cart.checkoutUrl}
              className="font-owners-medium mt-4 block bg-black px-6 py-4 text-center text-[12px] uppercase tracking-wide text-cream transition-opacity hover:opacity-80"
            >
              Checkout
            </a>
          </div>
        )}
      </div>
    </>
  );
}
