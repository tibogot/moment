"use client";

import Image from "next/image";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useBarePathname, useDictionary } from "@/components/LocaleProvider";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useGSAP } from "@gsap/react";
import { CircleUserRound, Handbag, Menu, Search } from "lucide-react";
import { useLenis } from "lenis/react";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";
import { CartPanel } from "@/components/CartPanel";
import { GridLines } from "@/components/GridLines";
import { MobileNavMenu } from "@/components/MobileNavMenu";
import { AboutNavMenu } from "@/components/AboutNavMenu";
import { ShopNavMenu } from "@/components/ShopNavMenu";
import { SearchPanel } from "@/components/SearchPanel";
import {
  getCartSnapshot,
  getServerCartSnapshot,
  subscribeCart,
} from "@/lib/cart-store";
import { gsap, ScrollTrigger } from "@/lib/gsapConfig";
import { startIntro } from "@/lib/intro";
import { blurFocusWithin, blurOpenOverlayFocus } from "@/lib/overlayFocus";
import { mainNav, routes, type NavMenuKey } from "@/lib/routes";
import type { ShopifyCollection, ShopifyProduct } from "@/lib/shopify/queries";

const DURATION = 0.48;
const EASE = "power2.out";
const CLOSE_EASE = "power2.inOut";
const MENU_CONTENT_OFFSET = 6;
const CONTENT_REVEAL_AT = 0.22;

const TRANSPARENT_NAV_SELECTOR = "[data-transparent-nav]";
const TRANSPARENT_NAV_PATHS: ReadonlySet<string> = new Set([routes.home]);
/** Must match --breakpoint-nav in app/globals.css. */
const NAV_MOBILE_MQ = "(width < 79.375rem)";

function subscribeMobileNav(onStoreChange: () => void) {
  const mq = window.matchMedia(NAV_MOBILE_MQ);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getMobileNavSnapshot() {
  return window.matchMedia(NAV_MOBILE_MQ).matches;
}

/*
 * useSyncExternalStore hands back the server snapshot (desktop) for the whole
 * hydration render, so anything keyed off `isMobileNav` is wrong for the first
 * commit. Effects run on the client, where the media query can just be asked
 * directly — that keeps mobile from building a ScrollTrigger and a 0.48s
 * colour/filter timeline it is about to discard, in the same frames the hero
 * reveal is trying to animate.
 */
function allowsTransparentNavNow(hasTransparentHero: boolean) {
  if (!hasTransparentHero || typeof window === "undefined") return false;
  return !window.matchMedia(NAV_MOBILE_MQ).matches;
}

function getMobileNavServerSnapshot() {
  return false;
}

// The nav turns cream almost immediately: the wipe completes over the first
// NAV_SCROLL_REVEAL_DISTANCE pixels of scroll rather than waiting for the hero
// to leave the viewport.
const NAV_SCROLL_REVEAL_DISTANCE = 120;

const CREAM = "#f8f7f2";
const BLACK = "#000000";

type NavbarProps = {
  products?: ShopifyProduct[];
  collections?: ShopifyCollection[];
};

type NavAppearance = {
  solid: boolean;
  expanded: boolean;
  immediate?: boolean;
};

export function Navbar({ products = [], collections = [] }: NavbarProps) {
  const pathname = usePathname();
  // Compared without the language segment: usePathname returns "/fr", and the
  // routes these are checked against have no locale on them.
  const barePathname = useBarePathname();
  const lenis = useLenis();
  const hasTransparentHero = TRANSPARENT_NAV_PATHS.has(barePathname);
  const isMobileNav = useSyncExternalStore(
    subscribeMobileNav,
    getMobileNavSnapshot,
    getMobileNavServerSnapshot,
  );
  const allowsTransparentNav = hasTransparentHero && !isMobileNav;

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // Which nav panel is open, if any. Was a shop-only boolean until "About"
  // grew children too.
  const [openNavMenu, setOpenNavMenu] = useState<NavMenuKey | null>(null);
  const [navHovered, setNavHovered] = useState(false);
  const [navSolid, setNavSolid] = useState(!allowsTransparentNav);
  const [prevPathname, setPrevPathname] = useState(pathname);

  const overlayOpen = cartOpen || searchOpen || menuOpen;
  const navExpanded = openNavMenu !== null && !overlayOpen && !isMobileNav;

  // Both only ever touch refs and setState, so neither has anything to depend
  // on. Stable identities are what let the effects below list them honestly
  // instead of silencing the exhaustive-deps rule.
  const releaseShopMenuFocus = useCallback(() => {
    blurFocusWithin(menuRef.current);
  }, []);

  const withOverlayFocusRelease = useCallback(
    (update: () => void) => {
      blurOpenOverlayFocus();
      releaseShopMenuFocus();
      update();
    },
    [releaseShopMenuFocus],
  );

  const cart = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getServerCartSnapshot,
  );
  const cartCount = cart?.totalQuantity ?? 0;

  // The navbar's own drop is gated on this, and it mounts on every route, so
  // this is what guarantees the gate always opens.
  useEffect(() => {
    startIntro();
  }, []);

  // AddToCartButton opens the panel after a successful add.
  useEffect(() => {
    const openCart = () => {
      withOverlayFocusRelease(() => {
        setMenuOpen(false);
        setSearchOpen(false);
        setOpenNavMenu(null);
        setCartOpen(true);
      });
    };

    window.addEventListener("cart-open", openCart);
    return () => window.removeEventListener("cart-open", openCart);
  }, [withOverlayFocusRelease]);

  const headerRef = useRef<HTMLElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuInnerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLSpanElement>(null);
  const navTweenRef = useRef<gsap.core.Timeline | null>(null);
  const menuMeasureAttemptsRef = useRef(0);
  const scrollNavTriggerRef = useRef<ScrollTriggerType | null>(null);
  const hasTransparentHeroRef = useRef(allowsTransparentNav);
  const navHoveredRef = useRef(navHovered);
  const navExpandedRef = useRef(navExpanded);
  const overlayOpenRef = useRef(overlayOpen);

  // Closing the panel as the route changes is state, and adjusting state during
  // render is the point of this branch — it lands before paint, so the old menu
  // never flashes over the new page.
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpenNavMenu(null);
  }

  // Releasing the focus it held is *not* state: it reaches into the DOM, which
  // render must not do. It waits for the commit instead, which is soon enough —
  // the panel it blurs is on its way out either way.
  useEffect(() => {
    releaseShopMenuFocus();
  }, [pathname, releaseShopMenuFocus]);

  const isNavSolid = allowsTransparentNav
    ? navSolid || navHovered || overlayOpen || navExpanded
    : true;

  // Keep refs current before GSAP reads them — useEffect is too late for the
  // hover-leave path.
  useLayoutEffect(() => {
    hasTransparentHeroRef.current = allowsTransparentNavNow(hasTransparentHero);
    navHoveredRef.current = navHovered;
    navExpandedRef.current = navExpanded;
    overlayOpenRef.current = overlayOpen;
  });

  const shouldScrollControlNav = () =>
    hasTransparentHeroRef.current &&
    !navHoveredRef.current &&
    !overlayOpenRef.current &&
    !navExpandedRef.current;

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

  const runNavAnimation = ({
    solid,
    expanded,
    immediate = false,
  }: NavAppearance) => {
    const nav = navRef.current;
    const bg = bgRef.current;
    const menu = menuRef.current;
    const menuInner = menuInnerRef.current;
    const logo = logoRef.current;
    if (!nav || !bg || !logo) return;

    navTweenRef.current?.kill();
    if (menu) gsap.killTweensOf(menu);
    if (menuInner) gsap.killTweensOf(menuInner);
    gsap.killTweensOf(bg);

    const links = nav.querySelectorAll<HTMLElement>("[data-nav-link]");
    const navHeight = nav.offsetHeight;
    const menuHeight =
      expanded && menuInner
        ? Math.max(menuInner.offsetHeight, menuInner.scrollHeight)
        : 0;
    const duration = immediate ? 0 : DURATION;
    const colorAt = duration * 0.52;

    gsap.set(bg, { transformOrigin: "top center" });

    const tl = gsap.timeline({
      defaults: { duration, ease: EASE, overwrite: "auto" },
    });
    navTweenRef.current = tl;

    const bgScaleY = Number(gsap.getProperty(bg, "scaleY") ?? 0);
    const bgVisible = bgScaleY > 0.01;
    const menuCurrentH = menu
      ? Number(gsap.getProperty(menu, "height") ?? 0)
      : 0;
    const menuIsOpen = menuCurrentH > 1;

    if (solid) {
      tl.set(links, { color: BLACK }, 0);
      tl.set(logo, { filter: "brightness(0)" }, 0);

      const showMenu =
        expanded && menu != null && menuInner != null && menuHeight > 0;

      if (showMenu) {
        if (!menuIsOpen) {
          tl.set(menuInner, { autoAlpha: 0, y: MENU_CONTENT_OFFSET }, 0);
        }

        tl.to(
          bg,
          {
            scaleY: 1,
            height: navHeight + menuHeight,
            duration: duration * (bgVisible ? 1 : 1.1),
          },
          0,
        );
        tl.to(menu, { height: menuHeight, duration: duration * 1.1 }, 0);
        tl.to(
          menuInner,
          {
            autoAlpha: 1,
            y: 0,
            duration: duration * 0.7,
          },
          duration * CONTENT_REVEAL_AT,
        );
      } else if (menuIsOpen && menu && menuInner) {
        tl.to(
          menuInner,
          {
            autoAlpha: 0,
            y: MENU_CONTENT_OFFSET,
            duration: duration * 0.28,
            ease: "power1.out",
          },
          0,
        );
        tl.to(menu, { height: 0, ease: CLOSE_EASE }, 0);
        tl.to(bg, { scaleY: 1, height: navHeight, ease: CLOSE_EASE }, 0);
      } else {
        if (menu) tl.set(menu, { height: 0 });
        if (menuInner)
          tl.set(menuInner, { autoAlpha: 0, y: MENU_CONTENT_OFFSET });
        tl.to(
          bg,
          { scaleY: 1, height: navHeight, duration: duration * 0.75 },
          0,
        );
      }
    } else {
      if (menuIsOpen && menu && menuInner) {
        tl.to(
          menuInner,
          {
            autoAlpha: 0,
            y: MENU_CONTENT_OFFSET,
            duration: duration * 0.28,
            ease: "power1.out",
          },
          0,
        );
        tl.to(menu, { height: 0, ease: CLOSE_EASE }, 0);
        tl.to(bg, { scaleY: 0, height: navHeight, ease: CLOSE_EASE }, 0);
      } else {
        if (menu) tl.set(menu, { height: 0 });
        if (menuInner)
          tl.set(menuInner, { autoAlpha: 0, y: MENU_CONTENT_OFFSET });
        tl.to(bg, { scaleY: 0, height: navHeight, ease: CLOSE_EASE }, 0);
      }
      tl.to(links, { color: CREAM, duration: duration * 0.35 }, colorAt);
      tl.to(
        logo,
        { filter: "brightness(1)", duration: duration * 0.35 },
        colorAt,
      );
    }

    if (immediate) tl.progress(1, false);

    if (
      expanded &&
      menuInner &&
      menuHeight === 0 &&
      menuMeasureAttemptsRef.current < 2
    ) {
      menuMeasureAttemptsRef.current += 1;
      requestAnimationFrame(() => {
        runNavAnimation({ solid, expanded, immediate });
      });
      return;
    }

    if (menuHeight > 0) {
      menuMeasureAttemptsRef.current = 0;
    }
  };

  const runNavAnimationRef = useRef(runNavAnimation);
  useLayoutEffect(() => {
    runNavAnimationRef.current = runNavAnimation;
  });

  useLayoutEffect(() => {
    menuMeasureAttemptsRef.current = 0;
  }, [pathname]);

  // Scrub the nav from transparent to cream across the bottom of the hero.
  useGSAP(
    () => {
      const bg = bgRef.current;
      const nav = navRef.current;
      if (!bg || !nav) return;

      // Not `allowsTransparentNav` — that is still the desktop server snapshot
      // on a mobile hydration pass.
      if (!allowsTransparentNavNow(hasTransparentHero)) {
        runNavAnimation({ solid: true, expanded: false, immediate: true });
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
        runNavAnimation({ solid: true, expanded: false, immediate: true });
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
    { scope: headerRef, dependencies: [allowsTransparentNav, pathname] },
  );

  // Park the shop submenu off-screen before its first open.
  useGSAP(
    () => {
      const menu = menuRef.current;
      const menuInner = menuInnerRef.current;
      if (!menu || !menuInner) return;

      gsap.set(menu, { height: 0, overflow: "hidden" });
      gsap.set(menuInner, { autoAlpha: 0, y: MENU_CONTENT_OFFSET });
    },
    { scope: headerRef },
  );

  // Hover over the hero forces the cream state; leaving hands control back to
  // the scrub.
  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const allowsTransparent = allowsTransparentNavNow(hasTransparentHero);

      if (!allowsTransparent) {
        runNavAnimation({
          solid: true,
          expanded: navExpanded,
          immediate: reduceMotion || overlayOpen,
        });
        return;
      }

      if (!navHovered && !overlayOpen && !navExpanded) {
        const progress = scrollNavTriggerRef.current?.progress ?? 0;

        if (progress <= 0.01) {
          runNavAnimation({
            solid: false,
            expanded: false,
            immediate: reduceMotion,
          });
        } else if (progress >= 0.99) {
          runNavAnimation({
            solid: true,
            expanded: false,
            immediate: reduceMotion,
          });
        } else {
          syncScrollNavAppearance();
        }
        return;
      }

      runNavAnimation({
        solid: isNavSolid,
        expanded: navExpanded,
        immediate: reduceMotion || overlayOpen,
      });
    },
    {
      scope: headerRef,
      dependencies: [
        navHovered,
        allowsTransparentNav,
        isNavSolid,
        navExpanded,
        overlayOpen,
        collections.length,
      ],
    },
  );

  useGSAP(
    () => {
      const menuInner = menuInnerRef.current;
      const menu = menuRef.current;
      const bg = bgRef.current;
      const nav = navRef.current;
      if (!menuInner || !menu || !bg || !nav || !navExpanded) return;

      const observer = new ResizeObserver(() => {
        if (!navExpandedRef.current) return;

        const navHeight = nav.offsetHeight;
        const menuHeight = menuInner.offsetHeight;

        gsap.to(menu, {
          height: menuHeight,
          duration: DURATION * 0.35,
          ease: EASE,
          overwrite: "auto",
        });
        gsap.to(bg, {
          height: navHeight + menuHeight,
          duration: DURATION * 0.35,
          ease: EASE,
          overwrite: "auto",
        });
      });

      observer.observe(menuInner);
      return () => observer.disconnect();
    },
    {
      scope: headerRef,
      dependencies: [navExpanded],
    },
  );

  const navLinkClassName =
    "animated-underline font-owners-medium uppercase tracking-wide";

  const dict = useDictionary();

  const openNavMenuFor = (key: NavMenuKey) => () => {
    if (cartOpen || searchOpen || menuOpen || isMobileNav) return;
    setOpenNavMenu(key);
  };

  const closeNavMenu = () => {
    releaseShopMenuFocus();
    setOpenNavMenu(null);
  };

  const handleLogoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (barePathname !== routes.home) return;

    event.preventDefault();
    withOverlayFocusRelease(() => {
      setMenuOpen(false);
      setCartOpen(false);
      setSearchOpen(false);
      setOpenNavMenu(null);
    });

    if (lenis) {
      lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useLayoutEffect(() => {
    if (!overlayOpen) return;

    menuMeasureAttemptsRef.current = 0;
    runNavAnimationRef.current({
      solid: isNavSolid,
      expanded: false,
      immediate: true,
    });
  }, [overlayOpen, isNavSolid]);

  useLayoutEffect(() => {
    if (navExpanded) return;

    const menu = menuRef.current;
    const bg = bgRef.current;
    const nav = navRef.current;
    if (!menu || !bg || !nav) return;

    const menuCurrentH = Number(gsap.getProperty(menu, "height") ?? 0);
    const navHeight = nav.offsetHeight;
    const bgHeight = Number(gsap.getProperty(bg, "height") ?? 0);

    if (menuCurrentH <= 1 && bgHeight <= navHeight + 1) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    runNavAnimationRef.current({
      solid: isNavSolid,
      expanded: false,
      immediate: reduceMotion || overlayOpen,
    });
  }, [navExpanded, isNavSolid, overlayOpen]);

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-40"
      {...(hasTransparentHero ? { "data-nav-transparent": "" } : {})}
    >
      <div
        ref={shellRef}
        data-nav-intro
        data-nav-shell
        className="relative"
        onMouseEnter={() => {
          navHoveredRef.current = true;
          setNavHovered(true);
        }}
        onMouseLeave={() => {
          navHoveredRef.current = false;
          setNavHovered(false);
          if (!cartOpen && !searchOpen) {
            closeNavMenu();
          }
        }}
      >
        <div
          ref={bgRef}
          data-nav-bg
          className="pointer-events-none absolute inset-x-0 top-0 border-b border-sky bg-cream"
          style={{
            transform: allowsTransparentNav ? "scaleY(0)" : "scaleY(1)",
            transformOrigin: "top center",
          }}
          aria-hidden="true"
        >
          <GridLines lineClassName="bg-sky" />
        </div>

        <nav
          ref={navRef}
          className="relative grid min-h-(--grid-band) grid-cols-3 items-center px-(--grid-inset) select-none nav:grid-cols-(--grid-columns) nav:px-0"
          style={{
            color: allowsTransparentNav ? CREAM : BLACK,
          }}
        >
          {/* Mobile: menu + search sit together on the left. */}
          <div
            className="flex items-center gap-3.5 justify-self-start nav:hidden"
            onMouseEnter={closeNavMenu}
          >
            <button
              type="button"
              aria-label="Open menu"
              data-nav-link
              onClick={() =>
                withOverlayFocusRelease(() => {
                  setSearchOpen(false);
                  setCartOpen(false);
                  setOpenNavMenu(null);
                  setMenuOpen(true);
                })
              }
            >
              <Menu style={iconStyle} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              aria-label="Search"
              data-nav-link
              onClick={() =>
                withOverlayFocusRelease(() => {
                  setMenuOpen(false);
                  setCartOpen(false);
                  setOpenNavMenu(null);
                  setSearchOpen(true);
                })
              }
            >
              <Search style={iconStyle} strokeWidth={1.5} />
            </button>
          </div>

          <ul
            // nowrap stays: without it a label that outgrows the row folds
            // onto two lines inside a box that still measures as fitting,
            // which hides the problem instead of showing it.
            className="hidden min-w-0 whitespace-nowrap nav:col-start-2 nav:col-end-5 nav:flex nav:items-center nav:gap-3 nav:pl-(--grid-gutter)"
            style={{ fontSize: "var(--nav-text)" }}
          >
            {mainNav.map((item) =>
              "menu" in item ? (
                <li
                  key={item.key}
                  onMouseEnter={openNavMenuFor(item.menu)}
                  onFocus={openNavMenuFor(item.menu)}
                >
                  <button
                    type="button"
                    className={navLinkClassName}
                    data-nav-link
                    aria-expanded={openNavMenu === item.menu}
                    aria-haspopup="true"
                    onClick={() =>
                      withOverlayFocusRelease(() => {
                        setMenuOpen(false);
                        setCartOpen(false);
                        setSearchOpen(false);
                        setOpenNavMenu(item.menu);
                      })
                    }
                  >
                    {dict.nav[item.key]}
                  </button>
                </li>
              ) : (
                <li key={item.key} onMouseEnter={closeNavMenu}>
                  <Link
                    href={item.href}
                    className={navLinkClassName}
                    data-nav-link
                  >
                    {dict.nav[item.key]}
                  </Link>
                </li>
              ),
            )}
          </ul>

          {/* The -1.5px is optical, not layout. The links are uppercase, so
              their line box reserves descender space no glyph fills and the
              caps ride above its centre; the logo is a tight-cropped SVG whose
              box is its ink, so it centres true and reads low beside them.
              Scoped to nav: because below that the links are hidden and the
              logo sits against the icons, which are square and need no nudge.
              Lives on the Link, not the span — GSAP owns the span's filter. */}
          <Link
            href={routes.home}
            aria-label="Moment home"
            className="flex justify-center justify-self-center nav:col-start-5 nav:col-end-6 nav:translate-y-[-1.5px]"
            onMouseEnter={closeNavMenu}
            onClick={handleLogoClick}
          >
            <span ref={logoRef} data-nav-logo className="inline-flex">
              <Image
                src="/brand/Moment-Logotype.svg"
                alt="Moment"
                width={1437}
                height={220}
                preload
                className="h-auto"
                style={{ width: "var(--nav-logo)" }}
              />
            </span>
          </Link>

          <div
            className="flex items-center gap-4 justify-self-end nav:col-start-6 nav:col-end-9 nav:justify-end nav:pr-(--grid-gutter)"
            onMouseEnter={closeNavMenu}
          >
            <button
              type="button"
              aria-label="Search"
              data-nav-link
              className="hidden nav:block"
              onClick={() =>
                withOverlayFocusRelease(() => {
                  setMenuOpen(false);
                  setCartOpen(false);
                  setOpenNavMenu(null);
                  setSearchOpen(true);
                })
              }
            >
              <Search style={iconStyle} strokeWidth={1.5} />
            </button>

            <Link
              href={routes.account}
              aria-label="Account"
              data-nav-link
              className="hidden nav:block"
            >
              <CircleUserRound style={iconStyle} strokeWidth={1.5} />
            </Link>

            <LanguageSwitcher className="hidden nav:flex" />

            <button
              type="button"
              aria-label={`Cart${cartCount ? ` (${cartCount})` : ""}`}
              data-nav-link
              onClick={() =>
                withOverlayFocusRelease(() => {
                  setMenuOpen(false);
                  setSearchOpen(false);
                  setOpenNavMenu(null);
                  setCartOpen(true);
                })
              }
              className="relative"
            >
              <Handbag style={iconStyle} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="font-archivo-light absolute -top-1.5 right-0 text-[10px] leading-none nav:-right-2">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </nav>

        <div
          ref={menuRef}
          className={`relative hidden h-0 overflow-hidden nav:grid nav:grid-cols-(--grid-columns) ${
            navExpanded ? "" : "pointer-events-none"
          }`}
          aria-hidden={!navExpanded}
          inert={!navExpanded}
        >
          <div ref={menuInnerRef} className="nav:col-span-full">
            {openNavMenu === "about" ? (
              <AboutNavMenu onNavigate={releaseShopMenuFocus} />
            ) : (
              <ShopNavMenu
                products={products}
                collections={collections}
                onNavigate={releaseShopMenuFocus}
              />
            )}
          </div>
        </div>
      </div>

      <MobileNavMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        collections={collections}
      />
      <SearchPanel
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        products={products}
      />
      <CartPanel open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}

const iconStyle = { width: "var(--nav-icon)", height: "var(--nav-icon)" };
