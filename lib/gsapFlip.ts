"use client";

import { gsap } from "gsap";
import type { Flip as FlipType } from "gsap/Flip";

/**
 * Flip, loaded on demand.
 *
 * A static import here would defeat the point. Flip is used by the footer's
 * hover highlight, the services image frame and the shop's grid/list toggle —
 * the footer is on every page, so bundling it statically put its 24 KB in a
 * chunk every route downloads and evaluates before first paint, for an effect
 * that needs a mouse to exist.
 *
 * Every caller degrades the same way: until the module resolves, the thing it
 * would have tweened is simply placed where it belongs. Nobody waits on it,
 * which is why this returns the module rather than gating render on it.
 */
let flipPromise: Promise<typeof FlipType> | null = null;

export function loadFlip(): Promise<typeof FlipType> {
  flipPromise ??= import("gsap/Flip").then(({ Flip }) => {
    gsap.registerPlugin(Flip);
    return Flip;
  });

  return flipPromise;
}

export type { FlipType };
