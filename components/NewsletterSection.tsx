"use client";

import { useState, type FormEvent } from "react";
import { GridLines } from "@/components/GridLines";
import TextReveal from "@/components/TextReveal";
import { REVEAL_BLOCK_ON_SKY } from "@/lib/colors";
import { cn } from "@/lib/utils";

const MARGIN_COLUMNS = "var(--grid-margin) minmax(0, 1fr) var(--grid-margin)";

type NewsletterSectionProps = {
  copy: {
    headline: string;
    body: string;
    formLabel: string;
    placeholder: string;
    submit: string;
    success: string;
  };
  className?: string;
};

/**
 * Sky band before the footer: statement on the left, email join on the right.
 * Submit is local for now — wiring to a list provider comes later.
 */
export function NewsletterSection({ copy, className }: NewsletterSectionProps) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setDone(true);
  }

  return (
    <section className={cn("relative w-full bg-sky", className)}>
      <GridLines lineClassName="bg-cream/60" />

      <div
        className="relative grid"
        style={{ gridTemplateColumns: MARGIN_COLUMNS }}
      >
        <div className="col-start-2 grid items-center gap-[6svh] px-(--grid-gutter) py-[10svh] md:grid-cols-2 md:gap-(--grid-gutter) md:py-[12svh]">
          <div className="min-w-0 text-left">
            <TextReveal blockColor={REVEAL_BLOCK_ON_SKY} stagger={0.12}>
              <h2 className="font-owners-narrow-bold max-w-[14ch] text-[9vw] leading-[0.95] tracking-[-0.005em] wrap-break-word text-black uppercase md:text-[min(3.6vw,5.5svh)]">
                {copy.headline}
              </h2>
            </TextReveal>

            <TextReveal
              blockColor={REVEAL_BLOCK_ON_SKY}
              stagger={0.08}
              duration={0.6}
            >
              <p className="font-archivo-light mt-5 max-w-[42ch] text-(length:--body-text) leading-normal text-black md:mt-[3svh]">
                {copy.body}
              </p>
            </TextReveal>
          </div>

          <div className="min-w-0 self-center text-left md:justify-self-stretch">
            <p className="font-owners-medium text-[12px] uppercase tracking-wide">
              {copy.formLabel}
            </p>

            {done ? (
              <p className="font-archivo-light mt-4 text-(length:--body-text) leading-normal">
                {copy.success}
              </p>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mt-3 flex w-full items-stretch bg-cream p-1.5"
              >
                <label className="sr-only" htmlFor="newsletter-email">
                  {copy.placeholder}
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={copy.placeholder}
                  className="font-archivo-light min-w-0 flex-1 bg-transparent px-3 py-3 text-[15px] uppercase tracking-wide text-black outline-none placeholder:text-black/35 md:px-4 md:text-[16px]"
                />
                <button
                  type="submit"
                  className="font-owners-medium shrink-0 bg-sky px-4 py-3 text-[11px] uppercase tracking-wide text-black transition-opacity duration-500 hover:opacity-80 md:px-5"
                >
                  {copy.submit}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
