"use client";

import Image from "next/image";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Handbag } from "lucide-react";
import { gsap } from "@/lib/gsapConfig";
import { GridLines } from "@/components/GridLines";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  getCartSnapshot,
  getServerCartSnapshot,
  subscribeCart,
} from "@/lib/cart-store";
import { aboutNav, mainNav, routes, type NavMenuKey } from "@/lib/routes";
import { useDictionary } from "@/components/LocaleProvider";
import { interpolate } from "@/lib/i18n/dictionaries";
import type { ShopifyCollection } from "@/lib/shopify/queries";
import { useSiteDetails } from "@/components/SiteDetailsProvider";
import type { SiteDetails } from "@/lib/site";
import { blurFocusWithin } from "@/lib/overlayFocus";
import { useOverlayScrollLock } from "@/lib/useOverlayScrollLock";

/**
 * The accounts the owners have given us, and only those.
 *
 * This was a module-level array reading `siteConfig`, which is why it could not
 * follow the Studio — and why the phone number beneath it was
 * `+32 2 512 34 56`, an invented number rendered as a live `tel:` link. An
 * account with no address is dropped rather than linked to "#": a social icon
 * that goes nowhere costs more trust than a missing one.
 */
function socialLinksFor(details: SiteDetails) {
  return [
    {
      label: "Facebook",
      href: details.social.facebook,
      icon: "/brand/facebook.svg",
      width: 20,
      height: 20,
    },
    {
      label: "Instagram",
      href: details.social.instagram,
      icon: "/brand/instagram.svg",
      width: 20,
      height: 20,
    },
  ].filter((link) => Boolean(link.href));
}

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
  const details = useSiteDetails();
  const socialLinks = socialLinksFor(details);
  const phone = details.contact.phone;
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousPathname = useRef(pathname);
  const hasOpenedRef = useRef(false);
  // Which nav section is expanded, if any. One at a time: two open accordions
  // in a full-height panel push the rest of the links off the screen.
  const [expandedMenu, setExpandedMenu] = useState<NavMenuKey | null>(null);
  const cart = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getServerCartSnapshot,
  );
  const cartCount = cart?.totalQuantity ?? 0;

  const handleClose = useCallback(() => {
    blurFocusWithin(panelRef.current);
    setExpandedMenu(null);
    onClose();
  }, [onClose]);

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
    handleClose();
  }, [pathname, handleClose]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleClose]);

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
        onComplete: () => setExpandedMenu(null),
      });
    }

    return () => {
      tl.kill();
    };
  }, [open]);

  const dict = useDictionary();

  // The same two panels the desktop nav opens, flattened to label + href.
  // Shop's children come from Shopify and About's are fixed, which is the only
  // reason they are built here rather than shared with the desktop menus.
  const menuChildren: Record<NavMenuKey, { href: string; label: string }[]> = {
    shop: [
      { href: routes.shop, label: "All" },
      { href: routes.collections, label: dict.nav.collections },
      ...collections.map((collection) => ({
        href: routes.collection(collection.handle),
        label: collection.title,
      })),
    ],
    about: aboutNav.map(({ key, href }) => ({
      href,
      label: dict.aboutNav[key],
    })),
  };

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
              onClick={handleClose}
              className="font-owners-medium justify-self-start text-[11px] uppercase tracking-wide transition-opacity hover:opacity-60"
            >
              Close
            </button>

            <Link
              href={routes.home}
              aria-label="Moment home"
              className="flex justify-center justify-self-center"
              onClick={handleClose}
            >
              <span className="inline-flex" style={{ filter: "brightness(0)" }}>
                <Image
                  src="/brand/Moment-Logotype.svg"
                  alt="Moment"
                  width={1437}
                  height={220}
                  className="h-auto"
                  style={{ width: "var(--nav-logo)" }}
                />
              </span>
            </Link>

            <button
              type="button"
              aria-label={`Cart${cartCount ? ` (${cartCount})` : ""}`}
              onClick={() => {
                handleClose();
                window.dispatchEvent(new Event("cart-open"));
              }}
              className="relative justify-self-end"
            >
              <Handbag
                style={{ width: "var(--nav-icon)", height: "var(--nav-icon)" }}
                strokeWidth={1.5}
              />
              {cartCount > 0 && (
                <span className="font-archivo-light absolute -top-1.5 right-0 text-[10px] leading-none">
                  {cartCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        <nav className="row-start-2 row-end-6 flex min-h-0 flex-col overflow-hidden">
          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain pt-[3svh]"
            data-lenis-prevent
          >
            <ul className="border-b border-sky">
              {mainNav.map((item) => {
                // A plain destination.
                if (!("menu" in item)) {
                  return (
                    <li
                      key={item.key}
                      className="overflow-hidden border-t border-sky"
                    >
                      <Link
                        href={item.href}
                        data-menu-item
                        onClick={handleClose}
                        className="font-owners-narrow-bold block px-(--grid-inset) py-4 text-[10vw] leading-[1.05] uppercase transition-opacity hover:opacity-60"
                      >
                        {dict.nav[item.key]}
                      </Link>
                    </li>
                  );
                }

                const children = menuChildren[item.menu];
                const label = dict.nav[item.key];

                // Shop with no collections loaded has nothing to expand into,
                // so it falls back to being an ordinary link rather than a
                // toggle that opens onto nothing.
                if (children.length === 0) {
                  return (
                    <li
                      key={item.key}
                      className="overflow-hidden border-t border-sky"
                    >
                      <Link
                        href={item.menu === "shop" ? routes.shop : routes.about}
                        data-menu-item
                        onClick={handleClose}
                        className="font-owners-narrow-bold block px-(--grid-inset) py-4 text-[10vw] leading-[1.05] uppercase transition-opacity hover:opacity-60"
                      >
                        {label}
                      </Link>
                    </li>
                  );
                }

                const expanded = open && expandedMenu === item.menu;

                return (
                  <li
                    key={item.key}
                    className="overflow-hidden border-t border-sky"
                  >
                    <div className="px-(--grid-inset) py-4">
                      <button
                        type="button"
                        data-menu-item
                        onClick={() =>
                          setExpandedMenu((current) =>
                            current === item.menu ? null : item.menu,
                          )
                        }
                        aria-expanded={expanded}
                        aria-label={interpolate(
                          expanded ? dict.nav.hideLinks : dict.nav.showLinks,
                          { label },
                        )}
                        className="flex w-full items-center justify-between gap-4 text-left transition-opacity hover:opacity-60"
                      >
                        <span className="font-owners-narrow-bold text-[10vw] leading-[1.05] uppercase">
                          {label}
                        </span>
                        <span
                          className="font-owners-medium shrink-0 text-[14px] uppercase tracking-wide"
                          aria-hidden
                        >
                          {expanded ? "−" : "+"}
                        </span>
                      </button>
                    </div>

                    <div
                      className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
                      style={{ maxHeight: expanded ? "24rem" : "0" }}
                    >
                      <ul className="flex flex-col gap-2 border-t border-sky px-(--grid-inset) py-4">
                        {children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={handleClose}
                              className="font-owners-medium text-[12px] uppercase tracking-wide transition-opacity hover:opacity-60"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div
            data-menu-item
            className="mt-auto shrink-0 border-t border-sky px-(--grid-inset) py-4"
          >
            <div className="flex flex-col gap-3">
              {/* The panel covers the navbar, so its compact switcher is
                  unreachable from here. This row has the width the bar does
                  not, so it carries all three languages outright. */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                  {socialLinks.map(({ label, href, icon, width, height }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-opacity hover:opacity-60"
                    >
                      <Image
                        src={icon}
                        alt=""
                        width={width}
                        height={height}
                        aria-hidden
                      />
                    </a>
                  ))}
                </div>

                {/* Wider apart than the desktop bar: the targets are now
                    thumb-height, and the space between them is what stops a
                    near miss landing on the wrong language. */}
                <LanguageSwitcher className="shrink-0 gap-5" />
              </div>
              {phone && (
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="font-owners-medium text-[12px] uppercase tracking-wide transition-opacity hover:opacity-60"
                >
                  {phone}
                </a>
              )}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
