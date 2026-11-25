"use client";

import { useEffect, useState } from "react";

/**
 * Dev-only switch for the v2 grid overlay: Shift + G. Sets
 * <html data-v2-grid>, which shows every CellGrid's `.v2-debug` layer —
 * tinted columns and a column·row label in each cell.
 *
 * The keyboard shortcut only: the "Grid on / off" button that sat bottom-left
 * was removed on 25 November 2026 (it covered the pages being judged).
 * Inert in production builds.
 */
export function GridOverlayToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
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

  return null;
}
