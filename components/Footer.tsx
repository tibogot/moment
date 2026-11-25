import { FooterCells } from "@/components/v2/FooterCells";

/**
 * The site footer: `components/v2/FooterCells.tsx` since 24 November 2026,
 * on the 16 / 12 / 4 grid of /v2/systeme. The `.v2` wrapper is what defines
 * its grid (globals.css), so it works under any page, v2 or not.
 *
 * Kept, not used by the site: `components/v2/FooterGrid.tsx` (the footer
 * from 15 to 24 November, still on /v2 and /v2/footer) and `FooterV1`
 * (for its flip hover effect).
 */
export function Footer() {
  return (
    <div className="v2">
      <FooterCells />
    </div>
  );
}
