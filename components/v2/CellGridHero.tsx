import Image from "next/image";
import { CellGrid } from "@/components/v2/CellGrid";

/**
 * The brand-card version: the cells and the logotype in the band. Cream page
 * with sky rules like every page; the palette preview gives the card's sky
 * page with cream rules.
 */
export function CellGridCardHero() {
  return (
    <section className="relative h-svh w-full overflow-hidden bg-cream">
      <CellGrid lineClassName="bg-sky" />
      <div
        className="absolute bottom-0 flex items-center"
        style={{
          height: "var(--grid-band)",
          left: "calc(var(--grid-margin) + var(--grid-gutter) / 2)",
        }}
      >
        <Image
          src="/brand/Moment-Logotype.svg"
          alt="Moment"
          width={1437}
          height={220}
          // The file is filled cream for the navbar; black here, as on the card.
          className="h-auto w-[clamp(90px,9vw,140px)] brightness-0"
          priority
        />
      </div>
    </section>
  );
}
