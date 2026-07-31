import { GridLines } from "@/components/GridLines";
import { Navbar } from "@/components/Navbar";

/** The navbar as it appears on the cream inner pages. */
export function SiteHeader() {
  return (
    <div className="relative z-30 bg-cream text-black">
      <GridLines lineClassName="bg-sky" />
      <Navbar />
    </div>
  );
}
