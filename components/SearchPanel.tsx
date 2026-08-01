"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsapConfig";
import { GridLines } from "@/components/GridLines";
import { routes } from "@/lib/routes";
import { useOverlayScrollLock } from "@/lib/useOverlayScrollLock";

type SearchPanelProps = {
  open: boolean;
  onClose: () => void;
};

const ANIM_DURATION = 0.75;
const OPEN_EASE = "power3.out";
const CLOSE_EASE = "power3.inOut";

export function SearchPanel({ open, onClose }: SearchPanelProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useOverlayScrollLock(open);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;

    gsap.set(panel, { yPercent: -100 });
    gsap.set(backdrop, { autoAlpha: 0 });
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;

    const ease = open ? OPEN_EASE : CLOSE_EASE;
    const tl = gsap.timeline({
      defaults: { duration: ANIM_DURATION, ease, overwrite: "auto" },
      onComplete: () => {
        if (open) inputRef.current?.focus();
      },
    });

    if (open) {
      tl.to(backdrop, { autoAlpha: 1, duration: ANIM_DURATION * 0.85 }, 0);
      tl.to(panel, { yPercent: 0 }, 0);
    } else {
      tl.to(panel, { yPercent: -100 }, 0);
      tl.to(backdrop, { autoAlpha: 0, duration: ANIM_DURATION * 0.7 }, 0.05);
    }

    return () => {
      tl.kill();
    };
  }, [open]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    onClose();
    if (!trimmed) return;
    router.push(`${routes.shop}?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <>
      <div
        ref={backdropRef}
        className="pointer-events-none fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden
        style={{ pointerEvents: open ? "auto" : "none" }}
      />

      <div
        ref={panelRef}
        className="fixed inset-x-0 top-0 z-50 bg-cream text-black"
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        aria-hidden={!open}
        inert={!open}
      >
        <GridLines lineClassName="bg-sky" />

        <div className="relative px-(--grid-inset) pt-[max(1.5rem,4svh)] pb-[max(2rem,5svh)]">
          <div className="mb-8 flex items-center justify-between">
            <p className="font-owners-medium text-[12px] uppercase tracking-wide">
              Search
            </p>
            <button
              type="button"
              onClick={onClose}
              className="font-owners-medium text-[11px] uppercase tracking-wide transition-opacity hover:opacity-60"
            >
              Close
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="site-search" className="sr-only">
              Search products
            </label>
            <input
              ref={inputRef}
              id="site-search"
              type="search"
              name="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="What are you looking for?"
              autoComplete="off"
              className="font-owners-narrow-bold w-full border-b border-sky bg-transparent pb-4 text-[8vw] leading-[1.05] text-black uppercase outline-none placeholder:text-black/25 md:text-[min(4.5vw,4.5rem)]"
            />
            <div className="mt-6 flex items-center justify-between gap-4">
              <p className="font-archivo-light text-[13px] text-black/60">
                Plates, salads, juices, and the coffee desk.
              </p>
              <button
                type="submit"
                className="font-owners-medium shrink-0 bg-black px-6 py-3 text-[12px] uppercase tracking-wide text-cream transition-opacity hover:opacity-80"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
