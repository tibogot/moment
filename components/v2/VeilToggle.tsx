"use client";

import { useEffect } from "react";

/**
 * Temporary (27 November 2026): `?veil=off` in the address hides the hero's
 * veil, to compare the photo with and without it. Remove once decided.
 */
export function VeilToggle() {
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("veil") === "off") {
      document.documentElement.dataset.heroVeil = "off";
    }
  }, []);
  return null;
}
