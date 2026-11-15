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
 * Bands top and bottom like every v2 section, the cells between them. Grid
 * column 1 is the left margin, so cell n is grid column n + 1. The section is
 * a whole number of rows tall (--rows per breakpoint).
 *
 * Placements, as cells (column·row, 1-based — Shift + G shows them):
 *   mobile, 4 × 5    atelier 1–2 · 1–2   contact 3–4 · 1–2   logo 1 · 3
 *                    signature 1–4 · 4   legal 1–4 · 5
 *   tablet, 6 × 3    logo 1 · 1   explore 3 · 1–2   house 4 · 1–2
 *                    atelier 5 · 1–2   contact 6 · 1–2   signature 1–6 · 3
 *   desktop, 8 × 3   logo 1 · 1   explore 5 · 1   house 6 · 1
 *                    atelier 7 · 1   contact 8 · 1   signature 1–4 · 2–3
 *   (from 1280px a cell is big enough for each block — measured; from
 *   1024 to 1279 "Comment ça marche ?" wraps, so the blocks take rows 1–2
 *   and the signature row 3, as on tablet)
 *   legal: in the bottom band from tablet up.
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

export function FooterGrid() {
  const dict = useDictionary();

  return (
    <footer className="relative w-full bg-cream text-black">
      {/* The brand card's diagonal, in the last cell — bottom right. */}
      <CellGrid
        lineClassName="bg-sky"
        readout={false}
        diagonal="bottom-right"
      />

      <div
        className="relative grid [--rows:5] md:[--rows:3]"
        style={{
          gridTemplateColumns: "var(--v2-columns)",
          gridTemplateRows: "repeat(var(--rows), var(--v2-row))",
          paddingBlock: "var(--grid-band)",
        }}
      >
        {/* Logo, alone in its cell and centred in it, as on the card. */}
        <div className="col-[2/span_1] row-[3/span_1] flex items-center justify-center md:row-[1/span_1]">
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

        {/* The page links: desktop and tablet only — on a phone the menu is
            a thumb away, as in the current footer. */}
        <Panel
          label={dict.footer.explore}
          className="hidden md:col-[4/span_1] md:row-[1/span_2] md:flex lg:col-[6/span_1] xl:row-[1/span_1]"
        >
          {(["shop", "menus", "events", "coffee"] as const).map((key) => (
            <Link key={key} href={routes[key]} className={LINK}>
              {dict.nav[key]}
            </Link>
          ))}
        </Panel>

        <Panel
          label={dict.footer.house}
          className="hidden md:col-[5/span_1] md:row-[1/span_2] md:flex lg:col-[7/span_1] xl:row-[1/span_1]"
        >
          {aboutNav.map(({ key, href }) => (
            <Link key={key} href={href} className={LINK}>
              {dict.aboutNav[key]}
            </Link>
          ))}
        </Panel>

        <Panel
          label={dict.footer.atelier}
          className="col-[2/span_2] row-[1/span_2] md:col-[6/span_1] lg:col-[8/span_1] xl:row-[1/span_1]"
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
          className="col-[4/span_2] row-[1/span_2] md:col-[7/span_1] lg:col-[9/span_1] xl:row-[1/span_1]"
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

        {/* The signature, bottom-aligned in its row, on the page inset like
            every headline. Deliberately French in all three languages, as in
            the current footer: it echoes the name, it is not a sentence. */}
        <div
          data-grid-hole
          className="col-[2/span_4] row-[4/span_1] flex min-w-0 items-end px-(--grid-gutter) pb-(--v2-pad) md:col-[2/span_6] md:row-[3/span_1] lg:col-[2/span_4] xl:row-[2/span_2]"
        >
          <p
            translate="no"
            className="font-owners-narrow-bold max-w-full text-[13vw] leading-[0.88] tracking-[-0.005em] wrap-break-word uppercase md:text-[min(7vw,12svh)]"
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
      </div>

      {/* Legal, tablet and up: in the bottom band, on the page inset. */}
      <div
        className="absolute inset-x-0 bottom-0 hidden items-center justify-between gap-8 md:flex"
        style={{
          height: "var(--grid-band)",
          paddingInline: "var(--grid-inset)",
        }}
      >
        <LegalLinks />
      </div>
    </footer>
  );
}
