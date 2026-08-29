import { defineArrayMember, defineField, defineType } from "sanity";
// Per-icon subpath, not the package root: `@sanity/icons` v5 ships each icon as
// its own entry point and the barrel no longer re-exports them by name.
import { ImagesIcon } from "@sanity/icons/Images";

/**
 * An event the kitchen has already catered — what /events shows as proof, and
 * what the client calls "Réalisations".
 *
 * Deliberately not an article. An article is editorial, written once in one
 * language, and there are two of them a year. This is a record: added after
 * every job, mostly photographs, and it exists so a stranger deciding whether
 * to trust us can see that a hundred-and-twenty-person reception in Ixelles is
 * a thing we have actually done.
 *
 * **The fields are the point, not the freedom.** A single "description" box
 * would come back as "Superbe soirée, merci à toute l'équipe !", which says
 * nothing to a reader and nothing to a search engine. Occasion, headcount,
 * commune and date are separate required fields so that every entry on the page
 * carries the three facts somebody actually searches for — the kind of event,
 * how many people, and where. `lib/events.ts` composes them into the caption.
 *
 * One document, three languages, like `menu` and unlike `article`: the only
 * translatable field here is the optional note, and everything else — a
 * headcount, a commune, a photograph — has no language at all. Splitting this
 * per language would triple the numbers and let an event exist in French and
 * vanish from the Dutch grid.
 *
 * Field `name`s stay English: they are the contract shared with the GROQ
 * projection in `lib/sanity/queries.ts` and the types in `lib/events.ts`, and
 * renaming one here returns `undefined` there rather than an error.
 */
export const pastEvent = defineType({
  name: "pastEvent",
  title: "Réalisation",
  type: "document",
  icon: ImagesIcon,
  groups: [
    { name: "facts", title: "L'événement", default: true },
    { name: "media", title: "Photos" },
    { name: "links", title: "Liens" },
  ],
  fields: [
    /**
     * A list rather than free text, and no "Autre" on purpose.
     *
     * Each value below is a different thing people type into Google — "traiteur
     * séminaire Bruxelles" and "traiteur communion" are not the same customer.
     * An escape hatch would collect the interesting ones under a label that
     * ranks for nothing and reads as "Autre · 40 personnes · Uccle" on the page.
     * If none of these fits, the note field is where the specifics go.
     */
    defineField({
      name: "occasion",
      title: "Type d'événement",
      type: "string",
      group: "facts",
      description:
        "Le plus proche de ce qu'était la soirée. C'est ce mot que les gens tapent dans Google — choisissez celui qu'un client emploierait, pas celui du contrat.",
      options: {
        list: [
          { title: "Lancement / inauguration", value: "launch" },
          { title: "Réception", value: "reception" },
          { title: "Séminaire / conférence", value: "seminar" },
          { title: "Team building", value: "teamBuilding" },
          { title: "Fête du personnel", value: "staffParty" },
          { title: "Lunch d'entreprise", value: "businessLunch" },
          { title: "Dîner privé", value: "privateDinner" },
          { title: "Fête de famille", value: "celebration" },
          { title: "Mariage", value: "wedding" },
          { title: "Communion / baptême", value: "communion" },
          { title: "Réception funéraire", value: "funeral" },
        ],
      },
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "guests",
      title: "Nombre de convives",
      type: "number",
      group: "facts",
      description:
        "Le chiffre réel, même s'il n'est pas rond. « 120 personnes » est ce qui rassure quelqu'un qui en attend cent.",
      validation: (rule) => rule.required().integer().min(1).max(5000),
    }),

    defineField({
      name: "commune",
      title: "Commune",
      type: "string",
      group: "facts",
      description:
        "Où cela s'est passé — Ixelles, Uccle, Forest, Waterloo. Obligatoire : c'est le mot qui fait remonter la page sur les recherches locales.",
      validation: (rule) => rule.required().max(60),
    }),

    defineField({
      name: "venue",
      title: "Lieu",
      type: "string",
      group: "facts",
      description:
        "Le nom de la salle ou du bâtiment, s'il en a un et si le lieu accepte d'être cité. Les noms de salles bruxelloises sont cherchés tels quels.",
      validation: (rule) => rule.max(80),
    }),

    defineField({
      name: "date",
      title: "Date",
      type: "date",
      group: "facts",
      description:
        "Seuls le mois et l'année sont affichés. Sert aussi à classer les réalisations, de la plus récente à la plus ancienne.",
      options: { dateFormat: "DD/MM/YYYY" },
      validation: (rule) => rule.required(),
    }),

    /**
     * Optional, and left empty by default for a reason that is not editorial:
     * naming a company publicly needs that company's agreement, and a caterer
     * who forgets loses the account rather than the ranking.
     */
    defineField({
      name: "client",
      title: "Client",
      type: "string",
      group: "facts",
      description:
        "À ne remplir que si le client a explicitement accepté d'être cité. Dans le doute, laissez vide — la commune et le nombre de convives suffisent.",
      validation: (rule) => rule.max(80),
    }),

    /**
     * The only translatable field on the document, and the only free text. One
     * line, for the thing that made this event different from the next one.
     *
     * French is required inside `localeString`, which is right: French is what
     * the site falls back to, so a note written only in English would render as
     * nothing at all for the majority of readers. Leaving the whole field empty
     * is fine.
     */
    defineField({
      name: "note",
      title: "Ce qui la distinguait",
      type: "localeString",
      group: "facts",
      description:
        "Facultatif, une phrase. Le détail dont vous vous souvenez — « service en terrasse malgré la pluie », « menu entièrement végétal ». Pas de superlatifs : ils ne disent rien à quelqu'un qui hésite.",
    }),

    defineField({
      name: "images",
      title: "Photos",
      type: "array",
      group: "media",
      description:
        "La première sert de vignette dans la grille. Vos propres photos uniquement — une banque d'images sur une page de réalisations se repère, et coûte plus de confiance qu'elle n'en gagne.",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Description de la photo",
              type: "string",
              description:
                "Ce que montre la photo, en une phrase. Lu à voix haute aux personnes malvoyantes, et c'est par là que Google Images trouve vos photos.",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "alt", media: "asset" },
            prepare({ title, media }) {
              return { title: title ?? "Photo sans description", media };
            },
          },
        }),
      ],
      validation: (rule) => rule.required().min(1).max(8),
    }),

    /**
     * Both links are optional and both point at pages that already exist. They
     * are here because a page of proof that links nowhere is a dead end: the
     * menu link sends a convinced reader to a price, and the article link is
     * what a reference becomes on the rare occasion it has a story worth
     * telling at length.
     */
    defineField({
      name: "menu",
      title: "Formule servie",
      type: "reference",
      group: "links",
      to: [{ type: "menu" }],
      description:
        "Facultatif. La formule du catalogue qui s'en rapproche le plus — la page peut alors renvoyer le lecteur vers son prix.",
    }),

    defineField({
      name: "article",
      title: "Article lié",
      type: "reference",
      group: "links",
      to: [{ type: "article" }],
      description:
        "Facultatif, et rarement utile. Une actualité est écrite dans une seule langue : le lien n'apparaîtra que pour les lecteurs de cette langue-là.",
    }),

    defineField({
      name: "featured",
      title: "Mettre en avant",
      type: "boolean",
      group: "links",
      description:
        "Place la réalisation en tête de la grille, avant les plus récentes.",
      initialValue: false,
    }),
  ],

  orderings: [
    {
      title: "Date, la plus récente",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
  ],

  preview: {
    select: {
      occasion: "occasion",
      guests: "guests",
      commune: "commune",
      venue: "venue",
      date: "date",
      media: "images.0",
    },
    prepare({ occasion, guests, commune, venue, date, media }) {
      // The Studio list reads in French, so these repeat the option titles
      // above rather than reaching into the site's dictionaries — those are the
      // visitor's words, in three languages, and this list has one reader.
      const labels: Record<string, string> = {
        launch: "Lancement",
        reception: "Réception",
        seminar: "Séminaire",
        teamBuilding: "Team building",
        staffParty: "Fête du personnel",
        businessLunch: "Lunch d'entreprise",
        privateDinner: "Dîner privé",
        celebration: "Fête de famille",
        wedding: "Mariage",
        communion: "Communion",
        funeral: "Réception funéraire",
      };

      const subtitle = [
        typeof guests === "number" ? `${guests} pers.` : null,
        venue ? `${venue}, ${commune}` : commune,
        date
          ? new Date(date).toLocaleDateString("fr-BE", {
              month: "long",
              year: "numeric",
            })
          : null,
      ]
        .filter(Boolean)
        .join(" · ");

      return {
        title: labels[occasion] ?? "Réalisation",
        subtitle,
        media,
      };
    },
  },
});
