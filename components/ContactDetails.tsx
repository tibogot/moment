import { GridSection } from "@/components/GridSection";
import { interpolate, type Dictionary } from "@/lib/i18n/dictionaries";
import { formatWindow, type PickupWindow } from "@/lib/delivery/slots";
import {
  formatAddressLine,
  formatOpeningHours,
  type SiteDetails,
} from "@/lib/site";

/**
 * The standing facts: where the atelier is, when someone answers, and how to
 * reach them without filling anything in.
 *
 * Every value comes from `SiteDetails`, which the owners maintain in the
 * Studio — nothing here is typed into the markup. And every one of them can be
 * empty, because a Studio field can be: a row with nothing in it is dropped
 * rather than rendered as a label followed by a blank, which is the same rule
 * `compact` applies to the JSON-LD.
 *
 * The phone and the email are links. On a phone `tel:` dials, which is the
 * whole point of publishing a number for a caterer whose busiest enquiries
 * arrive at 11am from someone standing in an office kitchen.
 */
export function ContactDetails({
  t,
  details,
  pickupWindow,
}: {
  // The section it reads, not the whole dictionary: the page has already
  // resolved it, and asking for it again here would be a second read of a file
  // this component is not the owner of.
  t: Dictionary["contact"];
  details: SiteDetails;
  pickupWindow: PickupWindow;
}) {
  const address = formatAddressLine(details);
  const hours = formatOpeningHours(details);
  const { phone, email } = details.contact;

  // Nothing to say is a real state — a Studio nobody has filled in yet — and an
  // empty bordered block is worse than no block.
  if (!address && !hours && !phone && !email) return null;

  return (
    <GridSection className="pb-[14svh]">
      <div className="col-start-2 col-end-5 px-(--grid-gutter) md:col-end-8">
        <dl className="border-t border-sky md:grid md:grid-cols-2 md:gap-(--grid-gutter)">
          {address && (
            <div className="border-b border-sky py-[4svh] md:border-b-0">
              <dt className="font-owners-medium text-[13px] uppercase tracking-wide">
                {t.addressTitle}
              </dt>
              <dd className="font-archivo-light mt-3 text-[18px] leading-normal">
                {address}
                <span className="mt-2 block opacity-70">
                  {interpolate(t.pickupNote, {
                    window: formatWindow(pickupWindow),
                  })}
                </span>
              </dd>
            </div>
          )}

          {(hours || phone || email) && (
            <div className="border-b border-sky py-[4svh]">
              <dt className="font-owners-medium text-[13px] uppercase tracking-wide">
                {t.hoursTitle}
              </dt>
              <dd className="font-archivo-light mt-3 text-[18px] leading-normal">
                {hours && (
                  <span className="block">
                    {interpolate(t.hours, { hours })}
                  </span>
                )}
                {phone && (
                  <a
                    // Stripped of spaces for the dialler, shown with them for
                    // the reader: `tel:` is a machine-readable field and
                    // "+32 472 35 51 53" is a human-readable one.
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="mt-2 block underline underline-offset-4 transition-opacity hover:opacity-60"
                  >
                    {phone}
                  </a>
                )}
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="mt-1 block underline underline-offset-4 transition-opacity hover:opacity-60"
                  >
                    {email}
                  </a>
                )}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </GridSection>
  );
}
