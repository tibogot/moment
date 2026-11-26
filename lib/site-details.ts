import { cache } from "react";
import { getPracticalInfo } from "@/lib/sanity/queries";
import {
  SITE_DETAILS,
  WEEKDAYS,
  type SiteDetails,
  type Weekday,
} from "@/lib/site";

/**
 * The company's facts as the site shows them: `SITE_DETAILS` with the Studio's
 * "Infos pratiques" over the phone, the e-mail, the hours and the social
 * accounts, once that document is published.
 *
 * Whole, not merged field by field: a published document replaces those
 * values outright (see sanity/schemaTypes/documents/practicalInfo.ts). The
 * address and the legal facts always come from code.
 *
 * Wrapped in React `cache` so a page, its metadata and the layout share one
 * read per request; the Sanity fetch itself is tagged `practicalInfo`.
 */
export const getSiteDetails = cache(async (): Promise<SiteDetails> => {
  const info = await getPracticalInfo();
  if (!info) return SITE_DETAILS;

  const days = WEEKDAYS.filter((day): day is Weekday =>
    info.openDays.includes(day),
  );

  return {
    ...SITE_DETAILS,
    contact: {
      ...SITE_DETAILS.contact,
      phone: info.phone,
      email: info.email,
    },
    hours: {
      opensAt: info.opensAt,
      closesAt: info.closesAt,
      days,
    },
    social: {
      instagram: info.instagram ?? "",
      facebook: info.facebook ?? "",
    },
  };
});
