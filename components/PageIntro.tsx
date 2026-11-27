import { GridSection } from "@/components/GridSection";
import TextReveal from "@/components/TextReveal";
import { REVEAL_BLOCK } from "@/lib/colors";
import { cn } from "@/lib/utils";

type PageIntroProps = {
  title: string;
  lead?: string;
  /** Escape hatch for a page that needs its lead off the shared size. */
  leadClassName?: string;
  /** A button under the lead — an anchor on the same page, usually. */
  action?: { href: string; label: string };
};

/** Shared header for the inner pages until each gets its own design. */
export function PageIntro({
  title,
  lead,
  leadClassName,
  action,
}: PageIntroProps) {
  return (
    <GridSection className="pt-[22svh] pb-[12svh]">
      <div className="col-start-2 col-end-5 min-w-0 px-(--grid-gutter) text-left md:col-end-8">
        <TextReveal
          blockColor={REVEAL_BLOCK}
          animateOnScroll={false}
          delay={0.15}
        >
          <h1 className="font-owners-narrow-bold max-w-full text-[11vw] leading-[0.9] tracking-[-0.005em] wrap-break-word text-black uppercase md:text-[min(8vw,12svh)]">
            {title}
          </h1>
        </TextReveal>
      </div>

      {lead && (
        <div className="col-start-2 col-end-5 mt-[5svh] min-w-0 px-(--grid-gutter) text-left md:col-start-5 md:col-end-8">
          <TextReveal
            blockColor={REVEAL_BLOCK}
            animateOnScroll={false}
            delay={0.35}
          >
            <p
              className={cn(
                // Flat 18px rather than a vw clamp: a clamp reads as 15px on
                // a phone, and every page wants this size anyway. Archivo
                // Light sets small, so the lead
                // needs the size to hold its own under the headline.
                "font-archivo-light max-w-full text-[18px] leading-normal wrap-break-word text-black",
                leadClassName,
              )}
            >
              {lead}
            </p>
          </TextReveal>
          {action && (
            <a
              href={action.href}
              className="mt-[4svh] inline-block border border-sky bg-sky px-3 py-2.5 transition-colors duration-500 hover:bg-cream"
            >
              <span className="font-owners-medium text-[14px] uppercase tracking-wide">
                {action.label}
              </span>
            </a>
          )}
        </div>
      )}
    </GridSection>
  );
}
