"use client";

import { CdnImage as Image } from "@/components/CdnImage";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { useMemo, useState } from "react";
import { CellGrid } from "@/components/v2/CellGrid";
import { routes } from "@/lib/routes";
import { useDictionary } from "@/components/LocaleProvider";
import { resolveFamilies, SHOP_NAV_GROUPS } from "@/lib/shopify/nav-groups";
import type { ShopifyCollection, ShopifyProduct } from "@/lib/shopify/queries";
import tableImage from "@/public/images/moment-table.jpg";

type ShopNavMenuProps = {
  /** Unused since the resting photo became the table (28 November 2026). */
  products?: ShopifyProduct[];
  collections: ShopifyCollection[];
  onNavigate?: () => void;
};

/** Families per row of the menu, each 4 cells of the 16 wide. */
const FAMILIES_PER_ROW = 3;
/** Grid rows a row of families takes. */
const FAMILY_ROWS = 2;
/** The photo: 4 cells wide, 4 rows tall — 3/4, like every cell. */
const PHOTO_ROWS = 4;

/* Two type styles carry the hierarchy, not an indent: the families in the
   bar's capitals, their sub-categories in the light text face. */
const familyClassName =
  "group block font-owners-medium text-(length:--nav-text) uppercase tracking-wide";
const childClassName =
  "group block font-archivo-light text-[14px] leading-snug";
/* The bottom line and the photo's caption share one size and line-height 1
   (28 November 2026): "Tout" in the bar's 13px, with an arrow from a
   fallback font, sat a few px above the caption beside it. */
const smallLinkClassName =
  "group block font-owners-medium text-[12px] leading-none uppercase tracking-wide";
const labelClassName = "animated-underline";

/*
 * The shop menu as a grid (27 November 2026, to try — the single column of
 * thirteen-odd lines had no hierarchy to speak of): the owners' six families
 * (lib/shopify/nav-groups.ts) as headings, three to a row, each in a block of
 * 4 cells by 2 rows of the page's 16 / 3/4 grid, its sub-categories listed
 * under it. Room for five or six sub-categories a family, and a seventh
 * family just starts a new row.
 *
 * On the right one photo, 4 cells by 4 rows, that follows the hovered family:
 * the collection's own image from Shopify, else its first product's — and
 * the whole table, "Tous les produits", at rest and on "Tout". Under it, the
 * name of what it shows. At the bottom, one line: the moments of the day
 * and "Tout" — a second way into the shop, not a third list.
 *
 * Every block is a `data-grid-hole`, so the grid draws only the rules
 * between them; a family slot left empty is one plain block too.
 */
export function ShopNavMenu({ collections, onNavigate }: ShopNavMenuProps) {
  const dict = useDictionary();
  const [hovered, setHovered] = useState<string | null>(null);

  const families = useMemo(() => resolveFamilies(collections), [collections]);

  const moments = useMemo(
    () =>
      SHOP_NAV_GROUPS.flatMap((group) =>
        group.items.flatMap((item) => {
          const collection = collections.find((c) => c.handle === item.handle);
          return collection
            ? [{ collection, label: dict.home.moments[item.label] }]
            : [];
        }),
      ),
    [collections, dict],
  );

  /* The hovered collection's photo. With nothing hovered, or on "Tout", the
     whole shop: the table laid with everything (the home's opening photo),
     not the first family's — "Tout" over a juice read as juices only (28
     November 2026). */
  const shown =
    collections.find((c) => c.handle === hovered && c.imageUrl) ?? null;
  const photo = shown
    ? { src: shown.imageUrl!, alt: shown.imageAlt, title: shown.title }
    : { src: tableImage, alt: "", title: dict.home.moments.shop };
  const photoHref = shown ? routes.collection(shown.handle) : routes.shop;

  const familyRows = Math.max(
    PHOTO_ROWS,
    Math.ceil(families.length / FAMILIES_PER_ROW) * FAMILY_ROWS,
  );
  const bottomRow = familyRows + 1;

  const hover = (handle: string | null) => ({
    onMouseEnter: () => setHovered(handle),
    onFocus: () => setHovered(handle),
  });

  return (
    <div className="v2" onMouseLeave={() => setHovered(null)}>
      <section className="relative border-b border-sky bg-cream">
        <CellGrid
          lineClassName="bg-sky"
          bands={false}
          readout={false}
          subdivide={2}
          linesOnTop
        />
        <nav
          aria-label={dict.nav.shop}
          className="relative grid"
          style={{
            gridTemplateColumns: "var(--s-grid-columns)",
            gridTemplateRows: `repeat(${bottomRow}, var(--s-cell-h))`,
          }}
        >
          {families.map(({ collection, children }, index) => (
            <div
              key={collection.handle}
              data-grid-hole
              className="flex min-w-0 flex-col gap-3 p-(--v2-pad)"
              style={{
                gridColumn: `${2 + (index % FAMILIES_PER_ROW) * 4} / span 4`,
                gridRow: `${1 + Math.floor(index / FAMILIES_PER_ROW) * FAMILY_ROWS} / span ${FAMILY_ROWS}`,
              }}
            >
              <Link
                href={routes.collection(collection.handle)}
                className={familyClassName}
                onClick={onNavigate}
                {...hover(collection.handle)}
              >
                <span className={labelClassName}>{collection.title}</span>
              </Link>
              {children.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                  {children.map((child) => (
                    <li key={child.handle}>
                      <Link
                        href={routes.collection(child.handle)}
                        className={childClassName}
                        onClick={onNavigate}
                        {...hover(child.handle)}
                      >
                        <span className={labelClassName}>{child.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {/* The slots a family has not filled yet (Breads & Toast before
              its first product): one plain block each, not loose cells. */}
          {Array.from(
            {
              length:
                (familyRows / FAMILY_ROWS) * FAMILIES_PER_ROW - families.length,
            },
            (_, offset) => {
              const index = families.length + offset;
              return (
                <div
                  key={`empty-${index}`}
                  data-grid-hole
                  aria-hidden
                  style={{
                    gridColumn: `${2 + (index % FAMILIES_PER_ROW) * 4} / span 4`,
                    gridRow: `${1 + Math.floor(index / FAMILIES_PER_ROW) * FAMILY_ROWS} / span ${FAMILY_ROWS}`,
                  }}
                />
              );
            },
          )}

          {/* The bottom line: the moments of the day, then everything. */}
          <div
            data-grid-hole
            className="flex min-w-0 items-end justify-between gap-6 p-(--v2-pad)"
            style={{ gridColumn: "2 / span 12", gridRow: `${bottomRow}` }}
          >
            {moments.length > 0 ? (
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
                <p className="font-archivo-light text-[14px] leading-none opacity-60">
                  {dict.nav.byMoment}
                </p>
                {moments.map(({ collection, label }) => (
                  <Link
                    key={collection.handle}
                    href={routes.collection(collection.handle)}
                    className={smallLinkClassName}
                    onClick={onNavigate}
                    {...hover(collection.handle)}
                  >
                    <span className={labelClassName}>{label}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <span />
            )}
            <Link
              href={routes.shop}
              className={smallLinkClassName}
              onClick={onNavigate}
              {...hover(null)}
            >
              <span className={labelClassName}>{dict.nav.all} →</span>
            </Link>
          </div>

          {/* The photo, 3/4, and the name of what it shows under it. Both
              blocks are always there, even before the catalogue has an image:
              the grid takes its holes when it mounts, and a block added later
              would get the cell rules drawn across it. */}
          <Link
            href={photoHref}
            onClick={onNavigate}
            tabIndex={-1}
            aria-hidden
            data-grid-hole
            className="relative min-w-0 overflow-hidden"
            style={{
              gridColumn: "14 / span 4",
              gridRow: `1 / span ${PHOTO_ROWS}`,
            }}
          >
            <Image
              key={typeof photo.src === "string" ? photo.src : "all"}
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="25vw"
              className="animate-[v2-fade_400ms_ease-out] object-cover"
            />
          </Link>
          <div
            data-grid-hole
            className="flex min-w-0 items-end p-(--v2-pad)"
            style={{
              gridColumn: "14 / span 4",
              gridRow: `${PHOTO_ROWS + 1} / span ${bottomRow - PHOTO_ROWS}`,
            }}
          >
            {/* inline-block and 3px under, like the links' underline box
                (.animated-underline): without it the caption sat 3px below
                "Tout" on the same line. */}
            <span className="font-owners-medium inline-block pb-[3px] text-[12px] leading-none tracking-wide uppercase">
              {photo.title}
            </span>
          </div>
        </nav>
      </section>
    </div>
  );
}
