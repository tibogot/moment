import { defineField, defineType } from "sanity";
import { UsersIcon } from "@sanity/icons/Users";

/**
 * Who signs an article. Referenced by `article`, never shown on its own page.
 */
export const author = defineType({
  name: "author",
  title: "Auteur",
  type: "document",
  icon: UsersIcon,
  fields: [
    defineField({
      name: "name",
      title: "Nom",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Adresse de la page",
      type: "slug",
      description: "Générée depuis le nom. Rien à modifier à la main.",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "role",
      title: "Fonction",
      type: "string",
      description: "Chef, responsable événements…",
    }),
    defineField({
      name: "bio",
      title: "Présentation",
      type: "text",
      rows: 4,
      description: "Quelques lignes, facultatives.",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "role", media: "image" },
  },
});
