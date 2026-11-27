import type { Locale } from "@/lib/i18n/config";
import { pick, type LocaleString } from "@/lib/sanity/locale";

/**
 * A Studio photo's description in this language (sanity/schemaTypes/objects/
 * photoAlt.ts), or "" — decorative — when there is none or no photo.
 */
export function photoAlt(image: unknown, locale: Locale): string {
  const alt = (image as { alt?: LocaleString | string } | null | undefined)
    ?.alt;
  return pick(alt ?? undefined, locale)?.trim() ?? "";
}
