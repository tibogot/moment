"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { useGSAP } from "@gsap/react";
import { CircleUserRound, Handbag, Menu, Search } from "lucide-react";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";
import { CartPanel } from "@/components/CartPanel";
import { GridLines } from "@/components/GridLines";
import { MobileNavMenu } from "@/components/MobileNavMenu";
import { SearchPanel } from "@/components/SearchPanel";
import {
  getCartSnapshot,
  getServerCartSnapshot,
  subscribeCart,
} from "@/lib/cart-store";
import { gsap, ScrollTrigger } from "@/lib/gsapConfig";
import { mainNav, routes } from "@/lib/routes";

const DURATION = 0.48;
const EASE = "power2.out";
const CLOSE_EASE = "power2.inOut";

const TRANSPARENT_NAV_SELECTOR = "[data-transparent-nav]";
const TRANSPARENT_NAV_PATHS: ReadonlySet<string> = new Set([routes.home]);

// The nav turns cream almost immediately: the wipe completes over the first
// NAV_SCROLL_REVEAL_DISTANCE pixels of scroll rather than waiting for the hero
// to leave the viewport.
const NAV_SCROLL_REVEAL_DISTANCE = 120;

const CREAM = "#f8f7f2";
const BLACK = "#000000";

export function Navbar() {
  const pathname = usePathname();
  const hasTransparentHero = TRANSPARENT_NAV_PATHS.has(pathname);

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [navHovered, setNavHovered] = useState(false);
  const [navSolid, setNavSolid] = useState(!hasTransparentHero);

  const cart = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getServerCartSnapshot,
  );
  const cartCount = cart?.totalQuantity ?? 0;

  // AddToCartButton opens the panel after a successful add.
  useEffect(() => {
    const openCart = () => {
      setMenuOpen(false);
      setSearchOpen(false);
      setCartOpen(true);
    };

    window.addEventListener("cart-open", openCart);
    return () => window.removeEventListener("cart-open", openCart);
  }, []);

  const headerRef = useRef<HTMLElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLSpanElement>(null);
  const navTweenRef = useRef<gsap.core.Timeline | null>(null);
  const scrollNavTriggerRef = useRef<ScrollTriggerType | null>(null);
  const hasTransparentHeroRef = useRef(hasTransparentHero);
  const navHoveredRef = useRef(navHovered);

  const isNavSolid = hasTransparentHero ? navSolid || navHovered : true;

  // Keep refs current before GSAP reads them — useEffect is too late for the
  // hover-leave path.
  useLayoutEffect(() => {
    hasTransparentHeroRef.current = hasTransparentHero;
    navHoveredRef.current = navHovered;
  });

  const shouldScrollControlNav = () =>
    hasTransparentHeroRef.current && !navHoveredRef.current;

  /** Drive the whole appearance off a single 0→1 scrub value. */
  const applyScrollNavAppearance = (progress: number, navHeight: number) => {
    const bg = bgRef.current;
    const nav = navRef.current;
    const logo = logoRef.current;
    if (!bg || !nav || !logo) return;

    const links = nav.querySelectorAll<HTMLElement>("[data-nav-link]");
    const clamped = gsap.utils.clamp(0, 1, progress);

    navTweenRef.current?.kill();
    gsap.killTweensOf(bg);

    gsap.set(bg, {
      transformOrigin: "top center",
      scaleY: clamped,
      height: navHeight,
    });
    gsap.set(links, {
      color: gsap.utils.interpolate(CREAM, BLACK, clamped),
    });
    gsap.set(logo, { filter: `brightness(${1 - clamped})` });

    const solid = clamped >= 0.5;
    setNavSolid((current) => (current === solid ? current : solid));
  };

  const syncScrollNavAppearance = () => {
    const nav = navRef.current;
    const trigger = scrollNavTriggerRef.current;
    if (!nav || !trigger || !shouldScrollControlNav()) return;

    applyScrollNavAppearance(trigger.progress, nav.offsetHeight);
  };

  const runNavAnimation = (solid: boolean, immediate = false) => {
    const nav = navRef.current;
    const bg = bgRef.current;
    const logo = logoRef.current;
    if (!nav || !bg || !logo) return;

    navTweenRef.current?.kill();
    gsap.killTweensOf(bg);

    const links = nav.querySelectorAll<HTMLElement>("[data-nav-link]");
    const navHeight = nav.offsetHeight;
    const duration = immediate ? 0 : DURATION;
    const colorAt = duration * 0.52;

    gsap.set(bg, { transformOrigin: "top center" });

    const tl = gsap.timeline({
      defaults: { duration, ease: EASE, overwrite: "auto" },
    });
    navTweenRef.current = tl;

    if (solid) {
      tl.set(links, { color: BLACK }, 0);
      tl.set(logo, { filter: "brightness(0)" }, 0);
      tl.to(bg, { scaleY: 1, height: navHeight, duration: duration * 0.75 }, 0);
    } else {
      tl.to(bg, { scaleY: 0, height: navHeight, ease: CLOSE_EASE }, 0);
      tl.to(links, { color: CREAM, duration: duration * 0.35 }, colorAt);
      tl.to(
        logo,
        { filter: "brightness(1)", duration: duration * 0.35 },
        colorAt,
      );
    }

    if (immediate) tl.progress(1, false);
  };

  // Scrub the nav from transparent to cream across the bottom of the hero.
  useGSAP(
    () => {
      const bg = bgRef.current;
      const nav = navRef.current;
      if (!bg || !nav) return;

      if (!hasTransparentHero) {
        runNavAnimation(true, true);
        return;
      }

      const isHovered = shellRef.current?.matches(":hover") ?? false;
      if (!isHovered) {
        gsap.set(bg, {
          transformOrigin: "top center",
          scaleY: 0,
          height: nav.offsetHeight,
        });
      }

      const transparentSection = document.querySelector(
        TRANSPARENT_NAV_SELECTOR,
      );
      if (!transparentSection) {
        runNavAnimation(true, true);
        return;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const trigger = ScrollTrigger.create({
        trigger: transparentSection,
        start: "top top",
        end: `top top-=${NAV_SCROLL_REVEAL_DISTANCE}`,
        invalidateOnRefresh: true,
        ...(reduceMotion
          ? {
              onEnter: () => {
                if (!shouldScrollControlNav()) return;
                applyScrollNavAppearance(1, nav.offsetHeight);
              },
              onLeaveBack: () => {
                if (!shouldScrollControlNav()) return;
                applyScrollNavAppearance(0, nav.offsetHeight);
              },
            }
          : {
              scrub: true,
              onUpdate: (self) => {
                if (!shouldScrollControlNav()) return;
                applyScrollNavAppearance(self.progress, nav.offsetHeight);
              },
            }),
        onRefresh: (self) => {
          if (!shouldScrollControlNav()) return;
          applyScrollNavAppearance(
            reduceMotion ? Number(self.isActive) : self.progress,
            nav.offsetHeight,
          );
        },
      });

      scrollNavTriggerRef.current = trigger;
      syncScrollNavAppearance();

      return () => {
        scrollNavTriggerRef.current = null;
        trigger.kill();
      };
    },
    { scope: headerRef, dependencies: [hasTransparentHero, pathname] },
  );

  // Hover over the hero forces the cream state; leaving hands control back to
  // the scrub.
  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (hasTransparentHero && !navHovered) {
        const progress = scrollNavTriggerRef.current?.progress ?? 0;

        if (progress <= 0.01) {
          runNavAnimation(false, reduceMotion);
        } else if (progress >= 0.99) {
          runNavAnimation(true, reduceMotion);
        } else {
          syncScrollNavAppearance();
        }
        return;
      }

      runNavAnimation(isNavSolid, reduceMotion);
    },
    {
      scope: headerRef,
      dependencies: [navHovered, hasTransparentHero, isNavSolid],
    },
  );

  const linkClassName =
    "font-owners-medium uppercase tracking-wide transition-opacity hover:opacity-70";

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-40">
      <div
        ref={shellRef}
        data-nav-intro
        className="relative"
        onMouseEnter={() => {
          navHoveredRef.current = true;
          setNavHovered(true);
        }}
        onMouseLeave={() => {
          navHoveredRef.current = false;
          setNavHovered(false);
        }}
      >
        <div
          ref={bgRef}
          className="pointer-events-none absolute inset-x-0 top-0 bg-cream"
          style={{
            transform: hasTransparentHero ? "scaleY(0)" : "scaleY(1)",
            transformOrigin: "top center",
          }}
          aria-hidden="true"
        >
          <GridLines lineClassName="bg-sky" />
        </div>

        <nav
          ref={navRef}
          className="relative flex min-h-(--grid-band) items-center justify-between px-(--grid-inset) select-none md:grid md:px-0"
          style={{
            gridTemplateColumns: "var(--grid-columns)",
            color: hasTransparentHero ? CREAM : BLACK,
          }}
        >
          <button
            type="button"
            aria-label="Open menu"
            data-nav-link
            onClick={() => setMenuOpen(true)}
            className="md:hidden"
          >
            <Menu style={iconStyle} strokeWidth={1.5} />
          </button>

          <ul
            className="hidden md:col-start-2 md:col-end-5 md:flex md:items-center md:gap-4 md:pl-(--grid-gutter)"
            style={{ fontSize: "var(--nav-text)" }}
          >
            {mainNav.map(({ label, href }) => (
              <li key={href}>
                <Link href={href} className={linkClassName} data-nav-link>
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href={routes.home}
            aria-label="Moment home"
            className="flex justify-center md:col-start-5 md:col-end-6"
          >
            <span ref={logoRef} className="inline-flex">
              <Image
                src="/brand/logonav.svg"
                alt="Moment"
                width={110}
                height={21}
                preload
                className="h-auto"
                style={{ width: "var(--nav-logo)" }}
              />
            </span>
          </Link>

          <div className="flex items-center gap-4 md:col-start-6 md:col-end-9 md:justify-end md:pr-(--grid-gutter)">
            <button
              type="button"
              aria-label="Search"
              data-nav-link
              className="hidden md:block"
              onClick={() => {
                setMenuOpen(false);
                setCartOpen(false);
                setSearchOpen(true);
              }}
            >
              <Search style={iconStyle} strokeWidth={1.5} />
            </button>

            <Link
              href={routes.account}
              aria-label="Account"
              data-nav-link
              className="hidden md:block"
            >
              <CircleUserRound style={iconStyle} strokeWidth={1.5} />
            </Link>

            <button
              type="button"
              aria-label={`Cart${cartCount ? ` (${cartCount})` : ""}`}
              data-nav-link
              onClick={() => {
                setMenuOpen(false);
                setSearchOpen(false);
                setCartOpen(true);
              }}
              className="relative"
            >
              <Handbag style={iconStyle} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="font-archivo-light absolute -top-1.5 -right-2 text-[10px] leading-none">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </nav>
      </div>

      <MobileNavMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartPanel open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}

const iconStyle = { width: "var(--nav-icon)", height: "var(--nav-icon)" };
