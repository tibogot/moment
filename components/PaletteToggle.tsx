"use client";

import { useSyncExternalStore } from "react";
import { useDictionary } from "@/components/LocaleProvider";
import { useIsClient } from "@/lib/hooks/useIsClient";

const STORAGE_KEY = "moment-palette";
type Palette = "default" | "sky";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("moment-palette-change", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("moment-palette-change", onStoreChange);
  };
}

function getSnapshot(): Palette {
  return document.documentElement.dataset.palette === "sky" ? "sky" : "default";
}

function getServerSnapshot(): Palette {
  return "default";
}

function applyPalette(palette: Palette) {
  if (palette === "sky") {
    document.documentElement.dataset.palette = "sky";
  } else {
    delete document.documentElement.dataset.palette;
  }

  try {
    localStorage.setItem(STORAGE_KEY, palette);
  } catch {
    // Private browsing — preview still works for the session.
  }

  window.dispatchEvent(new Event("moment-palette-change"));
}

/**
 * Dev-style preview: swap page cream ↔ sky and line sky ↔ cream site-wide.
 */
export function PaletteToggle() {
  const isClient = useIsClient();
  const palette = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const { palettePreview } = useDictionary().common;

  if (!isClient) return null;

  const isSky = palette === "sky";
  // Sky rule and knob on cream for the cream page; cream on sky once the sky
  // preview is on.
  const line = isSky ? CREAM : SKY;
  const fill = isSky ? SKY : CREAM;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isSky}
      aria-label={isSky ? palettePreview.toCream : palettePreview.toSky}
      onClick={() => applyPalette(isSky ? "default" : "sky")}
      // Square-cornered, with the site's rule weight for its border (the
      // default border width is --grid-line, 2px). The knob is centred by flex
      // rather than placed with offsets: 44 × 24 outside, 2px border + 2px
      // padding, so a 16px knob has 4px all round and 40 − 4 − 16 = 20px of
      // travel.
      //
      // Colours are inline, never bg-sky / border-cream: the sky preview
      // remaps those classes site-wide (globals.css, html[data-palette]), and
      // the remap lands a render before this button's own state does — the
      // two fought over the colours for a frame, which read as a jitter.
      className="fixed right-4 bottom-4 z-100 flex h-6 w-11 shrink-0 items-center border p-[2px] transition-[background-color,border-color] duration-300 ease-out"
      style={{ borderColor: line, backgroundColor: fill }}
    >
      {/* Only transform and colour animate, on the compositor-friendly
          property; translate3d keeps the knob on its own layer so the page
          repainting under it (the whole palette swaps) can't shake it. */}
      <span
        aria-hidden
        className="block size-4 transition-[transform,background-color] duration-300 ease-out will-change-transform"
        style={{
          backgroundColor: line,
          transform: `translate3d(${isSky ? 20 : 0}px, 0, 0)`,
        }}
      />
    </button>
  );
}

/** Literal brand colours — see the comment on the button for why. */
const SKY = "#a7c5ee";
const CREAM = "#f8f7f2";
