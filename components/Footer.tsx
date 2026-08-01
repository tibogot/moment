import Image from "next/image";
import Link from "next/link";
import { GridLines } from "@/components/GridLines";
import { mainNav, routes } from "@/lib/routes";
import { siteConfig } from "@/lib/site";

const socialLinks = [
  { label: "Instagram", href: siteConfig.social.instagram, icon: "/brand/instagram.svg" },
  { label: "Facebook", href: siteConfig.social.facebook, icon: "/brand/facebook.svg" },
  { label: "Twitter", href: "#", icon: "/brand/twitter.svg" },
] as const;

const headingClassName =
  "font-owners-medium text-[11px] uppercase tracking-wide";

const linkClassName =
  "font-owners-medium text-[12px] uppercase tracking-wide transition-opacity hover:opacity-60";

export function Footer() {
  return (
    <footer className="relative w-full border-t border-sky bg-cream text-black">
      <GridLines lineClassName="bg-sky" />

      <div
        className="relative grid gap-y-[6svh] pt-[10svh] pb-[5svh]"
        style={{ gridTemplateColumns: "var(--grid-columns)" }}
      >
        <div className="col-start-2 col-end-5 px-(--grid-gutter) md:col-end-5">
          <Link href={routes.home} className="inline-flex">
            <Image
              src="/brand/logonav.svg"
              alt={siteConfig.name}
              width={155}
              height={29}
              className="h-auto w-[128px]"
              style={{ filter: "brightness(0)" }}
            />
          </Link>
          <p className="font-archivo-light mt-5 max-w-xs text-[14px] leading-[1.5]">
            {siteConfig.description}
          </p>
        </div>

        <nav className="col-start-2 col-end-5 px-(--grid-gutter) md:col-start-5 md:col-end-7">
          <p className={headingClassName}>Menu</p>
          <ul className="mt-5 flex flex-col gap-3">
            {mainNav.map(({ label, href }) => (
              <li key={href}>
                <Link href={href} className={linkClassName}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="col-start-2 col-end-5 px-(--grid-gutter) md:col-start-7 md:col-end-9">
          <p className={headingClassName}>Follow us</p>
          <div className="mt-5 flex items-center gap-4">
            {socialLinks.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href || "#"}
                aria-label={label}
                className="opacity-80 transition-opacity hover:opacity-100"
              >
                <Image src={icon} alt="" width={18} height={18} />
              </a>
            ))}
          </div>
          <p className="font-archivo-light mt-5 text-[14px] leading-[1.5]">
            {siteConfig.contact.city}, {siteConfig.contact.country}
          </p>
        </div>

        {/* Full-bleed rule: it breaks out of the column tracks so it runs the
            whole width of the screen, unlike the inset rules above. */}
        <div className="col-span-full h-px bg-sky" />

        <div className="col-start-2 col-end-5 px-(--grid-gutter) md:col-end-9">
          <p className="font-archivo-light text-[12px]">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
