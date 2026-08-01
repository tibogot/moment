"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

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
  const palette = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isSky = palette === "sky";

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex shrink-0 items-center gap-3 rounded-full border border-black/10 bg-[#f8f7f2] px-4 py-2.5 shadow-sm">
      <span className="font-owners-medium shrink-0 text-[10px] uppercase tracking-wide text-black/70">
        Palette
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={isSky}
        aria-label={
          isSky
            ? "Using sky page preview — switch to cream"
            : "Using cream page — switch to sky preview"
        }
        onClick={() => applyPalette(isSky ? "default" : "sky")}
        className="relative h-6 w-11 shrink-0 rounded-full border border-black/15 bg-[#a7c5ee] transition-colors data-[on=true]:bg-[#f8f7f2]"
        data-on={isSky}
      >
        <span
          className="absolute top-0.5 left-0.5 block h-[18px] w-[18px] rounded-full bg-black transition-transform data-[on=true]:translate-x-5"
          data-on={isSky}
        />
      </button>
      <span className="font-archivo-light inline-block w-10 shrink-0 text-left text-[11px] text-black/80">
        {isSky ? "Sky" : "Cream"}
      </span>
    </div>
  );
}
