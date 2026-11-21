import type { Metadata } from "next";
import { ComingSoonGrid } from "@/components/v2/ComingSoonGrid";

/**
 * Test bench: the holding page ("Bientôt en ligne") on the v2 grid, to see
 * its design. The real one is the separate `moment-coming-soon` site.
 * Not linked, not indexed.
 */
export const metadata: Metadata = {
  title: "v2 — coming soon",
  robots: { index: false, follow: false },
};

export default function ComingSoonPreview() {
  return <ComingSoonGrid />;
}
