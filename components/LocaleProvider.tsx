"use client";

import { createContext, useContext } from "react";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";

/**
 * The active language, for the parts of the tree that cannot ask the router
 * for it.
 *
 * Server Components could read the locale from `params`, but only the ones that
 * are pages — a Footer six levels down would need it drilled through every
 * component in between. The alternative, reading it from a header the proxy
 * sets, would make every one of them dynamic and cost the site its static
 * prerendering.
 *
 * A client Provider sitting in the root layout works because the layout has the
 * param, and because server-rendered children passed through a client Provider
 * still read its context during SSR. So the static HTML for /nl carries Dutch
 * URLs, without a single component taking a locale prop.
 */
const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
