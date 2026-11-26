"use client";

import { createContext, useContext, type ReactNode } from "react";
import { SITE_DETAILS, type SiteDetails } from "@/lib/site";

/**
 * The company's facts for client components (footer, mobile menu, contact
 * form), as read on the server by `getSiteDetails()` — so a phone number
 * changed in the Studio's "Infos pratiques" reaches them too. Falls back to
 * the code's values outside the provider.
 */
const SiteDetailsContext = createContext<SiteDetails>(SITE_DETAILS);

export function SiteDetailsProvider({
  details,
  children,
}: {
  details: SiteDetails;
  children: ReactNode;
}) {
  return (
    <SiteDetailsContext.Provider value={details}>
      {children}
    </SiteDetailsContext.Provider>
  );
}

export function useSiteDetails() {
  return useContext(SiteDetailsContext);
}
