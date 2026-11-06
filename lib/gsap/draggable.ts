"use client";

import { gsap } from "gsap";
import type { Draggable as DraggableType } from "gsap/Draggable";

/**
 * Draggable (+ Inertia), loaded on demand.
 *
 * Same reason as Flip / SplitText: keep Club-weight plugins out of the layout
 * chunk. Callers that need drag wait on this once; until it resolves, the
 * carousel still renders and the arrow buttons can tween `x` without it.
 */
export type DraggableClass = typeof DraggableType;
export type DraggableInstance = InstanceType<DraggableClass>;

let draggablePromise: Promise<DraggableClass> | null = null;
let DraggableRef: DraggableClass | null = null;

export function loadDraggable(): Promise<DraggableClass> {
  draggablePromise ??= Promise.all([
    import("gsap/Draggable"),
    import("gsap/InertiaPlugin"),
  ]).then(([{ Draggable }, { InertiaPlugin }]) => {
    gsap.registerPlugin(Draggable, InertiaPlugin);
    DraggableRef = Draggable;
    return Draggable;
  });

  return draggablePromise;
}

/** Seconds since the last drag ended; Infinity when Draggable is not loaded. */
export function timeSinceDrag(): number {
  return DraggableRef?.timeSinceDrag() ?? Number.POSITIVE_INFINITY;
}
