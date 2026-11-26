"use client";

import { createContext, useContext, type ReactNode } from "react";
import { aboutNav } from "@/lib/routes";

/**
 * Whether this language has a published article (27 November 2026).
 *
 * "Actualités" is ready but empty in French and Dutch: an empty section, or
 * one whose last post is months old, reads as a business that stopped. So the
 * link only shows where there is something behind it, and comes back by
 * itself with the first article — the page itself stays, at its address.
 */
const HasNewsContext = createContext(true);

export function AboutNavProvider({
  hasNews,
  children,
}: {
  hasNews: boolean;
  children: ReactNode;
}) {
  return (
    <HasNewsContext.Provider value={hasNews}>{children}</HasNewsContext.Provider>
  );
}

/** What sits behind "À propos", without News while this language has none. */
export function useAboutNav() {
  const hasNews = useContext(HasNewsContext);
  return hasNews ? aboutNav : aboutNav.filter(({ key }) => key !== "news");
}
