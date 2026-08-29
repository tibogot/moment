/**
 * Past events — the work already done, which /events shows as proof.
 *
 * A reference is not an article and not a menu. An article is editorial, one
 * per language, a couple a year; a menu is a price list. This is a record of a
 * job: a kind of event, a headcount, a commune, a date and photographs, added
 * after each one.
 *
 * The structure is the whole argument. A page that says "we cater beautiful
 * events" ranks for nothing and convinces nobody; a page carrying twenty lines
 * of the form "Réception · 120 personnes · Ixelles · mars 2025" answers the
 * three things a stranger is actually weighing — do they do my kind of event,
 * at my size, near me — and it does it in the words those people type. So the
 * facts are separate required fields in the Studio rather than one free-text
 * box, and `formatEventCaption` below is what guarantees every entry states all
 * of them.
 *
 * @see sanity/schemaTypes/documents/pastEvent.ts for the editing side.
 */

import type { PastEventsQueryResult } from "@/sanity.types";
import type { Locale } from "./i18n/config";
import { interpolate, type Dictionary } from "./i18n/dictionaries";
import { formatMonthYear } from "./i18n/format";
import { pick } from "./sanity/locale";

/**
 * One event as it comes back from `pastEventsQuery`, typed from the schema and
 * the query rather than by hand — including `occasion`, whose union is read off
 * the option list in the schema. Add a kind of event there and the dictionaries
 * below stop compiling until they name it, which is the point.
 */
export type PastEvent = PastEventsQueryResult[number];

export type EventOccasion = PastEvent["occasion"];

export type PastEventImage = PastEvent["images"][number];

/**
 * The order occasions are offered in — corporate first, private after, and
 * within each roughly from the most common to the least.
 *
 * `satisfies` rather than a plain array: it is a compile error for this list to
 * fall behind the schema, which is the failure that would otherwise drop a
 * whole category out of a filter without anyone noticing.
 */
export const EVENT_OCCASIONS = [
  "reception",
  "launch",
  "seminar",
  "businessLunch",
  "teamBuilding",
  "staffParty",
  "privateDinner",
  "celebration",
  "wedding",
  "communion",
  "funeral",
] as const satisfies readonly EventOccasion[];

/** The events page's own copy, in the language the page is being read in. */
export type EventCopy = Dictionary["events"];

/**
 * What each kind of event is called to a visitor. Taken as
 * `Record<EventOccasion, string>` rather than as the dictionary section, so a
 * caller handing over a dictionary that has fallen behind the schema fails at
 * the call site instead of rendering a raw key like `staffParty` into a page.
 */
export type EventOccasionLabels = Record<EventOccasion, string>;

/**
 * An event flattened into one language, with the fallbacks already applied —
 * the same division of labour as `resolveMenu`: this file knows a field might
 * be missing a translation, and the components downstream render plain strings.
 */
export type ResolvedPastEvent = Omit<PastEvent, "note" | "article"> & {
  note?: string;
  /**
   * Where it happened, as one string: the venue and the commune when the venue
   * is named and cleared for publication, the commune alone otherwise.
   */
  place: string;
  /**
   * The linked write-up, and only when it is written in the language being
   * read. An article exists in a single language and nothing links a French one
   * to its Dutch counterpart — see `articlesQuery` — so offering the link
   * regardless would send a Dutch reader to a page they cannot read, on the
   * page whose whole job is to look competent.
   */
  article: { title: string; slug: string } | null;
};

export function resolvePastEvent(
  event: PastEvent,
  locale: Locale,
): ResolvedPastEvent {
  const { note, article, venue, commune, ...rest } = event;

  return {
    ...rest,
    venue,
    commune,
    note: pick(note ?? undefined, locale),
    place: venue ? `${venue}, ${commune}` : commune,
    article:
      article && article.language === locale
        ? { title: article.title, slug: article.slug }
        : null,
  };
}

/**
 * The line under a photograph: what it was, how many people, where, and when.
 *
 * Assembled here rather than typed into the Studio because a caption someone
 * writes by hand is a caption that sometimes forgets the commune — and the
 * commune is the reason the section exists. Every entry gets the same four
 * facts in the same order, in the language being read.
 *
 * The separator matches `formatMenuTerms`, which sets the same kind of line
 * elsewhere on the site.
 */
export function formatEventCaption(
  locale: Locale,
  copy: EventCopy,
  occasions: EventOccasionLabels,
  event: ResolvedPastEvent,
) {
  return [
    occasions[event.occasion],
    formatGuests(copy, event.guests),
    event.place,
    formatMonthYear(locale, event.date),
  ]
    .filter(Boolean)
    .join(" · ");
}

/**
 * "120 personnes".
 *
 * Singular and plural are separate keys rather than a suffix added in code, for
 * the same reason as the notice period on a menu: the rule differs by language
 * and `interpolate` is deliberately not an ICU implementation.
 */
export function formatGuests(copy: EventCopy, guests: number) {
  return interpolate(guests === 1 ? copy.guestsOne : copy.guestsMany, {
    count: guests,
  });
}

/**
 * The events grouped by kind, in `EVENT_OCCASIONS` order, with empty kinds
 * dropped — for a page that wants headings per occasion rather than one flat
 * grid. Order within a group is whatever the query gave, which is featured
 * first and then newest.
 */
export function groupByOccasion(events: ResolvedPastEvent[]) {
  return EVENT_OCCASIONS.map((occasion) => ({
    occasion,
    events: events.filter((event) => event.occasion === occasion),
  })).filter((group) => group.events.length > 0);
}

/**
 * The headcounts catered, as a range — "de 12 à 240 personnes".
 *
 * Read off the references rather than written into the copy, because it is the
 * one claim on the page that dates itself: the day a bigger event is added, a
 * hand-written "jusqu'à 150" becomes an understatement nobody thinks to
 * correct. Returns null below two events, where a "range" would be a number
 * pretending to be evidence.
 */
export function formatGuestRange(
  copy: EventCopy,
  events: ResolvedPastEvent[],
) {
  if (events.length < 2) return null;

  const counts = events.map((event) => event.guests);
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  if (min === max) return null;

  return interpolate(copy.guestRange, { min, max });
}
