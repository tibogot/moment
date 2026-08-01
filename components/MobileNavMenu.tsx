"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsapConfig";
import { GridLines } from "@/components/GridLines";
import { mainNav } from "@/lib/routes";
import { useOverlayScrollLock } from "@/lib/useOverlayScrollLock";

type MobileNavMenuProps = {
  open: boolean;
  onClose: () => void;
};

const ANIM_DURATION = 0.75;
const OPEN_EASE = "power3.out";
const CLOSE_EASE = "power3.inOut";

/**
 * Stays mounted and slides in and out, so there is no open/closing state to
 * juggle — `open` alone drives the timeline.
 */
export function MobileNavMenu({ open, onClose }: MobileNavMenuProps) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousPathname = useRef(pathname);

  useOverlayScrollLock(open);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    gsap.set(panel, { yPercent: -100 });
  }, []);

  // Close once navigation has actually happened.
  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    onClose();
  }, [pathname, onClose]);

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
    if (!panel) return;

    const items = panel.querySelectorAll("[data-menu-item]");
    const tl = gsap.timeline({
      defaults: { overwrite: "auto" },
    });

    if (open) {
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

  return (
    <div
      ref={panelRef}
      className="fixed inset-0 z-50 bg-cream text-black md:hidden"
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

        <nav className="row-start-2 row-end-5 flex flex-col justify-center px-(--grid-inset)">
          <ul className="flex flex-col gap-2">
            {mainNav.map(({ label, href }) => (
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
