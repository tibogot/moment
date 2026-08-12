import Image from "next/image";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { GridLines } from "@/components/GridLines";
import TextReveal from "@/components/TextReveal";
import { REVEAL_BLOCK, REVEAL_BLOCK_ON_SKY } from "@/lib/colors";
import { cn } from "@/lib/utils";

const MARGIN_COLUMNS = "var(--grid-margin) minmax(0, 1fr) var(--grid-margin)";

type AboutValuesSectionProps = {
  copy: Dictionary["about"]["values"];
  src?: string;
  alt?: string;
  className?: string;
};

/**
 * Two-column values block. On desktop the left half is sticky below the nav
 * band while the four cards on the right scroll past it; sticky releases when
 * the section bottom catches the left panel — i.e. once the last card has
 * settled into view. No ScrollTrigger pin: same mechanism as StickyTitleSection,
 * just with a taller scrolling sibling.
 */
export function AboutValuesSection({
  copy,
  src = "/images/oak-bond-coffee.jpg",
  alt = "",
  className,
}: AboutValuesSectionProps) {
  return (
    <section className={cn("relative w-full bg-cream", className)}>
      <GridLines lineClassName="bg-sky" />

      <div
        className="relative grid"
        style={{ gridTemplateColumns: MARGIN_COLUMNS }}
      >
        <div className="col-start-2 grid md:grid-cols-2">
          {/* Sticky rail — sits under the nav band so the pin clears the header.
              Height is viewport minus that band so it still fills the remaining
              screen and releases when the last card settles. */}
          <aside className="flex flex-col justify-between gap-10 px-(--grid-gutter) py-[6svh] text-left md:sticky md:top-(--grid-band) md:h-[calc(100svh-var(--grid-band))] md:py-[5svh]">
            <div>
              <span className="font-owners-medium text-[12px] uppercase tracking-wide">
                {copy.label}
              </span>

              <TextReveal blockColor={REVEAL_BLOCK} stagger={0.1}>
                <p className="font-archivo-light mt-6 max-w-[28ch] text-[5.5vw] leading-[1.15] wrap-break-word text-black md:mt-[3svh] md:text-[min(1.85vw,2.8svh)]">
                  {copy.lead}
                </p>
              </TextReveal>
            </div>

            <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] items-end gap-(--grid-gutter)">
              <div className="relative aspect-3/4 overflow-hidden bg-sky/20">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 26vw"
                  className="object-cover"
                />
              </div>

              <TextReveal
                blockColor={REVEAL_BLOCK}
                stagger={0.08}
                duration={0.6}
              >
                <p className="font-archivo-light max-w-[28ch] text-(length:--body-text) leading-normal text-black">
                  {copy.aside}
                </p>
              </TextReveal>
            </div>
          </aside>

          {/* Scrolling cards — portrait 3/4 frames, narrower than the column.
              Their stacked height is what keeps the left pinned. */}
          <ul className="flex flex-col items-end gap-[5svh] px-(--grid-gutter) pb-[8svh] md:gap-[12svh] md:pt-(--grid-band) md:pb-[8svh] md:pl-0 md:pr-(--grid-gutter)">
            {copy.cards.map((card) => (
              <li
                key={card.title}
                className="flex aspect-3/4 w-full flex-col justify-between bg-sky px-4 py-5 text-left md:w-[55%] md:px-5 md:py-6"
              >
                <TextReveal blockColor={REVEAL_BLOCK_ON_SKY} stagger={0.12}>
                  <h3 className="font-owners-narrow-bold max-w-[16ch] text-[8vw] leading-[0.95] tracking-[-0.005em] wrap-break-word text-black uppercase md:text-[min(2.6vw,4svh)]">
                    {card.title}
                  </h3>
                </TextReveal>

                <TextReveal
                  blockColor={REVEAL_BLOCK_ON_SKY}
                  stagger={0.08}
                  duration={0.6}
                >
                  <p className="font-archivo-light mt-8 max-w-[32ch] text-[18px] leading-normal text-black md:mt-0">
                    {card.body}
                  </p>
                </TextReveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
