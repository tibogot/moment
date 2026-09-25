"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type=hidden])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function focusableIn(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) =>
      !element.closest("[inert]") &&
      !element.closest("[aria-hidden='true']") &&
      element.getClientRects().length > 0,
  );
}

type DialogFocusOptions = {
  /**
   * Move focus into the dialog when it opens. Off for a dialog that places
   * focus itself — the search panel puts it in the field once it has slid in.
   */
  autoFocus?: boolean;
  /** Called on Escape, for a dialog that has no Escape handling of its own. */
  onEscape?: () => void;
};

/**
 * What `aria-modal="true"` promises and the markup alone does not deliver.
 *
 * The cart, the mobile menu and the cookie preferences all declared themselves
 * modal, but a keyboard user who opened one stayed on the button behind it,
 * could Tab straight out into the page underneath, and was dropped at the top
 * of the document when it closed. So, while `open`:
 *
 *   - focus moves into the dialog;
 *   - Tab and Shift+Tab loop inside it;
 *   - on close, focus goes back to whatever opened it.
 *
 * The panels' own close paths blur first (see `blurFocusWithin`), so by the
 * time this restores, nothing inside is focused any more.
 */
export function useDialogFocus(
  containerRef: RefObject<HTMLElement | null>,
  open: boolean,
  { autoFocus = true, onEscape }: DialogFocusOptions = {},
) {
  const onEscapeRef = useRef(onEscape);

  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!open) return;
    const container = containerRef.current;
    if (!container) return;

    const opener =
      document.activeElement instanceof HTMLElement &&
      !container.contains(document.activeElement)
        ? document.activeElement
        : null;

    // A frame later: the panels come out of `inert` and `visibility: hidden`
    // in the same commit that opens them, and neither is focusable before.
    const frame = autoFocus
      ? requestAnimationFrame(() => {
          if (container.contains(document.activeElement)) return;
          const [first] = focusableIn(container);
          if (first) {
            first.focus({ preventScroll: true });
          } else {
            if (!container.hasAttribute("tabindex")) {
              container.setAttribute("tabindex", "-1");
            }
            container.focus({ preventScroll: true });
          }
        })
      : null;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onEscapeRef.current) {
        onEscapeRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusableIn(container);
      if (items.length === 0) {
        event.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (!container.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);

      // Only if focus has nowhere better to be: someone who clicked a link in
      // the menu has moved on, and pulling them back to the burger is wrong.
      const active = document.activeElement;
      const focusIsLost =
        !active || active === document.body || container.contains(active);
      if (opener?.isConnected && focusIsLost) {
        opener.focus({ preventScroll: true });
      }
    };
  }, [open, autoFocus, containerRef]);
}
