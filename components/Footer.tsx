import Image from "next/image";
import Link from "next/link";

const footerLinks = [
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Coffee", href: "/coffee" },
  { label: "Event", href: "/event" },
  { label: "Contact", href: "/contact" },
] as const;

const socialLinks = [
  { label: "Instagram", href: "#", icon: "/brand/instagram.svg" },
  { label: "Facebook", href: "#", icon: "/brand/facebook.svg" },
  { label: "Twitter", href: "#", icon: "/brand/twitter.svg" },
] as const;

export function Footer() {
  return (
    <footer className="bg-black px-[18px] py-12 text-cream">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-4">
          <Image
            src="/brand/logonav.svg"
            alt="Moment"
            width={155}
            height={29}
          />
          <p className="font-archivo-light max-w-xs text-sm leading-relaxed text-cream/70">
            Coffee, community, and curated moments — all in one place.
          </p>
        </div>

        <nav>
          <ul className="flex flex-col gap-3">
            {footerLinks.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="font-owners-medium text-sm uppercase tracking-wide transition-opacity hover:opacity-70"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-4">
          <p className="font-owners-medium text-sm uppercase tracking-wide">
            Follow us
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="opacity-80 transition-opacity hover:opacity-100"
              >
                <Image src={icon} alt="" width={20} height={20} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-cream/20 pt-6">
        <p className="font-archivo-light text-xs text-cream/50">
          © {new Date().getFullYear()} Moment. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
