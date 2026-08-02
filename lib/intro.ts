"use client";

/*
 * A single start signal for everything that plays as part of the first-paint
 * intro, rather than each component running off its own clock.
 *
 * The problem this solves is timing, not choreography. An intro animation that
 * begins the moment its effect runs begins *during* hydration — on the home
 * page that is React mounting the navbar's full product and collection lists,
 * the search panel, the cart, and every section, which on a mid-range phone is
 * a ~400ms block of main thread. A GSAP tween cannot render through that: a
 * 0.75s wipe measured 5 frames instead of ~45, which reads as a hard pop rather
 * than a reveal. Desktop has the headroom to hide it; mobile does not.
 *
 * So the intro waits for the main thread to actually be free before it starts.
 * Waiting on fonts as well means text is split and measured at its final
 * metrics, so nothing re-wraps underneath a running animation.
 *
 * Deliberately not used for scroll-triggered work — by the time the reader has
 * scrolled, hydration is long finished and the gate would only add latency.
 */

let ready = false;
let started = false;
const waiting = new Set<() => void>();

function flush() {
  if (ready) return;
  ready = true;
  // Releases the navbar's CSS drop, so the bar and the hero copy are one
  // sequence off one clock instead of two animations on unrelated timers.
  document.documentElement.classList.add("intro-ready");
  for (const cb of waiting) cb();
  waiting.clear();
}

/**
 * Arm the gate. Safe to call repeatedly. Must be called from something that
 * mounts on every route — the navbar's drop is held until it fires.
 */
export function startIntro() {
  if (started || typeof window === "undefined") return;
  started = true;

  const settle = () => {
    // requestIdleCallback fires when the main thread has actually drained; the
    // timeout is the backstop so a page that never goes idle still animates.
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(flush, { timeout: 800 });
    } else {
      requestAnimationFrame(() => requestAnimationFrame(flush));
    }
  };

  // Never let a font that fails to load strand the intro — settle either way.
  const fonts = document.fonts?.ready;
  if (fonts) {
    fonts.then(settle, settle);
    // Backstop for the promise itself, which can hang on a flaky network.
    window.setTimeout(settle, 1500);
  } else {
    settle();
  }
}

/**
 * Run `cb` once the intro is clear to start. Returns an unsubscribe for
 * components that unmount before then. Fires synchronously if already ready, so
 * a late-mounting component doesn't sit hidden.
 */
export function onIntroReady(cb: () => void): () => void {
  startIntro();

  if (ready) {
    cb();
    return () => {};
  }

  waiting.add(cb);
  return () => waiting.delete(cb);
}
