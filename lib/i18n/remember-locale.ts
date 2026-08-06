import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, type Locale } from "./config";

/**
 * Records the language a visitor picked, so the bare domain can send them back
 * to it next time. Read by proxy.ts, and only for "/".
 *
 * A plain cookie write rather than the Cookie Store API, which Safari still
 * does not have. It lives out here rather than in the switcher because writing
 * to `document` inside a component body reads as a render side effect to the
 * lint rules — which is a fair thing for them to object to, even though this
 * only ever runs from a click.
 */
export function rememberLocale(locale: Locale) {
  if (typeof document === "undefined") return;

  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
}
