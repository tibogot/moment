import { defineField, defineType } from "sanity";

/**
 * Field-level translation: one document, three languages side by side.
 *
 * The alternative — one document per language — was rejected for menus because
 * the price, the minimum headcount and the notice period have no language.
 * Tripling a document triples those too, and gives a tariff three places to
 * drift apart. Here the numbers are shared and only the words are repeated.
 *
 * Side by side is the point. Translating is cheap now; *noticing that Dutch is
 * missing* is what costs, and a field showing all three at once makes the gap
 * visible at the moment of editing rather than months later on the live site.
 *
 * French is required and the others are not, because French is what the site
 * falls back to. A menu with no Dutch summary shows the French one; a menu with
 * no French anything would show nothing at all.
 */
const LANGUAGES = [
  { name: "fr", title: "Français" },
  { name: "nl", title: "Nederlands" },
  { name: "en", title: "English" },
] as const;

/** Collapsed by default, so a form of eight of these stays readable. */
const OPTIONS = { collapsible: true, collapsed: false } as const;

/** One line — a title, a caption. */
export const localeString = defineType({
  name: "localeString",
  title: "Texte",
  type: "object",
  options: OPTIONS,
  fields: LANGUAGES.map(({ name, title }) =>
    defineField({
      name,
      title,
      type: "string",
      validation: name === "fr" ? (rule) => rule.required() : undefined,
    }),
  ),
});

/** A paragraph. */
export const localeText = defineType({
  name: "localeText",
  title: "Texte long",
  type: "object",
  options: OPTIONS,
  fields: LANGUAGES.map(({ name, title }) =>
    defineField({ name, title, type: "text", rows: 3 }),
  ),
});

/**
 * A list of lines — the dishes in a course, what a price includes.
 *
 * The three lists are independent, so a Dutch translation can merge two lines
 * or split one. Trying to keep them index-aligned would be a rule nobody can
 * see in the Studio and everybody would break.
 */
export const localeStringList = defineType({
  name: "localeStringList",
  title: "Liste",
  type: "object",
  options: OPTIONS,
  fields: LANGUAGES.map(({ name, title }) =>
    defineField({
      name,
      title,
      type: "array",
      of: [{ type: "string" }],
    }),
  ),
});
