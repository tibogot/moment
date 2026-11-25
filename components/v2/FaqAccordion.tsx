"use client";

import { ChevronDown } from "lucide-react";
import { type ReactNode, useId, useState } from "react";

type FaqAccordionProps = {
  /**
   * A string answer is set as a paragraph; anything else (the rich panel of
   * "Commander & se faire livrer": blocks, live figures, an image) is
   * rendered as given.
   */
  entries: { question: string; answer: ReactNode }[];
  /** Entries open on arrival, by index. */
  defaultOpen?: number[];
};

/**
 * The questions on /faq, as an accordion: one row per question, sky rules
 * between them, the answer opening under it. Several can be open at once —
 * someone comparing two answers should not lose the first.
 *
 * The answer animates through grid rows (0fr → 1fr), so it opens to its own
 * height whatever the length, with no max-height to guess.
 */
export function FaqAccordion({ entries, defaultOpen = [] }: FaqAccordionProps) {
  const [open, setOpen] = useState<Set<number>>(() => new Set(defaultOpen));
  const baseId = useId();

  const toggle = (index: number) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  return (
    <ul className="border-t border-sky">
      {entries.map(({ question, answer }, index) => {
        const isOpen = open.has(index);
        const panelId = `${baseId}-${index}`;
        return (
          <li key={question} className="border-b border-sky">
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
                className="group flex w-full items-center justify-between gap-6 py-[2.4svh] text-left"
              >
                <span className="font-owners-narrow-bold text-[5.5vw] leading-[0.95] tracking-[-0.005em] uppercase md:text-[clamp(18px,1.7vw,28px)]">
                  {question}
                </span>
                <ChevronDown
                  aria-hidden
                  strokeWidth={2}
                  className={`size-5 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              className="grid transition-[grid-template-rows] duration-300 ease-in-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden" inert={!isOpen}>
                {typeof answer === "string" ? (
                  // Three quarters of the grid from tablet up, ending where step
                  // 03 ends: (row + 2 paddings) is the full grid, the row being
                  // inset by a cell's padding each side.
                  <p className="font-archivo-light pb-[3svh] md:max-w-[calc((100%+2*var(--v2-pad))*0.75-2*var(--v2-pad))] text-(length:--body-text) leading-normal text-black">
                    {answer}
                  </p>
                ) : (
                  <div className="pb-[5svh]">{answer}</div>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
