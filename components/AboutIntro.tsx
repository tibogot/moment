import type { Dictionary } from "@/lib/i18n/dictionaries";
import { SplitStatementSection } from "@/components/SplitStatementSection";

/**
 * The statement that opens the about page — same shape as SplitStatementSection
 * on the home page. Carries the copy the page needs to rank for: traiteur,
 * catering, Brussels, the three things we actually sell.
 */
export function AboutIntro({ copy }: { copy: Dictionary["about"]["intro"] }) {
  return <SplitStatementSection copy={copy} />;
}
