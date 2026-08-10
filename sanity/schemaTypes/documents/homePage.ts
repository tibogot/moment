import { defineField, defineType } from "sanity";
import { HomeIcon } from "@sanity/icons/Home";

/**
 * The photographs on the home page. A singleton, pinned by
 * `sanity/structure.ts` to the document id `homePage`.
 *
 * Images before copy, deliberately. A photograph has no language: replacing one
 * replaces it on all three versions of the site in a single gesture, where a
 * paragraph moved into the Studio would need writing three times and would go
 * stale in two of them the first time it was edited in a hurry.
 *
 * Only the slots that exist today. The rest of the home page still reads its
 * pictures from `public/images`, and a field offered here that nothing renders
 * would teach the owners not to trust the screen.
 *
 * There is no alt-text field on purpose: every one of these is decorative in
 * the layout — the headline beside the hero and the panel titles carry the
 * meaning, and the components render them with an empty `alt` so screen readers
 * skip past rather than announcing a photograph twice.
 */
export const homePage = defineType({
  name: "homePage",
  title: "Page d'accueil",
  type: "document",
  icon: HomeIcon,
  fields: [
    defineField({
      name: "heroImage",
      title: "Photo d'ouverture",
      type: "image",
      description:
        "La grande photo plein écran en haut de la page d'accueil. Elle est recadrée très différemment sur un téléphone et sur un écran large — après l'avoir chargée, cliquez sur « Edit » et placez le point important, c'est lui qui reste toujours visible.",
      options: { hotspot: true },
    }),

    defineField({
      name: "eventsImage",
      title: "Photo « Événements »",
      type: "image",
      description:
        "Le panneau de gauche, sous le texte d'introduction, qui mène à la page Événements.",
      options: { hotspot: true },
    }),

    defineField({
      name: "coffeeImage",
      title: "Photo « Comptoir café »",
      type: "image",
      description: "Le panneau de droite, qui mène à la page Café.",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { media: "heroImage" },
    prepare({ media }) {
      return { title: "Page d'accueil", subtitle: "Photographies", media };
    },
  },
});
