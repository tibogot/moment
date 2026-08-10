import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  localeFromPath,
} from "@/lib/i18n/config";

/**
 * Puts a language on every URL that does not already have one.
 *
 * This is `proxy.ts`, not `middleware.ts`: the middleware convention is
 * deprecated in this version of Next and renamed to proxy. Most i18n libraries
 * and every tutorial still document the old name.
 *
 * Deliberately *not* content negotiation. The obvious implementation reads
 * `Accept-Language` and redirects accordingly, and it is what the Next guide
 * shows, but it is a bad trade for a site that wants to be found: Googlebot
 * crawls with `en-US`, so it would only ever be shown the English site, and the
 * French pages — the ones this business actually ranks on — would go unindexed.
 * A visitor whose browser is set to Dutch is one click from Dutch. A page
 * Google never sees is not one click from anything.
 *
 * So: everything lands on French unless the URL says otherwise, with one
 * exception below.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (localeFromPath(pathname)) return NextResponse.next();

  // The only place a preference is honoured is the bare domain, and only from
  // a cookie this site set itself when the visitor used the switcher. A
  // crawler has no cookie and therefore always sees French here, which is the
  // property that makes this safe.
  const remembered = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale =
    pathname === "/" && isLocale(remembered) ? remembered : DEFAULT_LOCALE;

  // Everything else keeps its path and gains a prefix, so the URLs this site
  // shipped with — /shop, /cart — still resolve instead of 404ing.
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  url.search = search;

  return NextResponse.redirect(url);
}

export const config = {
  /**
   * Skips Next's internals and anything with a file extension. The negative
   * lookahead is doing the real work: without it the redirect would also catch
   * /api/cart, every image, and the metadata routes that must stay unprefixed
   * because search engines and browsers look for them at fixed paths.
   *
   * `studio` is in there for the same reason: the Sanity Studio has its own
   * routing and its own language handling, and a /fr prefix in front of it
   * means it never mounts at all.
   */
  matcher: [
    "/((?!_next|api|studio|.*\\..*|opengraph-image|icon|robots\\.txt|sitemap\\.xml).*)",
  ],
};
