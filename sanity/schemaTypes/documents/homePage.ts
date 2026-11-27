import { defineField, defineType } from "sanity";
import { photoRules } from "../objects/photoRules";
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
      title: "Signature",
      // One box, not three: the headline is the brand's slogan ("Life is
      // moments"), in English and the same on all three versions of the site.
      // The site's wording shown, greyed, while the box is empty.
      type: "string",
      placeholder: fr.home.heroPhoto.headline.replace(/\s+/g, " "),
      description:
        "Votre signature, affichée en petit entre parenthèses au centre de la photo d'ouverture, la même dans les trois langues. Le texte en gris est celui affiché aujourd'hui : laissez la case vide pour le garder, ou écrivez par-dessus. Les parenthèses sont ajoutées par le site.",
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
        "Facultatif : aujourd'hui il n'y a pas de phrase sous la signature (votre demande du 26 novembre). Si vous en écrivez une, elle apparaît juste en dessous. Une phrase, sans prix ni horaire. Le néerlandais et l'anglais sont facultatifs : sans traduction, le français s'affiche.",
    }),

    defineField({
      name: "heroImage",
      title: "Photo d'ouverture",
      type: "image",
      description:
        "La grande photo plein écran en haut de la page d'accueil. Elle est recadrée très différemment sur un téléphone et sur un écran large — après l'avoir chargée, cliquez sur l'icône de recadrage en haut à droite de la photo (« Rogner l'image ») et placez le point important, c'est lui qui reste toujours visible. Aujourd'hui, case vide : votre table vue du dessus (la photo de votre document).",
      options: { hotspot: true },
      validation: photoRules(2400),
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
        "« Sombre » (texte et menu en blanc) convient à la plupart des photos, avec le voile ci-dessous. Après avoir changé la photo ou ce réglage, vérifiez sur le site, sur ordinateur et sur téléphone, que la signature et le menu se lisent bien.",
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
      name: "heroVeil",
      title: "Assombrir légèrement la photo",
      type: "boolean",
      description:
        "Un voile sombre très léger, plus marqué au centre, pour que le texte et le menu blancs se lisent partout. Seulement avec « Sombre ». Décochez si la photo est déjà assez foncée.",
      initialValue: true,
    }),

    defineField({
      name: "kitchenImage",
      title: "Photo « La cuisine »",
      type: "image",
      description:
        "La grande photo verticale à droite du texte « Dans notre atelier à Forest », sous le carrousel des produits. Aujourd'hui, case vide : vos salades avec leur carte (la photo de votre document).",
      options: { hotspot: true },
      validation: photoRules(1600),
    }),

    defineField({
      name: "deliveryImage",
      title: "Photo « Livraison »",
      type: "image",
      description:
        "La grande photo verticale à gauche du texte « Nous vous livrons », sur fond bleu. Aujourd'hui, case vide : les boîtes Moment empilées (la photo de votre document).",
      options: { hotspot: true },
      validation: photoRules(1600),
    }),

    defineField({
      name: "hostingImage",
      title: "Photo « La table »",
      type: "image",
      // The section left the home on 27 November 2026 (the owners' request).
      hidden: true,
      description: "La grande photo verticale à droite du texte « La table ».",
      options: { hotspot: true },
    }),

    defineField({
      name: "eventsImage",
      title: "Photo « Événements »",
      type: "image",
      description:
        "La carte « Événements » de la section « Pour chaque moment », qui mène à la page Événements. Aujourd'hui, case vide : une photo d'illustration, à remplacer par l'une de vos tables.",
      options: { hotspot: true },
      validation: photoRules(1600),
    }),

    defineField({
      name: "companiesImage",
      title: "Photo « Entreprises & catering »",
      type: "image",
      description:
        "La carte « Entreprises & catering » de la section « Pour chaque moment », qui mène à l'espace professionnel. Aujourd'hui, case vide : une photo d'illustration, à remplacer par l'une des vôtres.",
      options: { hotspot: true },
      validation: photoRules(1600),
    }),

    defineField({
      name: "coffeeImage",
      title: "Photo « Comptoir café »",
      type: "image",
      description:
        "La carte « Comptoir café » de la section « Pour chaque moment », qui mène à la page Comptoir café. Aujourd'hui, case vide : votre comptoir café bleu (la photo de votre document).",
      options: { hotspot: true },
      validation: photoRules(1600),
    }),
  ],
  preview: {
    select: { media: "heroImage" },
    prepare({ media }) {
      return { title: "Page d'accueil", subtitle: "Photographies", media };
    },
  },
});
