import { GridLines } from "@/components/GridLines";
import { ParallaxImage } from "@/components/ParallaxImage";
import { cn } from "@/lib/utils";

type FullBleedImageSectionProps = {
  src: string;
  alt?: string;
  priority?: boolean;
  className?: string;
};

/**
 * A full-width, full-height photograph that breaks the ruled cream sections
 * up. The spines are drawn in cream rather than sky — the same treatment the
 * hero gives them, so the grid reads as continuous across the image.
 */
export function FullBleedImageSection({
  src,
  alt = "",
  priority = false,
  className,
}: FullBleedImageSectionProps) {
  return (
    <section className={cn("relative h-[85svh] w-full overflow-hidden md:h-svh", className)}>
      <ParallaxImage
        src={src}
        alt={alt}
        priority={priority}
        sizes="100vw"
        className="absolute inset-0"
      />

      {/* Unruled, so only the two outer spines carry through — and those sit
          on the margins, which do not change with the column count. */}
      <GridLines lineClassName="bg-cream/60" />
    </section>
  );
}
