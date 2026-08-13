"use client";

import { LocaleLink as Link } from "@/components/LocaleLink";
import { useDictionary } from "@/components/LocaleProvider";
import { aboutNav } from "@/lib/routes";

const linkClassName =
  "group block w-full cursor-pointer py-2.5 font-owners-medium text-[12px] uppercase tracking-wide";

const linkLabelClassName = "animated-underline";

type AboutNavMenuProps = {
  onNavigate?: () => void;
};

/**
 * What sits behind "About": the story, the news, and eventually the FAQ.
 *
 * Deliberately not built on ShopNavMenu. That panel is a browse surface — a
 * column of collections against a live product preview — and three text links
 * dropped into it would read as a page that failed to load. The labels still
 * sit on the left in the same type; each row is a hit target across the
 * content columns so you don't have to aim at the letters, and stops at the
 * page padding. The panel opens only as far as its own content, so a short
 * list looks like a short list rather than an empty room.
 */
export function AboutNavMenu({ onNavigate }: AboutNavMenuProps) {
  const dict = useDictionary();

  return (
    <div
      className="grid border-t border-sky"
      style={{ gridTemplateColumns: "var(--grid-columns)" }}
    >
      <nav
        aria-label={dict.nav.about}
        className="col-start-2 col-end-9 flex flex-col self-start px-(--grid-gutter) pt-[4svh] pb-[4svh]"
      >
        {aboutNav.map(({ key, href }) => (
          <Link
            key={key}
            href={href}
            className={linkClassName}
            onClick={onNavigate}
          >
            <span className={linkLabelClassName}>{dict.aboutNav[key]}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
