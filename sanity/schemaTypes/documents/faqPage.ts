import { defineArrayMember, defineField, defineType } from "sanity";
import { OlistIcon } from "@sanity/icons/Olist";
import en from "@/lib/i18n/dictionaries/en.json";
import fr from "@/lib/i18n/dictionaries/fr.json";
import nl from "@/lib/i18n/dictionaries/nl.json";

/**
 * The "Comment ça marche ?" page (/faq): the order in steps, then the
 * questions. A singleton, pinned by `sanity/structure.ts` to the document id
 * `faqPage`.
 *
 * In the Studio because it is the copy a caterer changes most: a new service,
 * a new rule, a question customers keep asking. Without a maintenance
 * contract, every one of those would otherwise be a developer's invoice.
 *
 * Prose only, never numbers. Fees, minimums, notice, cut-off and time slots
 * are settings in Shopify, and the page prints them itself in its first
 * question, "Commander & se faire livrer" (built by the page, not here). A
 * fee typed into an answer here would be the first sentence on the site to
 * go wrong after a price change — so the field descriptions steer the owners
 * away from it.
 *
 * The steps sit in one row on the page (since 24 November 2026), so there
 * are at most 4, each a word or two and one short sentence.
 *
 * Until this document is published, the page shows the same texts from the
 * dictionaries (`faq.steps` / `faq.items`) — and `initialValue` below fills
 * the form with exactly those, so the first time the owners open it they find
 * what the site already says rather than an empty page. Publishing it once
 * hands the texts over; from then on the Studio is the only source.
 */

type Dict = typeof fr;
const DICTS: Record<"fr" | "nl" | "en", Dict> = { fr, nl, en };

/** One dictionary string, in the three languages, as a locale object. */
const inAllLanguages = (type: string, get: (dict: Dict) => string) => ({
  _type: type,
  fr: get(DICTS.fr),
  nl: get(DICTS.nl),
  en: get(DICTS.en),
});

const initialValue = () => ({
  steps: fr.faq.steps.map((_, index) => ({
    _key: `step${index + 1}`,
    _type: "faqStep",
    title: inAllLanguages("localeString", (d) => d.faq.steps[index].title),
    body: inAllLanguages("localeText", (d) => d.faq.steps[index].body),
  })),
  questions: fr.faq.items.map((_, index) => ({
    _key: `question${index + 1}`,
    _type: "faqQuestion",
    question: inAllLanguages("localeString", (d) => d.faq.items[index].q),
    answer: inAllLanguages("localeText", (d) => d.faq.items[index].a),
    hidden: false,
  })),
});

const NO_NUMBERS =
  "Pas de prix, de minimum, de délai ni d'horaire dans ce texte : la page les affiche toute seule dans « Commander & se faire livrer », à partir des réglages Shopify, et ils restent ainsi toujours justes.";

/** French is what every other language falls back to, so it is required. */
const requireFrench = (value?: { fr?: string }) =>
  value?.fr?.trim() ? true : "Le texte en français est obligatoire.";

export const faqPage = defineType({
  name: "faqPage",
  title: "Comment ça marche & FAQ",
  type: "document",
  // A numbered list, not a "?": a question mark reads as help about the Studio.
  icon: OlistIcon,
  initialValue,
  fields: [
    defineField({
      name: "steps",
      title: "Les étapes de commande",
      type: "array",
      description:
        "Affichées sur une ligne, dans cet ordre, numérotées 01, 02… automatiquement. Quatre au plus, chacune courte : la ligne ne tient qu'avec des textes d'une phrase. Glissez pour les réordonner.",
      validation: (rule) =>
        rule
          .max(4)
          .error("Quatre étapes au plus : elles tiennent sur une ligne."),
      of: [
        defineArrayMember({
          type: "object",
          name: "faqStep",
          fields: [
            defineField({
              name: "title",
              title: "Titre de l'étape",
              type: "localeString",
              description: "Court : un ou deux mots (« Paiement »).",
              validation: (rule) => rule.custom(requireFrench),
            }),
            defineField({
              name: "body",
              title: "Explication",
              type: "localeText",
              description: `Une phrase courte. ${NO_NUMBERS}`,
              validation: (rule) => rule.custom(requireFrench),
            }),
          ],
          preview: {
            select: { title: "title.fr", body: "body.fr" },
            prepare({ title, body }) {
              return { title: title ?? "Étape sans titre", subtitle: body };
            },
          },
        }),
      ],
    }),

    defineField({
      name: "questions",
      title: "Questions fréquentes",
      type: "array",
      description:
        "Affichées dans cet ordre. Glissez pour les réordonner ; « Masquer » retire une question du site sans la supprimer.",
      of: [
        defineArrayMember({
          type: "object",
          name: "faqQuestion",
          fields: [
            defineField({
              name: "question",
              title: "Question",
              type: "localeString",
              validation: (rule) => rule.custom(requireFrench),
            }),
            defineField({
              name: "answer",
              title: "Réponse",
              type: "localeText",
              description: NO_NUMBERS,
              validation: (rule) => rule.custom(requireFrench),
            }),
            defineField({
              name: "hidden",
              title: "Masquer sur le site",
              type: "boolean",
              initialValue: false,
            }),
          ],
          preview: {
            select: { title: "question.fr", hidden: "hidden" },
            prepare({ title, hidden }) {
              return {
                title: title ?? "Question sans titre",
                subtitle: hidden ? "Masquée" : undefined,
              };
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Comment ça marche ?", subtitle: "Étapes et questions" };
    },
  },
});
