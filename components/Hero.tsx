import Image from "next/image";
import { GridLines } from "@/components/GridLines";
import { Navbar } from "@/components/Navbar";
import { GRID_COLUMNS, GRID_COLUMNS_MOBILE, type GridHole } from "@/lib/grid";

/** Cells the type sits in, so the rules can be dropped there. */
const holes: GridHole[] = [
  { col: [1, 5], row: [2, 3] }, // headline
  { col: [6, 7], row: [3, 3] }, // paragraph
];

const mobileHoles: GridHole[] = [
  { col: [1, 3], row: [3, 3] }, // headline
  { col: [2, 3], row: [2, 2] }, // paragraph
];

export function Hero() {
  return (
    <section className="relative h-svh w-full overflow-hidden">
      <Image
        src="/images/anita-austvika.jpg"
        alt=""
        fill
        preload
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/20" aria-hidden />

      <GridLines
        ruled
        columns={GRID_COLUMNS_MOBILE}
        holes={mobileHoles}
        className="md:hidden"
      />
      <GridLines
        ruled
        columns={GRID_COLUMNS}
        holes={holes}
        className="hidden md:block"
      />

      <div
        className="absolute inset-0 grid text-cream"
        style={{
          gridTemplateColumns: "var(--grid-columns)",
          gridTemplateRows: "var(--grid-rows)",
        }}
      >
        <Navbar />

        <h1 className="col-start-2 col-end-5 row-start-4 row-end-5 self-end pb-4 pl-(--grid-gutter) font-owners-narrow-bold text-[16vw] leading-[0.9] tracking-[-0.005em] uppercase md:col-end-7 md:row-start-3 md:row-end-5 md:pb-[2.2vw] md:text-[10.6vw]">
          Un moment
          <br />
          gourmand,
          <br />
          simplement.
        </h1>

        <p className="col-start-3 col-end-5 row-start-3 row-end-4 self-end pr-(--grid-gutter) pb-4 text-right font-archivo-light text-[13px] leading-[1.43] md:col-start-7 md:col-end-9 md:row-start-4 md:row-end-5 md:pb-[2.85vw] md:text-[1.63vw]">
          Moment, c&apos;est un traiteur pour particuliers et entreprises,
          celles qui veulent projeter leur image auprès de leurs clients.
        </p>
      </div>
    </section>
  );
}
