"use client";

import { Brand } from "@/components/Brand";
import Image from "next/image";
import { Lines } from "@/components/Lines";
import { useDictionary } from "@/components/LocaleProvider";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { CookiePreferencesButton } from "@/components/CookieConsent";
import { FooterGridCells } from "@/components/FooterGridCells";
import { GridLines } from "@/components/GridLines";
import { GRID_COLUMNS, GRID_COLUMNS_MOBILE, type GridHole } from "@/lib/grid";
import { ENABLED_CONSENT_CATEGORIES } from "@/lib/consent/categories";
import { aboutNav, legalNav, routes } from "@/lib/routes";
import { SITE_DETAILS, siteConfig } from "@/lib/site";

/**
 * Same system as the hero: a full ruled field, with a hole only where the
 * headline sits so the sky squares stay intact everywhere else.
 */
const holes: GridHole[] = [
  { col: [1, 4], row: [2, 3] }, // headline
];

const mobileHoles: GridHole[] = [
  { col: [1, 3], row: [2, 3] }, // headline
];

const LABEL = "font-owners-medium text-[11px] uppercase tracking-wide";
const ITEM =
  "font-archivo-light text-[12px] leading-snug xl:text-[14px] xl:leading-normal";
const LINK = `pointer-events-auto transition-opacity hover:opacity-60 ${ITEM}`;

const { contact, social } = SITE_DETAILS;
const phoneHref = `tel:${contact.phone.replace(/\s+/g, "")}`;
const socialLinks = [
  { label: "Instagram", href: social.instagram },
  { label: "Facebook", href: social.facebook },
].filter((link) => Boolean(link.href));

/**
 * One square of the top row: a small label, then its lines. Padded less than
 * the page gutter, which at desktop widths would leave a column's square about
 * eighty pixels to write in.
 */
function InfoCell({
  label,
  className,
  children,
}: {
  label: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-3 px-3 py-4 xl:px-4 xl:py-5 ${className}`}>
      <p className={LABEL}>{label}</p>
      <div className="flex min-w-0 flex-col gap-1">{children}</div>
    </div>
  );
}

const legalLinkClassName =
  "font-archivo-light text-[11px] leading-snug transition-opacity hover:opacity-60 md:text-[12px]";

export function Footer() {
  const dict = useDictionary();

  return (
    <footer className="site-footer relative h-[90svh] w-full overflow-hidden bg-cream text-black md:h-[80svh]">
      <FooterGridCells
        columns={GRID_COLUMNS_MOBILE}
        holes={mobileHoles}
        className="md:hidden"
      />
      <FooterGridCells
        columns={GRID_COLUMNS}
        holes={holes}
        className="hidden md:grid"
      />

      <GridLines
        ruled
        columns={GRID_COLUMNS_MOBILE}
        holes={mobileHoles}
        lineClassName="bg-sky"
        className="md:hidden"
      />
      <GridLines
        ruled
        columns={GRID_COLUMNS}
        holes={holes}
        lineClassName="bg-sky"
        className="hidden md:block"
      />

      <div
        className="pointer-events-none absolute inset-0 z-10 grid"
        style={{
          gridTemplateColumns: "var(--grid-columns)",
          gridTemplateRows: "var(--grid-rows)",
        }}
      >
        {/* Logo sits inside the first cell of the ruled field — the square
            directly above the headline — so the box frames it. Sized as a
            share of the cell rather than in px, since the cell is a column
            wide and that changes with the viewport. */}
        <div className="col-start-2 col-end-3 row-start-2 row-end-3 flex items-center justify-center">
          <Link
            href={routes.home}
            className="pointer-events-auto flex w-full justify-center"
          >
            <Image
              src="/brand/Moment-Logotype.svg"
              alt={siteConfig.name}
              translate="no"
              width={1437}
              height={220}
              className="h-auto w-[62%] max-w-30"
              style={{ filter: "brightness(0)" }}
            />
          </Link>
        </div>

        {/* The top row's squares carry what a footer is looked at for — where
            the atelier is, how to reach it, the main pages — one subject per
            square, so the ruled field stays a field rather than a column of
            text. Desktop only for the page links; on a phone the menu is a
            thumb away and the two free squares go to the address and contact. */}
        <InfoCell
          label={dict.footer.explore}
          className="hidden md:col-start-5 md:col-end-6 md:row-start-2 md:row-end-3 md:flex"
        >
          {(["shop", "menus", "events", "coffee"] as const).map((key) => (
            <Link key={key} href={routes[key]} className={LINK}>
              {dict.nav[key]}
            </Link>
          ))}
        </InfoCell>

        <InfoCell
          label={dict.footer.house}
          className="hidden md:col-start-6 md:col-end-7 md:row-start-2 md:row-end-3 md:flex"
        >
          {aboutNav.map(({ key, href }) => (
            <Link key={key} href={href} className={LINK}>
              {dict.aboutNav[key]}
            </Link>
          ))}
        </InfoCell>

        <InfoCell
          label={dict.footer.atelier}
          className="col-start-3 col-end-4 row-start-2 row-end-3 md:col-start-7 md:col-end-8"
        >
          <p className={ITEM}>{contact.street}</p>
          <p className={ITEM}>
            {contact.postalCode} {contact.city}
          </p>
          <Link href={routes.findUs} className={`${LINK} mt-1 underline underline-offset-2`}>
            {dict.aboutNav.findUs}
          </Link>
        </InfoCell>

        <InfoCell
          label={dict.footer.contact}
          className="col-start-4 col-end-5 row-start-2 row-end-3 md:col-start-8 md:col-end-9"
        >
          <a href={phoneHref} className={`${LINK} whitespace-nowrap`}>
            {contact.phone}
          </a>
          {/* Allowed to wrap only after the @: a phone's square is narrower
              than the address, and a break anywhere else strands two letters. */}
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
        </InfoCell>

        {/* Headline — open across the left; the rest of the field stays squared. */}
        <div className="col-start-2 col-end-5 row-start-3 row-end-5 min-w-0 self-end pb-5 pl-(--grid-gutter) text-left md:col-end-6 md:pb-[4svh]">
          {/* Deliberately French in all three languages — it echoes the company
              name and reads as a signature rather than a sentence. Which is
              exactly what a translate bar would undo. */}
          <p
            translate="no"
            className="font-owners-narrow-bold max-w-full text-[13vw] leading-[0.88] tracking-[-0.005em] wrap-break-word uppercase md:text-[min(7vw,12svh)]"
          >
            <Lines text={dict.footer.headline} />
          </p>
        </div>

        {/* Copyright + Belgian legal links in the bottom band. */}
        <div className="col-start-2 col-end-5 row-start-5 row-end-6 flex flex-col justify-center gap-2.5 px-(--grid-gutter) md:col-end-9 md:flex-row md:items-center md:justify-between md:gap-8">
          <p className="font-archivo-light shrink-0 text-[11px] leading-snug md:text-[12px]">
            © {new Date().getFullYear()} <Brand />
          </p>
          <ul className="flex flex-wrap gap-x-3 gap-y-1.5 md:justify-end md:gap-x-4 md:gap-y-2">
            {ENABLED_CONSENT_CATEGORIES.length > 0 && (
              <li>
                <CookiePreferencesButton
                  className={`pointer-events-auto ${legalLinkClassName}`}
                />
              </li>
            )}
            {legalNav.map(({ key, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`pointer-events-auto ${legalLinkClassName}`}
                >
                  {dict.legalNav[key]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
