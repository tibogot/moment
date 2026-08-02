"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Handbag } from "lucide-react";
import { gsap } from "@/lib/gsapConfig";
import { GridLines } from "@/components/GridLines";
import {
  getCartSnapshot,
  getServerCartSnapshot,
  subscribeCart,
} from "@/lib/cart-store";
import { mainNav, routes } from "@/lib/routes";
import type { ShopifyCollection } from "@/lib/shopify/queries";
import { useOverlayScrollLock } from "@/lib/useOverlayScrollLock";

type MobileNavMenuProps = {
  open: boolean;
  onClose: () => void;
  collections?: ShopifyCollection[];
};

const ANIM_DURATION = 0.75;
const OPEN_EASE = "power3.out";
const CLOSE_EASE = "power3.inOut";

/**
 * Stays mounted and slides in and out, so there is no open/closing state to
 * juggle — `open` alone drives the timeline.
 */
export function MobileNavMenu({
  open,
  onClose,
  collections = [],
}: MobileNavMenuProps) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousPathname = useRef(pathname);
  const hasOpenedRef = useRef(false);
  const [shopOpen, setShopOpen] = useState(false);
  const cart = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getServerCartSnapshot,
  );
  const cartCount = cart?.totalQuantity ?? 0;

  useOverlayScrollLock(open);

  // Park off-screen + reveal after the CSS overlay guard. Same pattern as
  // SearchPanel / CartPanel so a refresh never flashes the links.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    gsap.set(panel, { yPercent: -100, visibility: "visible" });
    gsap.set(panel.querySelectorAll("[data-menu-item]"), {
      yPercent: 100,
      opacity: 0,
    });
  }, []);

  // Close once navigation has actually happened.
  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    setShopOpen(false);
    onClose();
  }, [pathname, onClose]);

  useEffect(() => {
    if (!open) {
      setShopOpen(false);
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    // First mount is already parked — don't tween closed from y=0 (that flash
    // is what you see on mobile refresh).
    if (!open && !hasOpenedRef.current) {
      gsap.set(panel, { yPercent: -100 });
      return;
    }

    const items = panel.querySelectorAll("[data-menu-item]");
    const tl = gsap.timeline({
      defaults: { overwrite: "auto" },
    });

    if (open) {
      hasOpenedRef.current = true;
      tl.to(panel, {
        yPercent: 0,
        duration: ANIM_DURATION,
        ease: OPEN_EASE,
      });
      tl.fromTo(
        items,
        { yPercent: 100, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.55,
          stagger: 0.04,
          ease: "power2.out",
        },
        "-=0.35",
      );
    } else {
      tl.to(panel, {
        yPercent: -100,
        duration: ANIM_DURATION,
        ease: CLOSE_EASE,
      });
    }

    return () => {
      tl.kill();
    };
  }, [open]);

  const [shopNav, ...otherNav] = mainNav;

  return (
    <div
      ref={panelRef}
      data-overlay-panel
      className="fixed inset-0 z-50 bg-cream text-black nav:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      aria-hidden={!open}
      inert={!open}
    >
      <GridLines lineClassName="bg-sky" />

      <div
        className="relative grid h-full"
        style={{ gridTemplateRows: "var(--grid-rows)" }}
      >
        <div className="border-b border-sky">
          <nav className="relative grid min-h-(--grid-band) grid-cols-3 items-center px-(--grid-inset)">
            <button
              type="button"
              onClick={onClose}
              className="font-owners-medium justify-self-start text-[11px] uppercase tracking-wide transition-opacity hover:opacity-60"
            >
              Close
            </button>

            <Link
              href={routes.home}
              aria-label="Moment home"
              className="flex justify-center justify-self-center"
              onClick={onClose}
            >
              <span className="inline-flex" style={{ filter: "brightness(0)" }}>
                <Image
                  src="/brand/logonav.svg"
                  alt="Moment"
                  width={110}
                  height={21}
                  className="h-auto"
                  style={{ width: "var(--nav-logo)" }}
                />
              </span>
            </Link>

            <button
              type="button"
              aria-label={`Cart${cartCount ? ` (${cartCount})` : ""}`}
              onClick={() => {
                onClose();
                window.dispatchEvent(new Event("cart-open"));
              }}
              className="relative justify-self-end"
            >
              <Handbag
                style={{ width: "var(--nav-icon)", height: "var(--nav-icon)" }}
                strokeWidth={1.5}
              />
              {cartCount > 0 && (
                <span className="font-archivo-light absolute -top-1.5 -right-2 text-[10px] leading-none">
                  {cartCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        <nav className="row-start-2 row-end-5 overflow-y-auto pt-[3svh]">
          <ul className="border-b border-sky">
            <li className="overflow-hidden border-t border-sky">
              <div className="flex items-center justify-between gap-4 px-(--grid-inset) py-4">
                {collections.length > 0 ? (
                  <>
                    <button
                      type="button"
                      data-menu-item
                      onClick={() => setShopOpen((current) => !current)}
                      aria-expanded={shopOpen}
                      className="font-owners-narrow-bold block text-left text-[13vw] leading-[1.05] uppercase transition-opacity hover:opacity-60"
                    >
                      {shopNav.label}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShopOpen((current) => !current)}
                      aria-expanded={shopOpen}
                      aria-label={
                        shopOpen ? "Hide shop links" : "Show shop links"
                      }
                      className="font-owners-medium shrink-0 text-[14px] uppercase tracking-wide transition-opacity hover:opacity-60"
                    >
                      {shopOpen ? "−" : "+"}
                    </button>
                  </>
                ) : (
                  <Link
                    href={routes.shop}
                    data-menu-item
                    onClick={onClose}
                    className="font-owners-narrow-bold block text-[13vw] leading-[1.05] uppercase transition-opacity hover:opacity-60"
                  >
                    {shopNav.label}
                  </Link>
                )}
              </div>

              {collections.length > 0 && (
                <div
                  className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
                  style={{ maxHeight: shopOpen ? "24rem" : "0" }}
                >
                  <ul className="flex flex-col gap-2 border-t border-sky px-(--grid-inset) py-4">
                    <li>
                      <Link
                        href={routes.shop}
                        onClick={onClose}
                        className="font-owners-medium text-[12px] uppercase tracking-wide transition-opacity hover:opacity-60"
                      >
                        All
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={routes.collections}
                        onClick={onClose}
                        className="font-owners-medium text-[12px] uppercase tracking-wide transition-opacity hover:opacity-60"
                      >
                        Collections
                      </Link>
                    </li>
                    {collections.map((collection) => (
                      <li key={collection.id}>
                        <Link
                          href={routes.collection(collection.handle)}
                          onClick={onClose}
                          className="font-owners-medium text-[12px] uppercase tracking-wide transition-opacity hover:opacity-60"
                        >
                          {collection.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>

            {otherNav.map(({ label, href }) => (
              <li key={href} className="overflow-hidden border-t border-sky">
                <Link
                  href={href}
                  data-menu-item
                  onClick={onClose}
                  className="font-owners-narrow-bold block px-(--grid-inset) py-4 text-[13vw] leading-[1.05] uppercase transition-opacity hover:opacity-60"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div
          className="row-start-5 border-t border-sky min-h-(--grid-band)"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
