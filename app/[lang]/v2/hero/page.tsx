import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import {
  HeroLabBoxes,
  HeroLabCalendar,
  HeroLabRows,
} from "@/components/v2/HeroLab";

/**
 * Hero lab (27 November 2026): three directions for the home hero on the
 * visible grid, without a photograph. Test bench, not indexed.
 */
export const metadata: Metadata = {
  title: "v2 — hero lab",
  robots: { index: false, follow: false },
};

export default function HeroLabPage() {
  return (
    <>
      <div className="v2">
        <HeroLabRows />
        <HeroLabCalendar />
        <HeroLabBoxes />
      </div>
      <Footer />
    </>
  );
}
