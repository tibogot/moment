import { defineField, defineType } from "sanity";
import { TagIcon } from "@sanity/icons/Tag";

/**
 * How articles are grouped. Referenced by `article`, optionally: a required
 * category made the first news post fail to publish until one had been created
 * somewhere else in the Studio, which is a trap for a client without support.
 *
 * Only the name reaches the site (the small label above an article). There is
 * no page per rubrique, so the slug and the description are hidden: a field
 * that promises "affichée en tête de la rubrique" for a page that does not
 * exist is the kind of thing that makes an owner distrust the rest.
 */
export const category = defineType({
  name: "category",
  title: "Rubrique",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "title",
      title: "Nom",
      type: "string",
      description:
        "Recettes, Coulisses… La petite étiquette affichée au-dessus des articles de cette rubrique.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Adresse de la page",
      type: "slug",
      description: "Générée depuis le nom. Rien à modifier à la main.",
      options: { source: "title", maxLength: 96 },
      hidden: true,
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description: "Une ou deux lignes, affichées en tête de la rubrique.",
      hidden: true,
    }),
  ],
  preview: {
    select: { title: "title" },
  },
});
