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
import { useGSAP } from "@gsap/react";
import { CircleUserRound, Handbag, Menu, Search } from "lucide-react";
import { useLenis } from "lenis/react";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";
import { CartPanel } from "@/components/CartPanel";
import { GridLines } from "@/components/GridLines";
import { MobileNavMenu } from "@/components/MobileNavMenu";
import { ShopNavMenu } from "@/components/ShopNavMenu";
import { SearchPanel } from "@/components/SearchPanel";
import {
  getCartSnapshot,
  getServerCartSnapshot,
  subscribeCart,
} from "@/lib/cart-store";
import { gsap, ScrollTrigger } from "@/lib/gsapConfig";
import { mainNav, routes } from "@/lib/routes";
import type { ShopifyCollection, ShopifyProduct } from "@/lib/shopify/queries";

const DURATION = 0.48;
const EASE = "power2.out";
const CLOSE_EASE = "power2.inOut";
const MENU_CONTENT_OFFSET = 6;
const CONTENT_REVEAL_AT = 0.22;

const TRANSPARENT_NAV_SELECTOR = "[data-transparent-nav]";
const TRANSPARENT_NAV_PATHS: ReadonlySet<string> = new Set([routes.home]);
const NAV_MOBILE_MQ = "(width < 75rem)";

function subscribeMobileNav(onStoreChange: () => void) {
  const mq = window.matchMedia(NAV_MOBILE_MQ);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getMobileNavSnapshot() {
  return window.matchMedia(NAV_MOBILE_MQ).matches;
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
  const lenis = useLenis();
  const hasTransparentHero = TRANSPARENT_NAV_PATHS.has(pathname);
  const isMobileNav = useSyncExternalStore(
    subscribeMobileNav,
    getMobileNavSnapshot,
    getMobileNavServerSnapshot,
  );
  const allowsTransparentNav = hasTransparentHero && !isMobileNav;

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [navHovered, setNavHovered] = useState(false);
  const [navSolid, setNavSolid] = useState(!allowsTransparentNav);
  const [prevPathname, setPrevPathname] = useState(pathname);

  const overlayOpen = cartOpen || searchOpen || menuOpen;
  const navExpanded = shopMenuOpen && !overlayOpen && !isMobileNav;

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
      setShopMenuOpen(false);
      setCartOpen(true);
    };

    window.addEventListener("cart-open", openCart);
    return () => window.removeEventListener("cart-open", openCart);
  }, []);

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

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setShopMenuOpen(false);
  }

  const isNavSolid = allowsTransparentNav
    ? navSolid || navHovered || overlayOpen || navExpanded
    : true;

  // Keep refs current before GSAP reads them — useEffect is too late for the
  // hover-leave path.
  useLayoutEffect(() => {
    hasTransparentHeroRef.current = allowsTransparentNav;
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

      if (!allowsTransparentNav) {
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

      if (allowsTransparentNav && !navHovered && !overlayOpen && !navExpanded) {
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

  const [shopNav, ...otherNav] = mainNav;

  const openShopMenu = () => {
    if (cartOpen || searchOpen || menuOpen || isMobileNav) return;
    setShopMenuOpen(true);
  };

  const closeShopMenu = () => {
    setShopMenuOpen(false);
  };

  const handleLogoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== routes.home) return;

    event.preventDefault();
    setMenuOpen(false);
    setCartOpen(false);
    setSearchOpen(false);
    setShopMenuOpen(false);

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
            setShopMenuOpen(false);
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
            onMouseEnter={closeShopMenu}
          >
            <button
              type="button"
              aria-label="Open menu"
              data-nav-link
              onClick={() => {
                setSearchOpen(false);
                setCartOpen(false);
                setShopMenuOpen(false);
                setMenuOpen(true);
              }}
            >
              <Menu style={iconStyle} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              aria-label="Search"
              data-nav-link
              onClick={() => {
                setMenuOpen(false);
                setCartOpen(false);
                setShopMenuOpen(false);
                setSearchOpen(true);
              }}
            >
              <Search style={iconStyle} strokeWidth={1.5} />
            </button>
          </div>

          <ul
            className="hidden nav:col-start-2 nav:col-end-5 nav:flex nav:items-center nav:gap-4 nav:pl-(--grid-gutter)"
            style={{ fontSize: "var(--nav-text)" }}
          >
            <li onMouseEnter={openShopMenu} onFocus={openShopMenu}>
              <button
                type="button"
                className={navLinkClassName}
                data-nav-link
                aria-expanded={shopMenuOpen}
                aria-haspopup="true"
                onClick={() => {
                  setMenuOpen(false);
                  setCartOpen(false);
                  setSearchOpen(false);
                  setShopMenuOpen(true);
                }}
              >
                {shopNav.label}
              </button>
            </li>
            {otherNav.map(({ label, href }) => (
              <li key={href} onMouseEnter={closeShopMenu}>
                <Link href={href} className={navLinkClassName} data-nav-link>
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href={routes.home}
            aria-label="Moment home"
            className="flex justify-center justify-self-center nav:col-start-5 nav:col-end-6"
            onMouseEnter={closeShopMenu}
            onClick={handleLogoClick}
          >
            <span ref={logoRef} data-nav-logo className="inline-flex">
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

          <div
            className="flex items-center gap-4 justify-self-end nav:col-start-6 nav:col-end-9 nav:justify-end nav:pr-(--grid-gutter)"
            onMouseEnter={closeShopMenu}
          >
            <button
              type="button"
              aria-label="Search"
              data-nav-link
              className="hidden nav:block"
              onClick={() => {
                setMenuOpen(false);
                setCartOpen(false);
                setShopMenuOpen(false);
                setSearchOpen(true);
              }}
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

            <button
              type="button"
              aria-label={`Cart${cartCount ? ` (${cartCount})` : ""}`}
              data-nav-link
              onClick={() => {
                setMenuOpen(false);
                setSearchOpen(false);
                setShopMenuOpen(false);
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

        <div
          ref={menuRef}
          className={`relative hidden h-0 overflow-hidden nav:grid nav:grid-cols-(--grid-columns) ${
            navExpanded ? "" : "pointer-events-none"
          }`}
          aria-hidden={!navExpanded}
        >
          <div ref={menuInnerRef} className="nav:col-span-full">
            <ShopNavMenu products={products} collections={collections} />
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
