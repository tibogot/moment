"use client";

import { NotFoundScreen } from "@/components/NotFoundScreen";
import { useDictionary } from "@/components/LocaleProvider";

/**
 * The 404 for anything inside a language segment that calls `notFound()` — a
 * dead product handle, a menu slug that no longer exists.
 *
 * Distinct from `app/global-not-found.tsx`, which answers URLs that match no
 * route at all. This one renders inside the locale layout, so it can read the
 * dictionary from context and answer in the language the visitor is browsing.
 */
export default function LocaleNotFound() {
  return <NotFoundScreen copy={useDictionary().common.notFound} />;
}
