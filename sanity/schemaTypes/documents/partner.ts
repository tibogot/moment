import { defineField, defineType } from "sanity";
// Per-icon subpath: `@sanity/icons` v5 does not re-export icons by name.
import { PinIcon } from "@sanity/icons/Pin";

/**
 * A place that sells Moment products — what the "Où nous trouver" map shows.
 *
 * Asked for by the owners, and built to be **entirely
 * theirs**: there is no maintenance contract, so adding a café that started
 * stocking the cookies must never need a developer. Hence the shape:
 *
 * - **They type an address, not coordinates.** The site places the point
 *   itself through the same address lookup the delivery zones use
 *   (`lib/partners.ts`). The optional `location` is only for the rare address
 *   the lookup places on the wrong side of a square.
 * - **Nothing to translate.** A name, an address and a link read the same in
 *   French, Dutch and English, and the kind of place is a fixed list the site
 *   translates. A free-text description would turn every new partner into
 *   three pieces of writing, which is exactly the work nobody is paid for.
 * - **"Visible" rather than delete**, so a partner taking a summer break is a
 *   tick box, not re-typing the entry in September.
 *
 * Field `name`s stay English: they are the contract with the GROQ projection
 * in `lib/sanity/queries.ts`.
 */
export const partner = defineType({
  name: "partner",
  title: "Partenaire",
  type: "document",
  icon: PinIcon,
  fields: [
    defineField({
      name: "name",
      title: "Nom de l'établissement",
      type: "string",
      validation: (rule) => rule.required().max(80),
    }),

    defineField({
      name: "kind",
      title: "Type d'établissement",
      type: "string",
      description: "Affiché sous le nom, traduit automatiquement.",
      options: {
        list: [
          { title: "Café / coffee shop", value: "cafe" },
          { title: "Restaurant", value: "restaurant" },
          { title: "Épicerie / commerce", value: "shop" },
          { title: "Hôtel", value: "hotel" },
          { title: "Entreprise / bureaux", value: "office" },
          { title: "Autre", value: "other" },
        ],
        layout: "radio",
      },
      initialValue: "cafe",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "street",
      title: "Rue et numéro",
      type: "string",
      description: "Par exemple : Chaussée de Waterloo 123",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "postalCode",
      title: "Code postal",
      type: "string",
      validation: (rule) =>
        rule
          .required()
          .regex(/^\d{4}$/, { name: "code postal belge" })
          .error("Quatre chiffres, par exemple 1190."),
    }),

    defineField({
      name: "city",
      title: "Commune",
      type: "string",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "url",
      title: "Lien (site ou Instagram)",
      type: "url",
      description: "Facultatif. L'adresse complète, qui commence par https://",
      validation: (rule) => rule.uri({ scheme: ["https", "http"] }),
    }),

    defineField({
      name: "visible",
      title: "Afficher sur la carte",
      type: "boolean",
      description:
        "Décochez pour masquer un partenaire sans le supprimer (fermeture, pause).",
      initialValue: true,
    }),

    defineField({
      name: "location",
      title: "Position sur la carte (facultatif)",
      type: "geopoint",
      description:
        "À laisser vide : le site place le point à partir de l'adresse. À remplir seulement si le point tombe au mauvais endroit — latitude et longitude depuis Google Maps (clic droit sur l'établissement).",
    }),
  ],
  preview: {
    select: {
      title: "name",
      street: "street",
      city: "city",
      visible: "visible",
    },
    prepare({ title, street, city, visible }) {
      const address = [street, city].filter(Boolean).join(", ");
      return {
        title,
        subtitle: visible === false ? `Masqué · ${address}` : address,
      };
    },
  },
  orderings: [
    {
      title: "Nom",
      name: "nameAsc",
      by: [{ field: "name", direction: "asc" }],
    },
  ],
});
