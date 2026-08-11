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

export { gsap, ScrollTrigger };
