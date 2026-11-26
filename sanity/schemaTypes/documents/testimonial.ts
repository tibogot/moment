import { defineField, defineType } from "sanity";
// Per-icon subpath, not the package root: `@sanity/icons` v5 ships each icon as
// its own entry point and the barrel does not re-export them by name.
import { CommentIcon } from "@sanity/icons/Comment";

/**
 * A customer review, shown on the home page ("Avis clients", 26 November
 * 2026). The audit's first gap against Grape & Fig and Tartes: no social
 * proof anywhere, and for a company ordering lunch for twenty people it is the
 * first thing that reassures.
 *
 * Real words from real customers only, with their agreement to be named —
 * the descriptions say so. An invented review is misleading advertising under
 * Belgian consumer law, and recognisable as one.
 *
 * One document, three languages, like `menu`: the quote is the only text to
 * translate; the name and the company have no language. French is required
 * (the site falls back to it).
 *
 * The section is a first version, to be redesigned (components/v2/
 * TestimonialCells.tsx). It shows nothing until one review is published.
 */
export const testimonial = defineType({
  name: "testimonial",
  title: "Avis client",
  type: "document",
  icon: CommentIcon,
  fields: [
    defineField({
      name: "quote",
      title: "L'avis",
      type: "localeText",
      description:
        "Les mots du client, tels quels, en une à trois phrases. Uniquement de vrais avis, avec l'accord de la personne. Le néerlandais et l'anglais sont facultatifs : sans traduction, le français s'affiche.",
      validation: (rule) =>
        rule.custom((value: { fr?: string } | undefined) =>
          value?.fr?.trim() ? true : "Le texte en français est obligatoire.",
        ),
    }),
    defineField({
      name: "name",
      title: "Nom",
      type: "string",
      description:
        "Comme la personne accepte d'être citée : « Sophie D. » ou le prénom et le nom.",
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: "company",
      title: "Entreprise ou occasion",
      type: "string",
      description:
        "Facultatif. « Office manager, Agence X » ou « Mariage à Uccle ». Seulement si le client l'accepte.",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "order",
      title: "Ordre d'affichage",
      type: "number",
      description:
        "Facultatif. 1 s'affiche en premier. Sans numéro, les plus récents passent après ceux qui en ont un.",
      validation: (rule) => rule.integer().min(1),
    }),
    defineField({
      name: "visible",
      title: "Afficher sur le site",
      type: "boolean",
      description: "Décochez pour retirer un avis du site sans le supprimer.",
      initialValue: true,
    }),
  ],
  orderings: [
    {
      title: "Ordre d'affichage",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { name: "name", company: "company", visible: "visible" },
    prepare: ({ name, company, visible }) => ({
      title: name || "Avis sans nom",
      subtitle: [company, visible === false ? "Masqué" : null]
        .filter(Boolean)
        .join(" · "),
    }),
  },
});
