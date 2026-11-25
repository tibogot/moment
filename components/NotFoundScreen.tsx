import { Footer } from "@/components/Footer";
import { NotFoundGrid } from "@/components/v2/NotFoundGrid";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * The 404 screen, shared by the per-language boundary
 * (`app/[lang]/not-found.tsx`) and the global one (`app/global-not-found.tsx`).
 *
 * Takes its copy as a prop rather than reading context: the global boundary
 * renders outside the locale layout and has to hand the dictionary in itself.
 *
 * The design is the v2 one (15 November 2026): the number in the middle of
 * the brand grid, the cells running round it — see
 * `components/v2/NotFoundGrid.tsx`. The `.v2` wrapper is what defines that
 * grid (globals.css). The footer follows it as on every page: it also makes
 * the page scroll, so the scrollbar gutter holds a scrollbar rather than an
 * empty strip.
 */
export function NotFoundScreen({
  copy,
}: {
  copy: Dictionary["common"]["notFound"];
}) {
  return (
    <>
      <div className="v2">
        <NotFoundGrid copy={copy} />
      </div>
      <Footer />
    </>
  );
}
