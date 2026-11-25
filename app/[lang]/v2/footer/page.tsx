import type { Metadata } from "next";
import { FooterV1 } from "@/components/FooterV1";
import { FooterGrid } from "@/components/v2/FooterGrid";

/**
 * Test bench: the previous footer (FooterV1), then the v2 one — the site
 * footer since 15 November 2026 — under it. Not linked, not indexed. Delete
 * along with FooterV1 once its flip effect has moved to the v2 footer.
 */
export const metadata: Metadata = {
  title: "v2 — footer",
  robots: { index: false, follow: false },
};

export default function FooterComparison() {
  return (
    <>
      <FooterV1 />
      <div className="v2">
        <FooterGrid />
      </div>
    </>
  );
}
