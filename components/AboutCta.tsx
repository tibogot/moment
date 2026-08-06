import { LocaleLink as Link } from "@/components/LocaleLink";
import { GridLines } from "@/components/GridLines";
import TextReveal from "@/components/TextReveal";
import { REVEAL_BLOCK_ON_SKY } from "@/lib/colors";
import { routes } from "@/lib/routes";

const links = [
  { label: "Plan an event", href: routes.events },
  { label: "Order delivery", href: routes.shop },
  { label: "Get in touch", href: routes.contact },
] as const;

/**
 * A sky band closing the page. The footer that follows is cream and carries
 * its own large type, so this one inverts rather than stacking a second
 * cream headline against it.
 */
export function AboutCta() {
  return (
    <section className="relative w-full bg-sky pt-[12svh] pb-[14svh] text-black">
      <GridLines lineClassName="bg-cream" />

      <div
        className="relative grid"
        style={{ gridTemplateColumns: "var(--grid-columns)" }}
      >
        <div className="col-start-2 col-end-5 min-w-0 px-(--grid-gutter) text-left md:col-end-8">
          <TextReveal blockColor={REVEAL_BLOCK_ON_SKY} stagger={0.12}>
            <h2 className="font-owners-narrow-bold max-w-full text-[9vw] leading-[0.95] tracking-[-0.005em] wrap-break-word uppercase md:text-[min(5.4vw,8svh)]">
              Tell us what you are planning.
            </h2>
          </TextReveal>
        </div>

        <div className="col-start-2 col-end-5 mt-[5svh] min-w-0 px-(--grid-gutter) text-left md:col-start-5 md:col-end-8 md:mt-[8svh]">
          <TextReveal
            blockColor={REVEAL_BLOCK_ON_SKY}
            stagger={0.08}
            duration={0.6}
          >
            <p className="font-archivo-light max-w-full text-[18px] leading-normal md:max-w-[42ch]">
              A date, a headcount and a rough idea of the room is enough to
              start. We come back with a menu, a price and what it takes to put
              it on the table.
            </p>

            {/* Siblings rather than a list: TextReveal splits each child it is
                given, and the intro section's button already rides along this
                way. */}
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group mt-5 mr-3 inline-block border border-cream bg-cream px-3 py-2.5 transition-colors duration-500 hover:bg-sky"
              >
                <span className="font-owners-medium inline-flex items-center gap-2 text-[11px] uppercase tracking-wide">
                  {link.label}
                  <span
                    className="transition-transform duration-500 group-hover:translate-x-1.5"
                    aria-hidden
                  >
                    &rarr;
                  </span>
                </span>
              </Link>
            ))}
          </TextReveal>
        </div>
      </div>
    </section>
  );
}
