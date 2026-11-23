import { LocaleLink as Link } from "@/components/LocaleLink";
import type { Locale } from "@/lib/i18n/config";
import { pick } from "@/lib/sanity/locale";
import type { AnnouncementContent } from "@/lib/sanity/queries";

/**
 * The one-line announcement across the top of every page, written in the
 * Studio ("Bandeau d'annonce"). Nothing renders when it is switched off.
 *
 * Fixed above the navbar rather than inside it: the navbar's appearance is a
 * GSAP timeline measured from its own band, and a line of text inside that
 * band would change every height it tweens between. The layout instead moves
 * the navbar and the page down by `--announcement-h` while the bar is on. Its
 * height (2.25rem) is set once, as a class on <body> in the layout.
 *
 * Styling is a placeholder in the site's own vocabulary (the sky-blue of the
 * calls to action, the small uppercase label face) until it is designed.
 */
export function AnnouncementBar({
  announcement,
  locale,
}: {
  announcement: AnnouncementContent;
  locale: Locale;
}) {
  const message = pick(announcement.message, locale);
  if (!message) return null;

  const label = announcement.linkLabel
    ? pick(announcement.linkLabel, locale)
    : "";
  const href = announcement.linkUrl ?? "";
  const external = href.startsWith("https://");
  const linkClassName = "underline underline-offset-2 hover:opacity-60";

  return (
    <aside
      className="fixed inset-x-0 top-0 z-40 flex items-center justify-center gap-3 bg-sky px-(--grid-gutter) text-center text-black"
      style={{ height: "var(--announcement-h)" }}
    >
      <p className="font-owners-medium truncate text-[11px] uppercase tracking-wide">
        {message}
        {label && href ? (
          <>
            {" "}
            {external ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClassName}
              >
                {label}
              </a>
            ) : (
              <Link href={href} className={linkClassName}>
                {label}
              </Link>
            )}
          </>
        ) : null}
      </p>
    </aside>
  );
}
