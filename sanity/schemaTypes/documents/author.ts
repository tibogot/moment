import { defineField, defineType } from "sanity";
import { UsersIcon } from "@sanity/icons/Users";

/**
 * Who signs an article. Referenced by `article`, optionally (an unsigned
 * article shows "Moment"), never shown on its own page.
 */
export const author = defineType({
  name: "author",
  title: "Auteur",
  type: "document",
  icon: UsersIcon,
  /**
   * Only the name reaches the site (the byline of an article). The other
   * fields are hidden rather than deleted: there is no author page, so a photo
   * or a bio typed here would go nowhere, and a form asking for them reads as
   * work the owner has left undone. Unhide them if an author page is built.
   */
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
      hidden: true,
    }),
    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
      hidden: true,
    }),
    defineField({
      name: "role",
      title: "Fonction",
      type: "string",
      description: "Chef, responsable événements…",
      hidden: true,
    }),
    defineField({
      name: "bio",
      title: "Présentation",
      type: "text",
      rows: 4,
      description: "Quelques lignes, facultatives.",
      hidden: true,
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "role", media: "image" },
  },
});
