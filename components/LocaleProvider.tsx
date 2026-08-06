"use client";

import { createContext, useContext } from "react";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * The active language and its copy, for the parts of the tree that cannot ask
 * the router for either.
 *
 * Server Components could read the locale from `params` and load the dictionary
 * themselves, but only the ones that are pages — a Footer six levels down would
 * need both drilled through every component in between. The alternative,
 * reading the locale from a header the proxy sets, would make every one of them
 * dynamic and cost the site its static prerendering.
 *
 * A client Provider in the root layout works because the layout has the param,
 * and because server-rendered children passed through a client Provider still
 * read its context during SSR. So the static HTML for /nl carries Dutch URLs
 * and Dutch copy, without a single component taking a locale prop.
 *
 * Server Components still take their copy as a prop — context is a client-only
 * mechanism, and the page that renders them already has the dictionary.
 */
type LocaleContextValue = {
  locale: Locale;
  dictionary: Dictionary;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={{ locale, dictionary }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext)?.locale ?? DEFAULT_LOCALE;
}

/**
 * Throws rather than falling back to French when the Provider is missing. A
 * silent fallback would render a French navbar inside a Dutch page and look
 * like a translation gap rather than the wiring mistake it is.
 */
export function useDictionary(): Dictionary {
  const value = useContext(LocaleContext);
  if (!value) {
    throw new Error("useDictionary must be used inside <LocaleProvider>.");
  }

  return value.dictionary;
}
