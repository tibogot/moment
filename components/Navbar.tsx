import Image from "next/image";
import Link from "next/link";
import { CircleUserRound, Handbag, Search } from "lucide-react";

const navLinks = ["HOME", "ABOUT", "CONTACT"] as const;

const iconStyle = { width: "var(--nav-icon)", height: "var(--nav-icon)" };

export function Navbar() {
  return (
    <header
      className="z-20 col-span-full row-start-1 row-end-2 flex items-center justify-between px-(--grid-inset) text-cream md:grid md:px-0"
      style={{ gridTemplateColumns: "var(--grid-columns)" }}
    >
      <ul
        className="flex items-center gap-3 md:col-start-2 md:col-end-4 md:gap-4 md:pl-(--grid-gutter)"
        style={{ fontSize: "var(--nav-text)" }}
      >
        {navLinks.map((link) => (
          <li key={link}>
            <Link
              href={`/${link.toLowerCase()}`}
              className="font-owners-medium uppercase tracking-wide transition-opacity hover:opacity-70"
            >
              {link}
            </Link>
          </li>
        ))}
      </ul>

      <Link href="/" className="flex justify-center md:col-start-5 md:col-end-6">
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

      <div className="flex items-center gap-3 md:col-start-7 md:col-end-9 md:justify-end md:gap-4 md:pr-(--grid-gutter)">
        <button type="button" aria-label="Bag">
          <Handbag style={iconStyle} strokeWidth={1.5} />
        </button>
        <button type="button" aria-label="Search">
          <Search style={iconStyle} strokeWidth={1.5} />
        </button>
        <button type="button" aria-label="Account">
          <CircleUserRound style={iconStyle} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
