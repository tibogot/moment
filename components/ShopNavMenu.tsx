"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { routes } from "@/lib/routes";
import type { ShopifyCollection, ShopifyProduct } from "@/lib/shopify/queries";

type ShopNavMenuProps = {
  products: ShopifyProduct[];
  collections: ShopifyCollection[];
  onNavigate?: () => void;
};

type HoverKey = "all" | "collections" | string;

const PREVIEW_COUNT = 2;

const linkClassName =
  "animated-underline font-owners-medium text-[12px] uppercase tracking-wide";

function productsWithImages(products: ShopifyProduct[]) {
  return products.filter((product) => product.imageUrl);
}

function getPreviewProducts(
  hovered: HoverKey | null,
  collections: ShopifyCollection[],
  allProducts: ShopifyProduct[],
): ShopifyProduct[] {
  if (hovered === null || hovered === "all") {
    return productsWithImages(allProducts).slice(0, PREVIEW_COUNT);
  }

  if (hovered === "collections") {
    const picks: ShopifyProduct[] = [];

    for (const collection of collections) {
      const product = productsWithImages(collection.products)[0];
      if (product) {
        picks.push(product);
        if (picks.length >= PREVIEW_COUNT) break;
      }
    }

    return picks;
  }

  const collection = collections.find((item) => item.handle === hovered);
  if (collection) {
    return productsWithImages(collection.products).slice(0, PREVIEW_COUNT);
  }

  return productsWithImages(allProducts).slice(0, PREVIEW_COUNT);
}

type PreviewProductCardProps = {
  product: ShopifyProduct;
  onNavigate?: () => void;
};

function PreviewProductCard({ product, onNavigate }: PreviewProductCardProps) {
  if (!product.imageUrl) return null;

  return (
    <Link
      href={routes.product(product.handle)}
      className="group flex w-44 shrink-0 flex-col gap-3 lg:w-52"
      onClick={onNavigate}
    >
      <div className="relative aspect-4/5 overflow-hidden bg-sky/20">
        <Image
          src={product.imageUrl}
          alt={product.imageAlt}
          fill
          sizes="(max-width: 1280px) 176px, 208px"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className={linkClassName}>{product.title}</span>
        {/* Same length as the shop grid's price rather than a local size, so
            the two stay in step — Archivo Light needs the couple of extra px
            over the Owners Medium title above it. */}
        <span className="font-archivo-light text-(length:--card-price)">
          {product.price}
        </span>
      </div>
    </Link>
  );
}

export function ShopNavMenu({
  products,
  collections,
  onNavigate,
}: ShopNavMenuProps) {
  const [hovered, setHovered] = useState<HoverKey | null>(null);

  const previewProducts = useMemo(
    () => getPreviewProducts(hovered, collections, products),
    [hovered, collections, products],
  );

  const setHover = (key: HoverKey) => () => setHovered(key);
  const resetHover = () => setHovered(null);

  return (
    <div
      className="grid border-t border-sky"
      style={{ gridTemplateColumns: "var(--grid-columns)" }}
      onMouseLeave={resetHover}
    >
      <nav
        aria-label="Shop"
        className="relative col-start-2 col-end-4 flex flex-col gap-2.5 self-start px-(--grid-gutter) pt-[4svh] pb-[4svh]"
      >
        <Link
          href={routes.shop}
          className={linkClassName}
          onMouseEnter={setHover("all")}
          onFocus={setHover("all")}
          onClick={onNavigate}
        >
          All
        </Link>
        <Link
          href={routes.collections}
          className={linkClassName}
          onMouseEnter={setHover("collections")}
          onFocus={setHover("collections")}
          onClick={onNavigate}
        >
          Collections
        </Link>
        {collections.map((collection) => (
          <Link
            key={collection.id}
            href={routes.collection(collection.handle)}
            className={linkClassName}
            onMouseEnter={setHover(collection.handle)}
            onFocus={setHover(collection.handle)}
            onClick={onNavigate}
          >
            {collection.title}
          </Link>
        ))}
      </nav>

      {previewProducts.length > 0 && (
        <div className="relative col-start-4 col-end-9">
          <span
            className="pointer-events-none absolute inset-y-0 left-0 w-px bg-sky"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute inset-y-0 right-0 w-px bg-sky"
            aria-hidden
          />

          <div className="flex gap-5 px-(--grid-gutter) pt-[4svh] pb-4 lg:gap-8">
            {previewProducts.map((product) => (
              <PreviewProductCard
                key={product.id}
                product={product}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      )}

      <div className="col-span-full h-px bg-sky" aria-hidden />
      <div className="col-span-full min-h-(--grid-band)" />
    </div>
  );
}
