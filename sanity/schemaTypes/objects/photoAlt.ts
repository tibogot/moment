import { defineField } from "sanity";

/**
 * The description of a page photograph (27 November 2026), in three
 * languages, optional. Filled in, it is the photo's alt text — read to people
 * who cannot see it, and what Google Images reads. Left empty, the photo is
 * treated as decorative (an empty alt), which is valid next to a heading that
 * already says what it shows. Read by `photoAlt` in lib/sanity/photo-alt.ts.
 */
export const photoAltField = defineField({
  name: "alt",
  title: "Description de la photo",
  type: "localeString",
  description:
    "Facultatif. Ce que montre la photo, en une phrase : « Buffet de salades et de jus pressés sur une table dressée ». Lue aux personnes malvoyantes et utilisée par Google Images. Le néerlandais et l'anglais reprennent le français s'ils sont vides.",
});
