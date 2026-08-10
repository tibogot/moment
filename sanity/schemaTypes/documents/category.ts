import { defineField, defineType } from "sanity";
import { TagIcon } from "@sanity/icons/Tag";

/**
 * How articles are grouped. Referenced by `article`; an article needs at least
 * one, so these have to exist before the first news post can be published.
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
      description: "Recettes, Événements, Coulisses…",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Adresse de la page",
      type: "slug",
      description: "Générée depuis le nom. Rien à modifier à la main.",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description: "Une ou deux lignes, affichées en tête de la rubrique.",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "description" },
  },
});
