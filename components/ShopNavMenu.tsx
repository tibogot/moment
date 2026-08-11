"use client";

import Image from "next/image";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { useMemo, useState } from "react";
import { routes } from "@/lib/routes";
import { useDictionary } from "@/components/LocaleProvider";
import { NAV_PREVIEW_COUNT } from "@/lib/shopify/queries";
import type { ShopifyCollection, ShopifyProduct } from "@/lib/shopify/queries";

type ShopNavMenuProps = {
  products: ShopifyProduct[];
  collections: ShopifyCollection[];
  onNavigate?: () => void;
};

type HoverKey = "all" | "collections" | string;

/* Shared with the collections query: it only bundles a few products per
   collection, so a count set here alone would silently cap at whatever the
   query fetched. */
const PREVIEW_COUNT = NAV_PREVIEW_COUNT;

const linkClassName =
  "animated-underline font-owners-medium text-[12px] uppercase tracking-wide";

/* The previews are cards, not nav links: they take the shop grid's sky reveal
   rather than the underline the column on the left uses. */
const previewTitleClassName =
  "font-owners-medium text-[12px] uppercase tracking-wide";

/*
 * The previews are cells of the column they sit in rather than cards of a fixed
 * rem width: the column is fluid (5 of 7 tracks) and fixed cards left it 40%
 * empty at 1920 while overflowing it at the 1200px nav breakpoint.
 *
 * Every rule in here — the two spines and the dividers between cells — gets one
 * --grid-gutter of clearance on each side, exactly like a column line on the
 * page grid. That makes the gap between cells two gutters wide, so a cell is
 * (100% - 2 * PREVIEW_COUNT gutters) / PREVIEW_COUNT, and a divider sits a
 * whole number of cell-plus-gap steps in. At step PREVIEW_COUNT the formula
 * lands on 100% — the right spine — which is the check that the rules and the
 * cells cannot drift apart.
 */
const previewMetrics = {
  "--preview-gap": "calc(2 * var(--grid-gutter))",
  "--preview-card": `calc((100% - ${2 * PREVIEW_COUNT} * var(--grid-gutter)) / ${PREVIEW_COUNT})`,
} as React.CSSProperties;

/* Always PREVIEW_COUNT tracks, even when a collection has fewer products to
   show: a short row has to keep the cell width the dividers are drawn against,
   so two previews sit in the first two cells rather than stretching over all
   three. */
const previewRowStyle = {
  gridTemplateColumns: `repeat(${PREVIEW_COUNT}, minmax(0, 1fr))`,
} as React.CSSProperties;

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

  /* The reveal has to fill the ruled cell, like it does in the shop grid, so
     the card owns the whole cell rather than sitting inside it: horizontally it
     bleeds one gutter each side and pads one back in — half the gap either way,
     which lands exactly on the dividers while leaving the image at the cell
     width — and vertically it takes the row's padding as its own, so it runs
     the full height the dividers do without the image moving. */
  return (
    <Link
      href={routes.product(product.handle)}
      className="product-card group -mx-(--grid-gutter) flex h-full min-w-0 flex-col gap-3 px-(--grid-gutter) pt-[4svh] pb-4 transition-colors duration-500"
      onClick={onNavigate}
    >
      <div className="product-card__image relative aspect-4/5 overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.imageAlt}
          fill
          sizes="15vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className={previewTitleClassName}>{product.title}</span>
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
  const dict = useDictionary();
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
        aria-label={dict.nav.shop}
        className="relative col-start-2 col-end-4 flex flex-col gap-2.5 self-start px-(--grid-gutter) pt-[4svh] pb-[4svh]"
      >
        <Link
          href={routes.shop}
          className={linkClassName}
          onMouseEnter={setHover("all")}
          onFocus={setHover("all")}
          onClick={onNavigate}
        >
          {dict.nav.all}
        </Link>
        <Link
          href={routes.collections}
          className={linkClassName}
          onMouseEnter={setHover("collections")}
          onFocus={setHover("collections")}
          onClick={onNavigate}
        >
          {dict.nav.collections}
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
        <div className="relative col-start-4 col-end-9" style={previewMetrics}>
          <span
            className="pointer-events-none absolute inset-y-0 left-0 w-px bg-sky"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute inset-y-0 right-0 w-px bg-sky"
            aria-hidden
          />

          {/* A rule per gap, so every preview sits in its own ruled cell. They
              run the full column height like the two spines either side — cut
              to the height of the cards they would read as a different line. */}
          {previewProducts.slice(1).map((product, index) => (
            <span
              key={`divider-${product.id}`}
              className="pointer-events-none absolute inset-y-0 w-px bg-sky"
              style={{
                left: `calc(${index + 1} * (var(--preview-card) + var(--preview-gap)))`,
              }}
              aria-hidden
            />
          ))}

          {/* The vertical padding lives on the cards, not here, so their hover
              fill reaches the same top and bottom as the rules beside them. */}
          <div
            className="grid h-full gap-(--preview-gap) px-(--grid-gutter)"
            style={previewRowStyle}
          >
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
