"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CircleUserRound, Handbag, Menu, Search } from "lucide-react";
import { MobileNavMenu } from "@/components/MobileNavMenu";
import { mainNav, routes } from "@/lib/routes";

const iconStyle = { width: "var(--nav-icon)", height: "var(--nav-icon)" };

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  // The header inherits its colour from the parent — cream over the hero,
  // black on the cream pages — and min-h matches the band it fills in the
  // hero grid, so it also stands alone on the inner pages.
  return (
    <>
      <header
        className="z-20 col-span-full row-start-1 row-end-2 flex min-h-(--grid-band) items-center justify-between px-(--grid-inset) md:grid md:px-0"
        style={{ gridTemplateColumns: "var(--grid-columns)" }}
      >
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
          className="md:hidden"
        >
          <Menu style={iconStyle} strokeWidth={1.5} />
        </button>

        <ul
          className="hidden md:col-start-2 md:col-end-5 md:flex md:items-center md:gap-4 md:pl-(--grid-gutter)"
          style={{ fontSize: "var(--nav-text)" }}
        >
          {mainNav.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={href}
                className="font-owners-medium uppercase tracking-wide transition-opacity hover:opacity-70"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href={routes.home}
          className="flex justify-center md:col-start-5 md:col-end-6"
        >
          <Image
            src="/brand/logonav.svg"
            alt="Moment"
            width={110}
            height={21}
            preload
            className="h-auto"
            style={{ width: "var(--nav-logo)" }}
          />
        </Link>

        {/* Buttons rather than links until Shopify cart/search/account exist. */}
        <div className="flex items-center gap-4 md:col-start-6 md:col-end-9 md:justify-end md:pr-(--grid-gutter)">
          <button
            type="button"
            aria-label="Search"
            className="hidden md:block"
          >
            <Search style={iconStyle} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label="Account"
            className="hidden md:block"
          >
            <CircleUserRound style={iconStyle} strokeWidth={1.5} />
          </button>
          <button type="button" aria-label="Cart">
            <Handbag style={iconStyle} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <MobileNavMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
