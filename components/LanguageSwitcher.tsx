"use client";

import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { LOCALES, LOCALE_NAME, withLocale } from "@/lib/i18n/config";
import { rememberLocale } from "@/lib/i18n/remember-locale";
import { useLocale } from "@/components/LocaleProvider";
import { cn } from "@/lib/utils";

/**
 * FR / NL / EN, each linking to the same page in that language.
 *
 * Real links rather than a router push, so the switcher is crawlable and a
 * visitor can open a translation in a new tab. It uses `next/link` directly and
 * not `LocaleLink`: it is the one place that must target a language other than
 * the current one, which is exactly what that wrapper exists to prevent.
 *
 * `usePathname` gives the URL as the visitor sees it, prefix and all, so
 * `withLocale` swaps the language rather than stacking a second one on top.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const active = useLocale();
  const pathname = usePathname();

  return (
    <nav className={cn("flex items-center gap-2", className)} aria-label="Language">
      {LOCALES.map((locale) => {
        const current = locale === active;

        return (
          <NextLink
            key={locale}
            href={withLocale(pathname, locale)}
            hrefLang={locale}
            lang={locale}
            onClick={() => rememberLocale(locale)}
            aria-current={current ? "true" : undefined}
            title={LOCALE_NAME[locale]}
            // The navbar scrubs every [data-nav-link] from cream to black as
            // the hero scrolls past. Without it these keep the cream they
            // inherit over the hero and stay cream on the cream nav, which is
            // to say invisible.
            data-nav-link
            className={cn(
              "font-owners-medium text-[11px] uppercase tracking-wide transition-opacity",
              // 70 rather than 50: at 11px on the cream nav, half-opacity
              // black reads as disabled rather than as the language you are
              // not currently in.
              current ? "opacity-100" : "opacity-70 hover:opacity-100",
            )}
          >
            {locale}
          </NextLink>
        );
      })}
    </nav>
  );
}

/**
 * The same switcher for the mobile navbar, where three codes side by side would
 * crowd the row the logo is centred in.
 *
 * It shows the language you are in and opens the other two beneath it, so it
 * costs two characters of the bar instead of eleven. The panel is absolutely
 * positioned: opening it must not shift the logo off centre. Still real links,
 * for the reasons above.
 */
export function CompactLanguageSwitcher({ className }: { className?: string }) {
  const active = useLocale();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  const close = useCallback(() => setOpen(false), []);

  // Switching language changes the path, so this is also what closes the panel
  // after a choice — the link does not need its own handler. Adjusted during
  // render rather than in an effect: the panel then never paints over the page
  // it just navigated to.
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    // Pointerdown rather than click, so tapping the menu or cart button both
    // closes this and opens that, rather than being swallowed as a dismissal.
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && containerRef.current?.contains(target)) {
        return;
      }
      close();
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, close]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        data-nav-link
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Language: ${LOCALE_NAME[active]}`}
        onClick={() => setOpen((current) => !current)}
        className="font-owners-medium block uppercase tracking-wide"
        style={{ fontSize: "var(--nav-text)" }}
      >
        {active}
      </button>

      {open && (
        <nav
          aria-label="Language"
          // Right-aligned so the panel grows inwards and never past the edge of
          // the screen. Black is set rather than inherited: on the home page the
          // nav still carries the hero's cream for the first client render.
          className="absolute top-full right-0 z-10 mt-3 flex flex-col items-end gap-2.5 border border-sky bg-cream px-3 py-2.5 text-black"
        >
          {LOCALES.map((locale) => {
            const current = locale === active;

            return (
              <NextLink
                key={locale}
                href={withLocale(pathname, locale)}
                hrefLang={locale}
                lang={locale}
                onClick={() => rememberLocale(locale)}
                aria-current={current ? "true" : undefined}
                title={LOCALE_NAME[locale]}
                className={cn(
                  "font-owners-medium text-[12px] uppercase tracking-wide leading-none transition-opacity",
                  current ? "opacity-100" : "opacity-60 hover:opacity-100",
                )}
              >
                {locale}
              </NextLink>
            );
          })}
        </nav>
      )}
    </div>
  );
}
