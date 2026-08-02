"use client";

import Image from "next/image";
import { useState } from "react";
import type { ShopifyProductImage } from "@/lib/shopify/queries";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: ShopifyProductImage[];
  title: string;
};

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return <div className="aspect-4/5 w-full bg-sky/20" aria-hidden />;
  }

  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex min-w-0 gap-2 md:gap-3">
        <ul className="hidden w-16 shrink-0 flex-col gap-2 md:flex lg:w-18">
          {images.map((image, index) => (
            <li key={`${image.url}-${index}`}>
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                disabled={images.length === 1}
                aria-label={`View image ${index + 1} of ${images.length}`}
                aria-current={index === activeIndex ? "true" : undefined}
                className={cn(
                  "relative aspect-4/5 w-full overflow-hidden border transition-colors duration-500",
                  index === activeIndex
                    ? "border-black"
                    : "border-sky hover:border-black/40",
                  images.length === 1 && "cursor-default",
                )}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="72px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>

        <div className="relative aspect-4/5 min-w-0 flex-1 overflow-hidden bg-sky/20">
          <Image
            key={activeImage.url}
            src={activeImage.url}
            alt={activeImage.altText || title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>

      {images.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto md:hidden">
          {images.map((image, index) => (
            <li key={`${image.url}-mobile-${index}`} className="shrink-0">
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`View image ${index + 1} of ${images.length}`}
                aria-current={index === activeIndex ? "true" : undefined}
                className={cn(
                  "relative aspect-4/5 w-16 overflow-hidden border transition-colors duration-500",
                  index === activeIndex
                    ? "border-black"
                    : "border-sky hover:border-black/40",
                )}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
