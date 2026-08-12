"use client";

import { LocaleLink as Link } from "@/components/LocaleLink";
import { useDictionary } from "@/components/LocaleProvider";
import { aboutNav } from "@/lib/routes";

const linkClassName =
  "group block w-full py-1 font-owners-medium text-[12px] uppercase tracking-wide";

const linkLabelClassName = "animated-underline";

type AboutNavMenuProps = {
  onNavigate?: () => void;
};

/**
 * What sits behind "About": the story, the news, and eventually the FAQ.
 *
 * Deliberately not built on ShopNavMenu. That panel is a browse surface — a
 * column of collections against a live product preview — and three text links
 * dropped into it would read as a page that failed to load. This is the same
 * left column and the same type, and nothing else: the panel opens only as far
 * as its own content, so a short list looks like a short list rather than an
 * empty room.
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
        className="col-start-2 col-end-4 flex flex-col gap-1 self-start px-(--grid-gutter) pt-[4svh] pb-[4svh]"
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
