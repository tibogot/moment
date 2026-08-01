import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import type { SanityImage } from "@/lib/sanity/types";

type SanityImageProps = {
  image: SanityImage;
  alt?: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
};

export function SanityImage({
  image,
  alt,
  sizes = "100vw",
  className = "object-cover",
  priority = false,
}: SanityImageProps) {
  if (!image.asset) return null;

  const imageUrl = urlFor(image).width(1600).auto("format").url();

  return (
    <Image
      src={imageUrl}
      alt={alt ?? image.alt ?? ""}
      fill
      className={className}
      sizes={sizes}
      priority={priority}
    />
  );
}
