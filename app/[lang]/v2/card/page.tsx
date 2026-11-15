import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { CellGridCardHero } from "@/components/v2/CellGridHero";

/** The brand-card version of the v2 hero. Test bench, not indexed. */
export const metadata: Metadata = {
  title: "v2 — card",
  robots: { index: false, follow: false },
};

export default function HomeV2Card() {
  // The footer makes the page scroll, so the scrollbar gutter holds a
  // scrollbar instead of an empty strip — see app/[lang]/v2/404/page.tsx.
  return (
    <>
      <div className="v2">
        <CellGridCardHero />
      </div>
      <Footer />
    </>
  );
}
