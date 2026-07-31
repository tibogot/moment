import Image from "next/image";
import Link from "next/link";
import { CircleUserRound, Handbag, Search } from "lucide-react";

const navLinks = ["SHOP", "ABOUT", "COFFEE", "EVENT"] as const;

export function Navbar() {
  return (
    <header className="absolute inset-x-0 top-0 z-20 px-[18px] py-6">
      <nav className="grid grid-cols-3 items-center">
        <ul className="flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link}>
              <Link
                href={`/${link.toLowerCase()}`}
                className="font-owners-medium text-base uppercase tracking-wide text-cream transition-opacity hover:opacity-70"
              >
                {link}
              </Link>
            </li>
          ))}
        </ul>

        <Link href="/" className="flex justify-center">
          <Image
            src="/brand/logonav.svg"
            alt="Moment"
            width={155}
            height={29}
            priority
          />
        </Link>

        <div className="flex items-center justify-end gap-6">
          <button type="button" aria-label="Account" className="text-cream">
            <CircleUserRound size={20} strokeWidth={1.5} />
          </button>
          <button type="button" aria-label="Search" className="text-cream">
            <Search size={20} strokeWidth={1.5} />
          </button>
          <button type="button" aria-label="Bag" className="text-cream">
            <Handbag size={20} strokeWidth={1.5} />
          </button>
        </div>
      </nav>
    </header>
  );
}
