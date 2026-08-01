"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsapConfig";
import { GridLines } from "@/components/GridLines";
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
        <div className="flex items-center justify-end px-(--grid-inset)">
          <button
            type="button"
            onClick={onClose}
            className="font-owners-medium text-[11px] uppercase tracking-wide transition-opacity hover:opacity-60"
          >
            Close
          </button>
        </div>

        <nav className="row-start-2 row-end-5 flex flex-col justify-center overflow-y-auto px-(--grid-inset)">
          <ul className="flex flex-col gap-2">
            <li className="overflow-hidden">
              <div className="flex items-center justify-between gap-4">
                <Link
                  href={shopNav.href}
                  data-menu-item
                  onClick={onClose}
                  className="font-owners-narrow-bold block text-[13vw] leading-[1.05] uppercase transition-opacity hover:opacity-60"
                >
                  {shopNav.label}
                </Link>
                {collections.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShopOpen((current) => !current)}
                    aria-expanded={shopOpen}
                    aria-label={
                      shopOpen ? "Hide collections" : "Show collections"
                    }
                    className="font-owners-medium shrink-0 text-[14px] uppercase tracking-wide transition-opacity hover:opacity-60"
                  >
                    {shopOpen ? "−" : "+"}
                  </button>
                )}
              </div>

              {collections.length > 0 && (
                <div
                  className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
                  style={{ maxHeight: shopOpen ? "24rem" : "0" }}
                >
                  <ul className="mt-3 flex flex-col gap-2 border-l border-sky pl-4">
                    <li>
                      <Link
                        href={routes.shop}
                        onClick={onClose}
                        className="font-owners-medium text-[12px] uppercase tracking-wide transition-opacity hover:opacity-60"
                      >
                        All
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
              <li key={href} className="overflow-hidden">
                <Link
                  href={href}
                  data-menu-item
                  onClick={onClose}
                  className="font-owners-narrow-bold block text-[13vw] leading-[1.05] uppercase transition-opacity hover:opacity-60"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
