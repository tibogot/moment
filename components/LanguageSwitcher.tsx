"use client";

import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { LOCALES, LOCALE_NAME } from "@/lib/i18n/config";
import { translatedPath } from "@/lib/routes";
import { rememberLocale } from "@/lib/i18n/remember-locale";
import { useLocale, useDictionary } from "@/components/LocaleProvider";
import { interpolate } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

/**
 * FR / NL / EN, each linking to the same page in that language — or to the
 * nearest page that exists, which is not always the same thing. See
 * `translatedPath`.
 *
 * Real links rather than a router push, so the switcher is crawlable and a
 * visitor can open a translation in a new tab. It uses `next/link` directly and
 * not `LocaleLink`: it is the one place that must target a language other than
 * the current one, which is exactly what that wrapper exists to prevent.
 *
 * `usePathname` gives the URL as the visitor sees it, prefix and all, so the
 * language is swapped rather than stacked a second time on top.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const dict = useDictionary();
  const active = useLocale();
  const pathname = usePathname();

  return (
    // The gap belongs to the caller: `cn` is a plain join, so a second gap
    // class here would not lose to one passed in. The mobile menu wants the
    // codes further apart than the desktop bar does.
    <nav className={cn("flex items-center", className)} aria-label={dict.language.label}>
      {LOCALES.map((locale) => {
        const current = locale === active;

        return (
          <NextLink
            key={locale}
            href={translatedPath(pathname, locale)}
            hrefLang={locale}
            lang={locale}
            onClick={() => rememberLocale(locale)}
            aria-current={current ? "true" : undefined}
            aria-label={
              current
                ? undefined
                : interpolate(dict.language.switchTo, {
                    language: LOCALE_NAME[locale],
                  })
            }
            title={LOCALE_NAME[locale]}
            // The navbar scrubs every [data-nav-link] from cream to black as
            // the hero scrolls past. Without it these keep the cream they
            // inherit over the hero and stay cream on the cream nav, which is
            // to say invisible.
            data-nav-link
            className={cn(
              "font-owners-medium flex min-h-11 items-center text-[11px] uppercase tracking-wide transition-opacity",
              // Tall enough to press with a thumb, then pulled back out of the
              // layout so the row it sits in is the height it always was. Only
              // the height grows: padding the sides too would butt the three
              // targets against each other, and a mis-tap that switches you to
              // the wrong language is worse than one that does nothing.
              "-my-3",
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
  const dict = useDictionary();
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
        aria-label={`${dict.language.label}: ${LOCALE_NAME[active]}`}
        onClick={() => setOpen((current) => !current)}
        // Two characters is a target about 16px wide, which a finger misses.
        // The box is padded out to the 44px minimum and the negative margin
        // takes the padding back out of the layout, so the row spacing looks
        // the way it did while the thing you actually press is finger-sized.
        className="font-owners-medium -mx-2 flex min-h-11 min-w-11 items-center justify-center uppercase tracking-wide"
        style={{ fontSize: "var(--nav-text)" }}
      >
        {active}
      </button>

      {open && (
        <nav
          aria-label={dict.language.label}
          // Right-aligned so the panel grows inwards and never past the edge of
          // the screen. Black is set rather than inherited: on the home page the
          // nav still carries the hero's cream for the first client render.
          className="absolute top-full right-0 z-10 mt-2 flex min-w-24 flex-col border border-sky bg-cream text-black"
        >
          {LOCALES.map((locale) => {
            const current = locale === active;

            return (
              <NextLink
                key={locale}
                href={translatedPath(pathname, locale)}
                hrefLang={locale}
                lang={locale}
                onClick={() => rememberLocale(locale)}
                aria-current={current ? "true" : undefined}
                aria-label={
                  current
                    ? undefined
                    : interpolate(dict.language.switchTo, {
                        language: LOCALE_NAME[locale],
                      })
                }
                title={LOCALE_NAME[locale]}
                // A whole 44px row each, divided by the same sky rule the rest
                // of the site uses, rather than three lines of text stacked
                // close enough that a thumb cannot tell them apart.
                className={cn(
                  "font-owners-medium flex min-h-11 items-center justify-end border-t border-sky px-4 text-[12px] uppercase tracking-wide transition-opacity first:border-t-0",
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
