"use client";

import { useEffect, useState } from "react";

/**
 * Review switch for the v2 grid overlay: Shift + G. Sets
 * <html data-v2-grid>, which shows every CellGrid's `.v2-debug` layer —
 * tinted columns and a column·row label in each cell.
 *
 * The keyboard shortcut only: the "Grid on / off" button that sat bottom-left
 * was removed on 25 November 2026 (it covered the pages being judged).
 * Mounted once, in the layout, and only on the temporary address (like
 * PaletteToggle), so it works on every page built on the grid and never on
 * the real domain. Page-level copies were removed: two listeners on one page
 * would each keep their own state and fight over the attribute.
 */
export function GridOverlayToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
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

  return null;
}
