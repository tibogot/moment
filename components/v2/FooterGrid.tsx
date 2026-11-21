"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { Brand } from "@/components/Brand";
import { CookiePreferencesButton } from "@/components/CookieConsent";
import { Lines } from "@/components/Lines";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { useDictionary } from "@/components/LocaleProvider";
import { CellGrid } from "@/components/v2/CellGrid";
import { ENABLED_CONSENT_CATEGORIES } from "@/lib/consent/categories";
import { aboutNav, legalNav, routes } from "@/lib/routes";
import { SITE_DETAILS, siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * The footer on the v2 grid. Same content as `components/Footer.tsx` — the
 * one still in use everywhere — without its animation; it replaces it once
 * it is right.
 *
 * Bands top and bottom like every v2 section, the cells between them, at
 * the hero's density from tablet up (12 columns on desktop, 9 on tablet, the
 * page's 4 on a phone), so the top and the bottom of every page share one
 * grid. Grid column 1 is the left margin, so cell n is grid column n + 1.
 *
 * The composition is Rond Carré's footer (the v1 one, from their mockup),
 * set on the finer grid: logo top-left in its own block, the four info boxes
 * along the top right, the signature large over two lines bottom-left, empty
 * cells bottom-right with the diagonal in the last. (A version that also
 * changed the composition, signature on one line, was dropped.)
 *
 * Placements, as cells (column · row, 1-based):
 *   desktop, 12 × 4   logo 1–2 · 1–2   explore 5–6   house 7–8   atelier 9–10
 *                     contact 11–12, all rows 1–2   signature 1–6 · 3–4
 *   tablet, 9 × 4     logo 1 · 1–2   explore 2–3   house 4–5   atelier 6–7
 *                     contact 8–9, all rows 1–2   signature 1–6 · 3–4
 *   mobile, 4 × 5     atelier 1–2 · 1–2   contact 3–4 · 1–2   logo 1 · 3
 *                     signature 1–4 · 4   legal 1–4 · 5
 *   legal: in the bottom band from tablet up.
 * Each info box is 2 × 2 small cells, a 3/4 block, like the can labels.
 *
 * Each info block is its own `data-grid-hole`: the rule inside it goes, the
 * rules between blocks stay, so each reads as its own panel — the can labels.
 */

const LABEL = "font-owners-medium text-[11px] uppercase tracking-wide";
const ITEM =
  "font-archivo-light text-[12px] leading-snug xl:text-[14px] xl:leading-normal";
const LINK = `transition-opacity hover:opacity-60 ${ITEM}`;
const LEGAL =
  "font-archivo-light text-[11px] leading-snug transition-opacity hover:opacity-60 md:text-[12px]";

const { contact, social } = SITE_DETAILS;
const phoneHref = `tel:${contact.phone.replace(/\s+/g, "")}`;
const socialLinks = [
  { label: "Instagram", href: social.instagram },
  { label: "Facebook", href: social.facebook },
].filter((link) => Boolean(link.href));

/**
 * One panel: a label, then its lines. Padded by --v2-pad, not the page
 * gutter — a cell is too narrow to lose a gutter on each side.
 */
function Panel({
  label,
  className,
  children,
}: {
  label: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <div
      data-grid-hole
      className={cn("flex min-w-0 flex-col gap-3 p-(--v2-pad)", className)}
    >
      <p className={LABEL}>{label}</p>
      <div className="flex min-w-0 flex-col gap-1">{children}</div>
    </div>
  );
}

function LegalLinks() {
  const dict = useDictionary();
  return (
    <>
      <p className="font-archivo-light shrink-0 text-[11px] leading-snug md:text-[12px]">
        © {new Date().getFullYear()} <Brand />
      </p>
      <ul className="flex flex-wrap gap-x-3 gap-y-1.5 md:justify-end md:gap-x-4">
        {ENABLED_CONSENT_CATEGORIES.length > 0 && (
          <li>
            <CookiePreferencesButton className={LEGAL} />
          </li>
        )}
        {legalNav.map(({ key, href }) => (
          <li key={href}>
            <Link href={href} className={LEGAL}>
              {dict.legalNav[key]}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * The footer's content (logo, signature, info boxes, legal links) is hidden
 * for now: the grid is settled, the content is being redesigned on it
 * (20 November 2026). Set back to true to show it.
 *
 * Before launch the legal links at least must be back: a Belgian shop has to
 * link its legal notice, privacy policy, terms and cookie settings from
 * every page.
 */
const SHOW_CONTENT = false;

export function FooterGrid() {
  const dict = useDictionary();

  return (
    <footer
      // The footer's own column count: the hero's density from tablet up
      // (9 / 12), the page's 4 on a phone. Placement and drawn cells share it.
      className="relative w-full bg-cream text-black [--f-cols:4] md:[--f-cols:9] lg:[--f-cols:12]"
    >
      {/* Subdivided like the hero; the brand card's diagonal in the last
          cell, bottom right. */}
      <CellGrid
        lineClassName="bg-sky"
        readout={false}
        subdivide={1.5}
        diagonal="bottom-right"
      />

      <div
        className="relative grid [--rows:5] md:[--rows:4]"
        style={{
          gridTemplateColumns:
            "var(--grid-margin) repeat(var(--f-cols), minmax(0, 1fr)) var(--grid-margin)",
          // A row is a cell of the footer's own grid: its width × 4/3.
          gridTemplateRows:
            "repeat(var(--rows), calc((100cqw - 2 * var(--grid-margin)) / var(--f-cols) * 4 / 3))",
          paddingBlock: "var(--grid-band)",
        }}
      >
        {SHOW_CONTENT && (
          <>
            {/* Logo, centred in its block: 2 × 2 cells on desktop (a 3/4 block),
            one cell × two rows on tablet, one cell on a phone. A hole, so no
            rule crosses it. */}
            <div
              data-grid-hole
              className="col-[2/span_1] row-[3/span_1] flex items-center justify-center md:row-[1/span_2] lg:col-[2/span_2]"
            >
              <Link href={routes.home} className="flex w-full justify-center">
                <Image
                  src="/brand/Moment-Logotype.svg"
                  alt={siteConfig.name}
                  translate="no"
                  width={1437}
                  height={220}
                  // The file is cream for the navbar; black here.
                  className="h-auto w-[70%] max-w-30 brightness-0"
                />
              </Link>
            </div>

            {/* The page links: tablet and desktop only — on a phone the menu is
            a thumb away, as in the current footer. */}
            <Panel
              label={dict.footer.explore}
              className="hidden md:col-[3/span_2] md:row-[1/span_2] md:flex lg:col-[6/span_2]"
            >
              {(["shop", "menus", "events", "coffee"] as const).map((key) => (
                <Link key={key} href={routes[key]} className={LINK}>
                  {dict.nav[key]}
                </Link>
              ))}
            </Panel>

            <Panel
              label={dict.footer.house}
              className="hidden md:col-[5/span_2] md:row-[1/span_2] md:flex lg:col-[8/span_2]"
            >
              {aboutNav.map(({ key, href }) => (
                <Link key={key} href={href} className={LINK}>
                  {dict.aboutNav[key]}
                </Link>
              ))}
            </Panel>

            <Panel
              label={dict.footer.atelier}
              className="col-[2/span_2] row-[1/span_2] md:col-[7/span_2] lg:col-[10/span_2]"
            >
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
            </Panel>

            <Panel
              label={dict.footer.contact}
              className="col-[4/span_2] row-[1/span_2] md:col-[9/span_2] lg:col-[12/span_2]"
            >
              <a href={phoneHref} className={`${LINK} whitespace-nowrap`}>
                {contact.phone}
              </a>
              {/* Allowed to wrap only after the @. */}
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
                  className={`${LINK} mt-1 first-of-type:mt-2`}
                >
                  {label}
                </a>
              ))}
            </Panel>

            {/* The signature, large over two lines, bottom-left, as in their
            footer, on the page inset like every headline. Sized to the
            footer's cells so it fits its block at any width. Deliberately
            French in all three languages: it echoes the name, it is not a
            sentence. */}
            <div
              data-grid-hole
              className="col-[2/span_4] row-[4/span_1] flex min-w-0 items-end px-(--grid-gutter) pb-(--v2-pad) md:col-[2/span_6] md:row-[3/span_2]"
            >
              <p
                translate="no"
                className="font-owners-narrow-bold max-w-full text-[13vw] leading-[0.88] tracking-[-0.005em] whitespace-nowrap uppercase md:text-[length:calc((100cqw-2*var(--grid-margin))/var(--f-cols)*0.95)]"
              >
                <Lines text={dict.footer.headline} />
              </p>
            </div>

            {/* Legal, phone: its own row — five links wrap past a band's
            height. */}
            <div
              data-grid-hole
              className="col-[2/span_4] row-[5/span_1] flex min-w-0 flex-col justify-center gap-2.5 px-(--grid-gutter) md:hidden"
            >
              <LegalLinks />
            </div>
          </>
        )}
      </div>

      {/* Legal, tablet and up: in the bottom band, on the page inset. */}
      {SHOW_CONTENT && (
        <div
          className="absolute inset-x-0 bottom-0 hidden items-center justify-between gap-8 md:flex"
          style={{
            height: "var(--grid-band)",
            paddingInline: "var(--grid-inset)",
          }}
        >
          <LegalLinks />
        </div>
      )}
    </footer>
  );
}
