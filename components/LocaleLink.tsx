"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { withLocale } from "@/lib/i18n/config";
import { useLocale } from "@/components/LocaleProvider";

/**
 * `next/link` with the current language on the front of the href.
 *
 * Imported as `Link` at every call site, so adopting it is a one-line change
 * per file rather than an edit to each of eighty-odd hrefs. The proxy would
 * have prefixed these anyway, but only by issuing a redirect on every
 * navigation — which on a site built around quick transitions is exactly the
 * wrong place to spend a round trip.
 *
 * Not everything gets prefixed. `/api/auth/login` has no language and would
 * 404 with one, an anchor is a position on the page already being read, and an
 * absolute URL belongs to somebody else.
 */
type LocaleLinkProps = ComponentProps<typeof NextLink>;

function isLocalisable(href: LocaleLinkProps["href"]): href is string {
  return (
    typeof href === "string" &&
    href.startsWith("/") &&
    !href.startsWith("//") &&
    !href.startsWith("/api/")
  );
}

export function LocaleLink({ href, ...props }: LocaleLinkProps) {
  const locale = useLocale();

  return (
    <NextLink
      href={isLocalisable(href) ? withLocale(href, locale) : href}
      {...props}
    />
  );
}

export default LocaleLink;
