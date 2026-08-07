"use client";

import { usePathname } from "next/navigation";
import NextLink from "next/link";
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
