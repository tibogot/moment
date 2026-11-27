"use client";

import Image from "next/image";
import { Brand } from "@/components/Brand";
import { CookiePreferencesButton } from "@/components/CookieConsent";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { useDictionary } from "@/components/LocaleProvider";
import { CellGrid } from "@/components/v2/CellGrid";
import { ENABLED_CONSENT_CATEGORIES } from "@/lib/consent/categories";
import { legalNav, routes } from "@/lib/routes";
import { useAboutNav } from "@/components/AboutNavProvider";
import { useSiteDetails } from "@/components/SiteDetailsProvider";
import { PaymentMethodsRow } from "@/components/PaymentMethods";
import { cn } from "@/lib/utils";

/**
 * The site footer since 24 November 2026 (via components/Footer.tsx), after
 * Thibault's mockup, on the 16 / 12 / 4 grid of /v2/systeme. Must sit inside
 * a `.v2` wrapper. The previous one, FooterGrid, is kept, unused by the site.
 *
 * Tablet and desktop: panels of 2 × 2 cells (3 × 3 on a tablet), two on
 * the left, two on the right on desktop, empty cells between and under them
 * with the diagonal in the last. The logotype in the bottom band, on the
 * right.
 *
 * Phone (25 November 2026): not the desktop panels squeezed — on 4 cells
 * they became two half-screen boxes, mostly empty. Instead one purpose a
 * row, the cells themselves the buttons: contact (call, write) across the
 * row; the address on 3 cells and "Où nous trouver" on the 4th; Instagram
 * and Facebook on 2 cells each; then the logotype large across the row.
 * The page links are left out — the menu is a thumb away.
 *
 * Type: 18px on a phone (the body size), 14px in the panels, 16px from
 * 1536px wide. Below 1280 the cells are too short for five links, so the
 * panels take 3 rows there, 2 from 1280. — Archivo
 * Condensed Light at 12px, as before, was hard to read.
 *
 * Legal links (26 November 2026): in the bottom band, on the left, opposite
 * the logotype — every size, phones included. A Belgian shop has to link its
 * legal notice, terms of sale and privacy policy from every page; they were
 * missing from this footer since it replaced the previous one.
 */
const PANEL = "flex min-w-0 flex-col gap-2 p-(--v2-pad)";
const LABEL = "font-owners-medium mb-1 text-[11px] uppercase tracking-wide";
const ITEM =
  "font-archivo-light text-[14px] leading-snug 2xl:text-[16px] 2xl:leading-normal";
/** Phone: one purpose a row, at the body size. */
const BIG = "font-archivo-light text-(length:--body-text) leading-snug";
/** A cell that is a link, on a phone: the whole block is the target. */
const CELL_LINK =
  "flex min-w-0 flex-col justify-end p-(--v2-pad) transition-colors duration-300 hover:bg-sky/25 md:hidden";
const LINK = `transition-opacity hover:opacity-60 ${ITEM}`;
const LEGAL =
  "font-archivo-light text-[11px] leading-snug transition-opacity hover:opacity-60 md:text-[12px]";

export function FooterCells() {
  const dict = useDictionary();
  const aboutNav = useAboutNav();
  // From the Studio's "Infos pratiques" once published, else lib/site.ts.
  const { contact, social } = useSiteDetails();
  const socialLinks = [
    { label: "Instagram", href: social.instagram },
    { label: "Facebook", href: social.facebook },
  ].filter((link) => Boolean(link.href));
  return (
    <footer className="relative w-full bg-cream text-black">
      <CellGrid
        lineClassName="bg-sky"
        readout={false}
        subdivide={2}
        diagonal="bottom-right"
      />
      <div
        className="relative grid [--rows:4]"
        style={{
          gridTemplateColumns: "var(--s-grid-columns)",
          // Rows of exact 3/4 cells.
          gridTemplateRows: "repeat(var(--rows), var(--s-cell-h))",
          paddingBlock: "var(--grid-band)",
        }}
      >
        <div
          data-grid-hole
          className={cn(
            PANEL,
            "hidden md:flex md:col-[2/span_3] md:row-[1/span_3] lg:col-[2/span_2] lg:row-[1/span_3] xl:row-[1/span_2]",
          )}
        >
          <p className={LABEL}>{dict.footer.explore}</p>
          {(["shop", "collaborations", "events", "coffee", "findUs"] as const).map(
            (key) => (
              <Link key={key} href={routes[key]} className={LINK}>
                {dict.nav[key]}
              </Link>
            ),
          )}
        </div>

        <div
          data-grid-hole
          className={cn(
            PANEL,
            "hidden md:flex md:col-[5/span_3] md:row-[1/span_3] lg:col-[4/span_2] lg:row-[1/span_3] xl:row-[1/span_2]",
          )}
        >
          <p className={LABEL}>{dict.footer.house}</p>
          {aboutNav.map(({ key, href }) => (
            <Link key={key} href={href} className={LINK}>
              {dict.aboutNav[key]}
            </Link>
          ))}
        </div>

        <div
          data-grid-hole
          className={cn(
            PANEL,
            "hidden md:flex md:col-[8/span_3] md:row-[1/span_3] lg:col-[14/span_2] lg:row-[1/span_3] xl:row-[1/span_2]",
          )}
        >
          <p className={LABEL}>{dict.footer.atelier}</p>
          <p className={ITEM}>{contact.street}</p>
          <p className={ITEM}>
            {contact.postalCode} {contact.city}
          </p>
          <Link
            href={routes.findUs}
            className={`${LINK} mt-1 underline underline-offset-2`}
          >
            {dict.aboutNav.findUs}
          </Link>
        </div>

        <div
          data-grid-hole
          className={cn(
            PANEL,
            "hidden md:flex md:col-[11/span_3] md:row-[1/span_3] lg:col-[16/span_2] lg:row-[1/span_3] xl:row-[1/span_2]",
          )}
        >
          <p className={LABEL}>{dict.footer.contact}</p>
          <a
            href={`tel:${contact.phone.replace(/\s+/g, "")}`}
            className={`${LINK} whitespace-nowrap`}
          >
            {contact.phone}
          </a>
          <a href={`mailto:${contact.email}`} className={LINK}>
            {contact.email.split("@")[0]}@<wbr />
            <span className="whitespace-nowrap">
              {contact.email.split("@")[1]}
            </span>
          </a>
          {socialLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${LINK} first-of-type:mt-2`}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Phone, row 1: call or write, across the row. */}
        <div
          data-grid-hole
          className="col-[2/span_4] row-[1] flex min-w-0 flex-col justify-between p-(--v2-pad) md:hidden"
        >
          <p className={LABEL}>{dict.footer.contact}</p>
          <div className="flex flex-col">
            <a
              href={`tel:${contact.phone.replace(/\s+/g, "")}`}
              className={`${BIG} self-start py-0.5 whitespace-nowrap`}
            >
              {contact.phone}
            </a>
            <a
              href={`mailto:${contact.email}`}
              className={`${BIG} self-start py-0.5`}
            >
              {contact.email}
            </a>
          </div>
        </div>

        {/* Row 2: the address on 3 cells, the way there on the 4th. */}
        <div
          data-grid-hole
          className="col-[2/span_3] row-[2] flex min-w-0 flex-col justify-between p-(--v2-pad) md:hidden"
        >
          <p className={LABEL}>{dict.footer.atelier}</p>
          <p className={BIG}>
            {contact.street}
            <br />
            {contact.postalCode} {contact.city}
          </p>
        </div>
        <Link
          href={routes.findUs}
          data-grid-hole
          className={cn(CELL_LINK, "col-[5/span_1] row-[2]")}
        >
          <span className="font-owners-medium text-[11px] leading-tight tracking-wide uppercase">
            {dict.aboutNav.findUs} &rarr;
          </span>
        </Link>

        {/* Row 3: the social accounts, 2 cells each. */}
        {socialLinks.map(({ label, href }, index) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            data-grid-hole
            className={cn(
              CELL_LINK,
              "row-[3]",
              index === 0 ? "col-[2/span_2]" : "col-[4/span_2]",
            )}
          >
            <span className="font-owners-medium text-[12px] tracking-wide uppercase">
              {label} {"↗"}
            </span>
          </a>
        ))}

        {/* Row 4: the logotype, large, across the row. */}
        <div
          data-grid-hole
          className="col-[2/span_4] row-[4] flex items-center justify-center md:hidden"
        >
          <Image
            src="/brand/Moment-Logotype.svg"
            alt="Moment"
            width={1437}
            height={220}
            className="h-auto w-[78%] brightness-0"
          />
        </div>
      </div>

      {/* The legal strip in the bottom band, on the left: © and the five
          legal pages (and cookie settings, once there are categories to
          set). Wraps onto a second line on a phone. */}
      <div
        className="absolute bottom-0 flex items-center"
        style={{
          height: "var(--grid-band)",
          left: "calc(var(--grid-margin) + var(--v2-pad))",
          right: "calc(var(--grid-margin) + var(--v2-pad))",
        }}
      >
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 md:max-w-[calc(100%-var(--s-cell-w)*2.2)] md:gap-x-4">
          <p className="font-archivo-light text-[11px] leading-snug md:text-[12px]">
            © {new Date().getFullYear()} <Brand />
          </p>
          {legalNav.map(({ key, href }) => (
            <Link key={href} href={href} className={LEGAL}>
              {dict.legalNav[key]}
            </Link>
          ))}
          {ENABLED_CONSENT_CATEGORIES.length > 0 && (
            <CookiePreferencesButton className={LEGAL} />
          )}
          {/* The checkout's payment methods, from Shopify. */}
          <PaymentMethodsRow
            label={dict.cart.securePayment}
            className="md:ml-2"
          />
        </div>
      </div>

      {/* The logotype in the bottom band, right-aligned on the last cell —
          tablet and desktop; a phone has it large in its last row. */}
      <div
        className="absolute bottom-0 hidden items-center md:flex"
        style={{
          height: "var(--grid-band)",
          right: "calc(var(--grid-margin) + var(--v2-pad))",
        }}
      >
        <Image
          src="/brand/Moment-Logotype.svg"
          alt="Moment"
          width={1437}
          height={220}
          className="h-auto w-[calc(var(--s-cell-w)*1.8)] brightness-0"
        />
      </div>
    </footer>
  );
}
