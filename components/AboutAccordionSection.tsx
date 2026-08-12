"use client";

import Image from "next/image";
import { useState } from "react";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { GridSection } from "@/components/GridSection";
import TextReveal from "@/components/TextReveal";
import { REVEAL_BLOCK } from "@/lib/colors";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type AboutAccordionSectionProps = {
  copy: Dictionary["about"]["accordion"];
  src?: string;
  alt?: string;
  className?: string;
};

/**
 * Statement + CTA above a two-column band: photograph on the left, a simple
 * single-open accordion on the right. The page spines (GridSection) keep the
 * long vertical line that separates this block from the rest of the page.
 */
export function AboutAccordionSection({
  copy,
  src = "/images/william-king.jpg",
  alt = "",
  className,
}: AboutAccordionSectionProps) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <GridSection className={cn("pt-[14svh] pb-[14svh]", className)}>
      {/* Long sky rule marking the gap after the values section. */}
      <div className="col-span-full mb-[8svh] h-px bg-sky" />

      <div className="col-start-2 col-end-5 min-w-0 px-(--grid-gutter) text-left md:col-end-8">
        <TextReveal blockColor={REVEAL_BLOCK} stagger={0.1}>
          <h2 className="font-owners-narrow-bold max-w-[22ch] text-[7vw] leading-[0.95] tracking-[-0.005em] wrap-break-word text-black uppercase md:text-[min(3.6vw,5.5svh)]">
            {copy.headline}
          </h2>
        </TextReveal>

        <TextReveal blockColor={REVEAL_BLOCK} stagger={0.08} duration={0.6}>
          <p className="font-archivo-light mt-5 max-w-[42ch] text-(length:--body-text) leading-normal text-black md:mt-[3svh]">
            {copy.body}
          </p>
        </TextReveal>

        <Link
          href={routes.menus}
          className="group mt-6 inline-block border border-sky bg-sky px-3 py-2.5 transition-colors duration-500 hover:bg-cream md:mt-[3svh]"
        >
          <span className="font-owners-medium inline-flex items-center gap-2 text-[11px] uppercase tracking-wide">
            {copy.cta}
            <span
              className="transition-transform duration-500 group-hover:translate-x-1.5"
              aria-hidden
            >
              &rarr;
            </span>
          </span>
        </Link>
      </div>

      <div className="col-start-2 col-end-5 mt-[8svh] grid gap-[5svh] px-(--grid-gutter) md:col-end-9 md:mt-[10svh] md:grid-cols-2 md:gap-(--grid-gutter)">
        <div className="relative aspect-square overflow-hidden bg-sky/20 md:aspect-3/4">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 90vw, 40vw"
            className="object-cover"
          />
        </div>

        <ul className="flex min-w-0 flex-col border-t border-sky self-start">
          {copy.items.map((item, index) => {
            const open = openIndex === index;

            return (
              <li key={item.title} className="border-b border-sky">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() =>
                    setOpenIndex((current) => (current === index ? -1 : index))
                  }
                  className="flex w-full items-center justify-between gap-4 py-4 text-left md:py-5"
                >
                  <span className="font-owners-narrow-bold text-[5.5vw] leading-[0.95] tracking-[-0.005em] uppercase md:text-[min(1.8vw,2.8svh)]">
                    {item.title}
                  </span>
                  <span
                    className="font-owners-medium shrink-0 text-[14px] uppercase tracking-wide"
                    aria-hidden
                  >
                    {open ? "−" : "+"}
                  </span>
                </button>

                <div
                  className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
                  style={{ maxHeight: open ? "16rem" : "0" }}
                >
                  <p className="font-archivo-light max-w-[42ch] pb-5 text-(length:--body-text) leading-normal text-black md:pb-6">
                    {item.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </GridSection>
  );
}
