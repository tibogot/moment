import { defineField, defineType } from "sanity";
import { HomeIcon } from "@sanity/icons/Home";
import en from "@/lib/i18n/dictionaries/en.json";
import fr from "@/lib/i18n/dictionaries/fr.json";
import nl from "@/lib/i18n/dictionaries/nl.json";
import { localeFieldWithPlaceholders } from "../objects/locale";

/**
 * The photographs on the home page. A singleton, pinned by
 * `sanity/structure.ts` to the document id `homePage`.
 *
 * Images before copy, deliberately. A photograph has no language: replacing one
 * replaces it on all three versions of the site in a single gesture, where a
 * paragraph moved into the Studio would need writing three times and would go
 * stale in two of them the first time it was edited in a hurry.
 *
 * Only the slots that exist today, in the order they come down the v2 home
 * (25 November 2026): the hero, the three beats (la cuisine, la livraison,
 * la table), the three cards of « Pour chaque moment ». A field offered here
 * that nothing renders would teach the owners not to trust the screen; an
 * empty one leaves the built-in photograph in place.
 *
 * And the hero's two texts (25 November 2026), the one piece of copy here:
 * the line most likely to change with the season. Both fall back, field by
 * field and language by language, to the dictionaries' wording.
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
      name: "heroHeadline",
      title: "Titre d'ouverture",
      // One box, not three: the headline is the brand's slogan ("Life is
      // moments"), in English and the same on all three versions of the site.
      // The site's wording shown, greyed, while the box is empty.
      type: "text",
      rows: 2,
      placeholder: fr.home.heroPhoto.headline,
      description:
        "Le grand titre au centre de la photo d'ouverture, le même dans les trois langues (c'est votre slogan). Le texte en gris est celui affiché aujourd'hui : laissez la case vide pour le garder, ou écrivez par-dessus. Court : deux ou trois mots ; un retour à la ligne coupe le titre au même endroit sur le site.",
    }),

    defineField({
      name: "heroLead",
      title: "Phrase d'ouverture",
      ...localeFieldWithPlaceholders("string", {
        fr: fr.home.heroPhoto.lead,
        nl: nl.home.heroPhoto.lead,
        en: en.home.heroPhoto.lead,
      }),
      description:
        "La phrase sous le titre. Le texte en gris est celui affiché aujourd'hui : laissez vide pour le garder, ou écrivez par-dessus. Une phrase, sans prix ni horaire. Même règle pour les langues que pour le titre.",
    }),

    defineField({
      name: "heroImage",
      title: "Photo d'ouverture",
      type: "image",
      description:
        "La grande photo plein écran en haut de la page d'accueil. Elle est recadrée très différemment sur un téléphone et sur un écran large — après l'avoir chargée, cliquez sur l'icône de recadrage en haut à droite de la photo (« Rogner l'image ») et placez le point important, c'est lui qui reste toujours visible.",
      options: { hotspot: true },
    }),

    /**
     * Which way the type goes over the photograph. Chosen by a person, not
     * computed: a photo is rarely light or dark all over, and it is cropped
     * differently on a phone, so what matters is the part under the text on
     * both — which an eye sees and an average colour does not. Drives the
     * hero's text and lines and the navbar while it is transparent over it.
     */
    defineField({
      name: "heroTone",
      title: "La photo d'ouverture est…",
      type: "string",
      description:
        "Choisissez selon la zone sous le texte. Après avoir changé la photo ou ce réglage, vérifiez sur le site, sur ordinateur et sur téléphone, que le titre et le menu se lisent bien.",
      options: {
        list: [
          { title: "Sombre : texte et menu en blanc", value: "dark" },
          { title: "Claire : texte et menu en noir", value: "light" },
        ],
        layout: "radio",
      },
      initialValue: "dark",
    }),

    defineField({
      name: "kitchenImage",
      title: "Photo « La cuisine »",
      type: "image",
      description:
        "La grande photo verticale à droite du texte « La cuisine », sous le carrousel des produits.",
      options: { hotspot: true },
    }),

    defineField({
      name: "deliveryImage",
      title: "Photo « Livraison »",
      type: "image",
      description:
        "La grande photo verticale à gauche du texte « Livraison », sur fond bleu.",
      options: { hotspot: true },
    }),

    defineField({
      name: "hostingImage",
      title: "Photo « La table »",
      type: "image",
      description: "La grande photo verticale à droite du texte « La table ».",
      options: { hotspot: true },
    }),

    defineField({
      name: "eventsImage",
      title: "Photo « Événements »",
      type: "image",
      description:
        "La carte « Événements » de la section « Pour chaque moment », qui mène à la page Événements.",
      options: { hotspot: true },
    }),

    defineField({
      name: "companiesImage",
      title: "Photo « Entreprises »",
      type: "image",
      description:
        "La carte « Entreprises » de la section « Pour chaque moment », qui mène à l'espace professionnel.",
      options: { hotspot: true },
    }),

    defineField({
      name: "coffeeImage",
      title: "Photo « Coffee desk »",
      type: "image",
      description:
        "La carte « Coffee desk » de la section « Pour chaque moment », qui mène à la page Café.",
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
