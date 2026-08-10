"use client";

import { createContext, useContext } from "react";
import { DEFAULT_SITE_DETAILS, type SiteDetails } from "@/lib/site";

/**
 * The company's own facts, for the parts of the tree that cannot fetch them.
 *
 * Same shape and same reasoning as `LocaleProvider`: the footer, the mobile menu
 * and the contact form all want the phone number and the social links, and none
 * of them is a page. Drilling props through every component in between would
 * cost more than the values are worth, and a client Provider in the root layout
 * works because server-rendered children passed through it still read its
 * context during SSR — so the static HTML carries the real details.
 *
 * Server Components take `SiteDetails` as an argument instead. Context is a
 * client-only mechanism, and the page that renders them has already awaited
 * `getSiteDetails`.
 */
const SiteDetailsContext = createContext<SiteDetails | null>(null);

export function SiteDetailsProvider({
  details,
  children,
}: {
  details: SiteDetails;
  children: React.ReactNode;
}) {
  return (
    <SiteDetailsContext.Provider value={details}>
      {children}
    </SiteDetailsContext.Provider>
  );
}

/**
 * Falls back to the built-in details rather than throwing outside a Provider.
 * Every one of these fields is already allowed to be empty and every consumer
 * already handles that, so a missing Provider degrades to a footer without a
 * phone number instead of a blank screen.
 */
export function useSiteDetails(): SiteDetails {
  return useContext(SiteDetailsContext) ?? DEFAULT_SITE_DETAILS;
}
