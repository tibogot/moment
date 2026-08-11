"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/*
 * Core and ScrollTrigger only.
 *
 * This module is reached from the root layout — SmoothScroll and Navbar both
 * import it — so whatever it pulls in is parsed and evaluated on every route,
 * before anything paints. It used to register Flip and SplitText here too,
 * which meant 154 KB of GSAP in the layout chunk when the layout itself needs
 * about 114 KB of it. Flip in particular is used by three components, none of
 * which the layout renders.
 *
 * So the plugins that are not universal live beside this file and register
 * themselves on import:
 *
 *   lib/gsapFlip.ts       Flip       — ProductGrid, FooterGridCells, ServicesSection
 *   lib/gsapSplitText.ts  SplitText  — TextReveal
 *
 * Import from those rather than adding them back here.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/*
 * One refresh per frame, no matter how many callers ask.
 *
 * `ScrollTrigger.refresh()` re-measures every trigger against the whole
 * document, and it is a forced synchronous layout — the trace attributes 63ms
 * to a single call on the home page. Callers used to schedule their own:
 * SmoothScroll fired twice on principle (once on mount, once again on `load`),
 * and every TextReveal that armed wanted one too. They all land within a frame
 * or two of each other and only the last one's measurements survive, so the
 * rest are pure cost.
 *
 * Ask for a refresh whenever something may have changed height. The coalescing
 * is this module's problem, not the caller's.
 */
let refreshFrame: number | null = null;

export function scheduleScrollTriggerRefresh() {
  if (typeof window === "undefined") return;
  if (refreshFrame !== null) cancelAnimationFrame(refreshFrame);
  refreshFrame = requestAnimationFrame(() => {
    refreshFrame = null;
    ScrollTrigger.refresh();
  });
}

export { gsap, ScrollTrigger };
