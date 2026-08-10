import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * The rich-text editor used for article bodies.
 *
 * The styles offered are deliberately few. Every one of them has to be rendered
 * by `PortableTextContent` and has to look like it belongs to this site — an
 * editor offering H1 through H6 produces documents nobody has designed.
 */
export const blockContent = defineType({
  name: "blockContent",
  title: "Texte",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Paragraphe", value: "normal" },
        { title: "Titre", value: "h2" },
        { title: "Sous-titre", value: "h3" },
        { title: "Citation", value: "blockquote" },
      ],
      lists: [
        { title: "Puces", value: "bullet" },
        { title: "Numérotée", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Gras", value: "strong" },
          { title: "Italique", value: "em" },
        ],
        annotations: [
          {
            name: "link",
            type: "object",
            title: "Lien externe",
            fields: [
              defineField({
                name: "href",
                type: "url",
                title: "Adresse",
                description:
                  "Une adresse complète (https://…), ou mailto: et tel: pour un email ou un téléphone.",
                validation: (rule) =>
                  rule.uri({
                    allowRelative: true,
                    scheme: ["http", "https", "mailto", "tel"],
                  }),
              }),
              defineField({
                name: "blank",
                type: "boolean",
                title: "Ouvrir dans un nouvel onglet",
                initialValue: false,
              }),
            ],
          },
          {
            name: "internalLink",
            type: "object",
            title: "Lien vers une actualité",
            fields: [
              defineField({
                name: "reference",
                type: "reference",
                title: "Actualité",
                to: [{ type: "article" }],
              }),
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: "image",
      title: "Photo",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Description de la photo",
          description:
            "Ce que montre l'image, en une phrase. Lu à voix haute aux personnes malvoyantes.",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "caption",
          type: "string",
          title: "Légende",
          description: "Facultative. Affichée sous la photo.",
        }),
      ],
    }),
  ],
});
