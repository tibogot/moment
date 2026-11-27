import { defineField, defineType } from "sanity";
import { photoAltField } from "../objects/photoAlt";
import { CalendarIcon } from "@sanity/icons/Calendar";

/**
 * The two photographs on /events (27 November 2026). A singleton, pinned by
 * `sanity/structure.ts` to the document id `eventsPage`.
 *
 * The owners asked for photos of their own event tables, which they would
 * send; a slot here lets them place and later change them without us. Same
 * rules as the home's photographs: an optional description (the alt text),
 * and an empty slot keeps the built-in one.
 */
export const eventsPage = defineType({
  name: "eventsPage",
  title: "Page Événements",
  type: "document",
  icon: CalendarIcon,
  fields: [
    defineField({
      name: "firstImage",
      title: "Grande photo",
      type: "image",
      description:
        "La grande photo verticale à gauche, sous le titre. Une table dressée, un buffet : de préférence en hauteur (portrait).",
      options: { hotspot: true },
      fields: [photoAltField],
    }),
    defineField({
      name: "secondImage",
      title: "Deuxième photo",
      type: "image",
      description:
        "La photo plus petite, à droite et plus bas. Un détail (fleurs, plateau, comptoir) répond bien à la grande. En hauteur aussi.",
      options: { hotspot: true },
      fields: [photoAltField],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Page Événements" }),
  },
});
