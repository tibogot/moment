import { FooterGrid } from "@/components/v2/FooterGrid";

/**
 * The site footer: the v2 one (`components/v2/FooterGrid.tsx`) since
 * 15 November 2026. The `.v2` wrapper is what defines its grid
 * (globals.css), so it works under any page, v2 or not.
 *
 * The previous footer is kept as `FooterV1` for its flip hover effect, which
 * the v2 footer does not have yet.
 */
export function Footer() {
  return (
    <div className="v2">
      <FooterGrid />
    </div>
  );
}
