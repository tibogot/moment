import { defineField, defineType } from "sanity";
import { photoAltField } from "../objects/photoAlt";
import { CaseIcon } from "@sanity/icons/Case";

/**
 * The two photographs on /coffee (27 November 2026). A singleton, pinned by
 * `sanity/structure.ts` to the document id `coffeePage`.
 *
 * The owners' coffee counter (27 November 2026): they asked for one or two
 * photos of it; a slot here lets them place and later change them without us. Same
 * rules as the home's photographs: an optional description (the alt text),
 * and an empty slot keeps the built-in one.
 */
export const coffeePage = defineType({
  name: "coffeePage",
  title: "Page Comptoir café",
  type: "document",
  icon: CaseIcon,
  fields: [
    defineField({
      name: "firstImage",
      title: "Grande photo",
      type: "image",
      description:
        "La grande photo verticale à gauche, sous le titre. Le comptoir en service, de préférence en hauteur (portrait).",
      options: { hotspot: true },
      fields: [photoAltField],
    }),
    defineField({
      name: "secondImage",
      title: "Deuxième photo",
      type: "image",
      description:
        "La photo plus petite, à droite et plus bas. Un détail (une tasse, le matcha, la machine) répond bien à la grande. En hauteur aussi.",
      options: { hotspot: true },
      fields: [photoAltField],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Page Comptoir café" }),
  },
});
