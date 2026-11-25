import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { GridOverlayToggle } from "@/components/v2/GridOverlayToggle";
import { NotFoundCells, NotFoundScatter } from "@/components/v2/NotFoundCells";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

/**
 * Test bench: the 404 on the 16 / 12 / 4 grid, two ways, one under the
 * other: "404" in one block of cells, then each digit in its own 2 × 2
 * block, then "404" as a pattern, one digit a cell, then the same with
 * the grid to the screen's edges. Not linked, not indexed. The live 404 is NotFoundGrid.
 */
export const metadata: Metadata = {
  title: "v2 — 404",
  robots: { index: false, follow: false },
};

export default async function NotFoundV2({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const dict = await getDictionary(toLocale((await params).lang));
  const copy = dict.common.notFound;

  return (
    <>
      <div className="v2">
        {/* The grid to the screen's edges, first so it is seen as a page. */}
        <NotFoundScatter copy={copy} fullBleed />
        <NotFoundCells copy={copy} as="h2" />
        <NotFoundCells copy={copy} split as="h2" />
        <NotFoundScatter copy={copy} as="h2" />
      </div>
      <Footer />
      <GridOverlayToggle />
    </>
  );
}
