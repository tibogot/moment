import { GridLines } from "@/components/GridLines";
import { cn } from "@/lib/utils";

type GridSectionProps = {
  children?: React.ReactNode;
  className?: string;
};

/**
 * A cream page section that carries the two outer column lines down from the
 * hero, drawn in sky so they read against the light background.
 */
export function GridSection({ children, className }: GridSectionProps) {
  return (
    <section className={cn("relative w-full bg-cream", className)}>
      <GridLines lineClassName="bg-sky" />

      <div
        className="relative grid"
        style={{ gridTemplateColumns: "var(--grid-columns)" }}
      >
        {children}
      </div>
    </section>
  );
}
