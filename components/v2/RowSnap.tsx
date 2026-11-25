"use client";

import {
  type CSSProperties,
  type ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

type RowSnapProps = {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

/**
 * A box whose height is rounded up to whole rows of the 16 / 12 / 4 grid,
 * so its edge falls on a row line whatever its content — the held panel of
 * the home's three beats (StoryCells), whose foot rule sat mid-cell and
 * showed a faint rule just under it (25 November 2026).
 *
 * The row height is read off a hidden probe one cell high (var(--s-cell-h)),
 * so it follows the grid at every width. Half a rule is added, so a rule
 * drawn along the box's foot is centred on the row line like the grid's.
 */
export function RowSnap({ className, style, children }: RowSnapProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const [height, setHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const content = contentRef.current;
    const probe = probeRef.current;
    if (!box || !content || !probe) return;

    const update = () => {
      const cell = probe.offsetHeight;
      if (!cell) return;
      const cs = getComputedStyle(box);
      const line = parseFloat(cs.borderBottomWidth) || 0;
      const needed =
        content.offsetHeight +
        parseFloat(cs.paddingTop) +
        parseFloat(cs.paddingBottom) +
        line;
      const rows = Math.max(1, Math.ceil((needed - 1) / cell));
      setHeight(rows * cell + line / 2);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(content);
    observer.observe(probe);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={boxRef}
      className={className}
      style={{ ...style, ...(height ? { height } : null) }}
    >
      <div ref={contentRef}>{children}</div>
      <span
        ref={probeRef}
        aria-hidden
        className="pointer-events-none invisible absolute top-0 left-0 w-0"
        style={{ height: "var(--s-cell-h)" }}
      />
    </div>
  );
}
