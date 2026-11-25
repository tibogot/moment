"use client";

import { useEffect } from "react";

const STORAGE_KEY = "moment-palette";

function applyPalette(sky: boolean) {
  if (sky) {
    document.documentElement.dataset.palette = "sky";
  } else {
    delete document.documentElement.dataset.palette;
  }

  try {
    localStorage.setItem(STORAGE_KEY, sky ? "sky" : "default");
  } catch {
    // Private browsing — the preview still works for the session.
  }
}

/**
 * Review tool: Shift + P swaps the page cream ↔ sky and the lines sky ↔ cream,
 * site-wide, like Shift + G shows the v2 grid (components/v2/GridOverlayToggle).
 *
 * The keyboard shortcut only: the switch that sat bottom-right was removed on
 * 25 November 2026 — it covered the pages being judged, and a client clicking
 * it by accident saw the whole site turn blue. The choice is still remembered
 * (localStorage, read before paint by PALETTE_GUARD in the layout), and the
 * layout only mounts this on the temporary address, never on the real domain.
 */
export function PaletteToggle() {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.shiftKey && event.key.toLowerCase() === "p") {
        applyPalette(document.documentElement.dataset.palette !== "sky");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null;
}
