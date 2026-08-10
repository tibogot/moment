import { defineField, defineType } from "sanity";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";

/**
 * A news post — what the site calls "Actualités" and renders at /news.
 *
 * Not a catering menu: those are `menu`, priced per head and quoted rather than
 * sold. Not a product either: those live in Shopify. This is editorial.
 *
 * Titles and descriptions are in French because the person writing them is. The
 * field `name`s stay English — they are the contract shared with the GROQ
 * projection in `lib/sanity/queries.ts` and the types in `lib/sanity/types.ts`,
 * and renaming one silently returns `undefined` rather than an error.
 */
export const article = defineType({
  name: "article",
  title: "Actualité",
  type: "document",
  icon: DocumentTextIcon,
  groups: [
    { name: "content", title: "Contenu", default: true },
    { name: "meta", title: "Publication" },
    { name: "seo", title: "Référencement" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Titre",
      type: "string",
      group: "content",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "slug",
      title: "Adresse de la page",
      type: "slug",
      group: "content",
      description:
        "La fin de l'URL, générée depuis le titre. À ne plus modifier une fois l'article publié : les liens existants cesseraient de fonctionner.",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "language",
      title: "Langue",
      type: "string",
      group: "meta",
      description:
        "La langue dans laquelle cet article est écrit. Un article n'est pas traduit automatiquement — pour le publier en trois langues, il faut trois articles.",
      options: {
        list: [
          { title: "Français", value: "fr" },
          { title: "Néerlandais", value: "nl" },
          { title: "Anglais", value: "en" },
        ],
        layout: "radio",
      },
      initialValue: "fr",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Accroche",
      type: "text",
      group: "content",
      rows: 3,
      description:
        "Deux ou trois lignes. C'est ce qui s'affiche sous le titre dans la liste des actualités et dans les résultats de recherche.",
      validation: (rule) => rule.required().max(300),
    }),
    defineField({
      name: "mainImage",
      title: "Image principale",
      type: "image",
      group: "content",
      description:
        "Une fois l'image chargée, cliquez sur « Edit » pour choisir le point important : c'est lui qui reste visible quand l'image est recadrée sur mobile.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Description de l'image",
          description:
            "Ce que montre la photo, en une phrase. Lu à voix haute aux personnes malvoyantes et utilisé par Google.",
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Texte",
      type: "blockContent",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "categories",
      title: "Rubriques",
      type: "array",
      group: "meta",
      of: [{ type: "reference", to: [{ type: "category" }] }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "author",
      title: "Auteur",
      type: "reference",
      group: "meta",
      to: [{ type: "author" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Date de publication",
      type: "datetime",
      group: "meta",
      description:
        "Les actualités sont classées de la plus récente à la plus ancienne d'après cette date.",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "featured",
      title: "Mettre en avant",
      type: "boolean",
      group: "meta",
      description: "Affiche l'article en tête de la page Actualités.",
      initialValue: false,
    }),
    defineField({
      name: "seoTitle",
      title: "Titre pour Google",
      type: "string",
      group: "seo",
      description:
        "Facultatif. Remplace le titre de l'article dans les résultats de recherche — 60 caractères maximum, au-delà Google coupe.",
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: "seoDescription",
      title: "Description pour Google",
      type: "text",
      group: "seo",
      rows: 3,
      description:
        "Facultatif. Le paragraphe affiché sous le lien dans les résultats de recherche — 160 caractères maximum.",
      validation: (rule) => rule.max(160),
    }),
  ],
  orderings: [
    {
      title: "Date de publication, la plus récente",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      author: "author.name",
      media: "mainImage",
      date: "publishedAt",
      language: "language",
    },
    prepare({ title, author, media, date, language }) {
      const formattedDate = date
        ? new Date(date).toLocaleDateString("fr-BE")
        : "Brouillon";
      return {
        title,
        subtitle: [author, language?.toUpperCase(), formattedDate]
          .filter(Boolean)
          .join(" · "),
        media,
      };
    },
  },
});
