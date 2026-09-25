"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { DEFAULT_LOCALE, localeFromPath } from "@/lib/i18n/config";
import {
  archivoLight,
  archivoLightItalic,
  ownersMedium,
  ownersNarrowBold,
} from "./fonts";
import "./globals.css";

/**
 * The last resort: the language layout itself failed, so there is no navbar,
 * no dictionary and no provider. It returns its own document, like
 * `global-not-found.tsx`.
 *
 * The copy is written in here rather than read from the dictionaries, which
 * would put all three into this bundle for three sentences each. The language
 * comes off the URL, which is the one thing still certain at this point.
 */
const COPY = {
  fr: {
    title: "Une erreur est survenue",
    lead: "Le site n'a pas pu se charger. C'est souvent passager — réessayez dans un instant.",
    retry: "Réessayer",
  },
  nl: {
    title: "Er is iets misgegaan",
    lead: "De site kon niet worden geladen. Meestal is dat van korte duur — probeer het zo meteen opnieuw.",
    retry: "Opnieuw proberen",
  },
  en: {
    title: "Something went wrong",
    lead: "The site could not load just now. It is usually a moment's hiccup — try again in a moment.",
    retry: "Try again",
  },
} as const;

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const locale = localeFromPath(usePathname() ?? "") ?? DEFAULT_LOCALE;
  const t = COPY[locale];

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html
      lang={locale}
      className={`${ownersMedium.variable} ${ownersNarrowBold.variable} ${archivoLight.variable} ${archivoLightItalic.variable} h-full antialiased`}
    >
      <body className="flex min-h-svh flex-col justify-center bg-cream px-[8vw] text-black">
        <title>{t.title}</title>
        <h1 className="font-owners-narrow-bold text-[11vw] leading-[0.9] uppercase md:text-[min(8vw,12svh)]">
          {t.title}
        </h1>
        <p className="font-archivo-light mt-8 max-w-[42ch] text-[18px] leading-normal">
          {t.lead}
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="font-owners-medium mt-8 self-start border border-sky bg-sky px-3 py-2.5 text-[11px] tracking-wide uppercase transition-colors duration-500 hover:bg-cream"
        >
          {t.retry}
        </button>
      </body>
    </html>
  );
}
