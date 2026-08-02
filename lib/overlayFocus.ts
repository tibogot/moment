/**
 * Release focus from inside an overlay before `aria-hidden` is applied.
 * Browsers warn (and AT users suffer) when a focused node stays inside an
 * aria-hidden subtree — blur synchronously in the close path, before `open`
 * flips false.
 */
export function blurFocusWithin(container: HTMLElement | null | undefined) {
  if (!container) return;

  const active = document.activeElement;
  if (active instanceof HTMLElement && container.contains(active)) {
    active.blur();
  }
}

/** Blur when swapping overlays from the navbar without going through a panel close handler. */
export function blurOpenOverlayFocus() {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement)) return;

  if (active.closest("[data-overlay-panel]")) {
    active.blur();
  }
}
