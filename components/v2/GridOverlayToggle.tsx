"use client";

import { useEffect, useState } from "react";

/**
 * Dev-only switch for the v2 grid overlay: Shift + G, or the button bottom-
 * left. Sets <html data-v2-grid>, which shows every CellGrid's `.v2-debug`
 * layer — tinted columns and a column·row label in each cell.
 *
 * Renders nothing in production builds.
 */
export function GridOverlayToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable]")) return;
      if (event.shiftKey && event.key.toLowerCase() === "g") {
        setOn((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (on) root.setAttribute("data-v2-grid", "");
    else root.removeAttribute("data-v2-grid");
    return () => root.removeAttribute("data-v2-grid");
  }, [on]);

  if (process.env.NODE_ENV === "production") return null;

  return (
    <button
      type="button"
      onClick={() => setOn((value) => !value)}
      // The site's button colours (sky rule; sky fill when on), so the
      // palette preview recolours it with everything else.
      //
      // Lined up with the palette switch on the right: same 24px height, same
      // 16px from the bottom, so the two sit on one line. On the left it
      // starts where the navbar's text does (--grid-inset), but never closer
      // than 4.5rem to the edge, where Next's dev badge sits.
      className={`font-owners-medium fixed bottom-4 z-20 flex h-6 items-center border border-sky px-2.5 text-[11px] leading-none text-black uppercase tracking-wide transition-colors duration-300 ${on ? "bg-sky" : "bg-cream"}`}
      style={{ left: "max(4.5rem, var(--grid-inset))" }}
      aria-pressed={on}
    >
      Grid {on ? "on" : "off"} · ⇧G
    </button>
  );
}
