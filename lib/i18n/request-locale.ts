import type { NextRequest } from "next/server";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  localeFromPath,
  type Locale,
} from "./config";

/**
 * The language of a request to a route outside `app/[lang]` — the auth
 * handlers — which has no segment to read one from.
 *
 * In order: the path the customer is heading back to, which the sign-in link
 * sets and which is the most specific answer there is; then the language they
 * last picked on the switcher; then the default.
 */
export function requestLocale(
  request: NextRequest,
  returnPath?: string | null,
): Locale {
  const fromPath = returnPath ? localeFromPath(returnPath) : null;
  if (fromPath) return fromPath;

  const remembered = request.cookies.get(LOCALE_COOKIE)?.value;
  return isLocale(remembered) ? remembered : DEFAULT_LOCALE;
}
