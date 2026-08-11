import { defineArrayMember, defineField, defineType } from "sanity";
// Per-icon subpath, not the package root: `@sanity/icons` v5 ships each icon as
// its own entry point and the barrel no longer re-exports them by name.
import { UlistIcon } from "@sanity/icons/Ulist";

/**
 * A catering menu — one of the per-person formats quoted on /menus.
 *
 * Not a Shopify product: it has a headcount minimum, notice measured in weeks
 * rather than the shop's two days, and a price that means nothing until it is
 * multiplied by guests. So it is quoted through the enquiry form rather than
 * added to a cart.
 *
 * Titles and descriptions are in French because the person writing them is. The
 * field `name`s stay English — they are the contract shared with the `Menu`
 * type in `lib/menus.ts` and the GROQ projection between them, which returns
 * `undefined` rather than an error when they drift.
 *
 * Every field carrying *words* is a `locale*` object: one document, three
 * languages side by side. Everything carrying a *number* — the price, the
 * headcounts, the notice period — is shared, which is the whole reason this is
 * field-level rather than a document per language. See `objects/locale.ts`.
 */
export const menu = defineType({
  name: "menu",
  title: "Menu traiteur",
  type: "document",
  icon: UlistIcon,
  groups: [
    { name: "content", title: "Contenu", default: true },
    { name: "pricing", title: "Prix et conditions" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Nom de la formule",
      type: "localeString",
      group: "content",
      description:
        "Tel qu'il apparaît sur le site — « Apéro dînatoire », « Dîner assis ». Le français est obligatoire : c'est ce que le site affiche quand une traduction manque.",
    }),

    defineField({
      name: "slug",
      title: "Adresse de la page",
      type: "slug",
      group: "content",
      description:
        "La fin de l'URL, générée depuis le nom. À ne plus modifier une fois la formule en ligne : les liens existants cesseraient de fonctionner.",
      // Built from the French title, and shared by all three languages: one
      // menu is one page in three languages, so /nl/menus/<slug> is genuinely
      // the Dutch version of /fr/menus/<slug> rather than a different page.
      options: { source: "title.fr", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),

    // A list rather than free text: the site sorts and labels menus by format,
    // so a typo here would drop a menu to the bottom of the page. What the
    // visitor reads comes from the dictionaries — these titles are only what
    // the Studio shows.
    defineField({
      name: "format",
      title: "Type de formule",
      type: "string",
      group: "content",
      options: {
        list: [
          { title: "Petit-déjeuner", value: "breakfast" },
          { title: "Lunch de bureau", value: "lunch" },
          { title: "Apéro", value: "apero" },
          { title: "Buffet", value: "buffet" },
          { title: "Dîner assis", value: "seated" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "summary",
      title: "Résumé",
      type: "localeText",
      group: "content",
      description:
        "Une ou deux phrases. Affiché sous le nom dans la liste des formules, et repris par Google. Restez sous 200 caractères — au-delà, Google coupe.",
    }),

    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      group: "content",
      description:
        "Une fois la photo chargée, cliquez sur « Edit » pour choisir le point important : c'est lui qui reste visible au recadrage sur mobile.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Description de la photo",
          type: "string",
          description:
            "Décrivez le plat pour quelqu'un qui ne voit pas l'image.",
        }),
      ],
    }),

    defineField({
      name: "courses",
      title: "Composition",
      type: "array",
      group: "content",
      description:
        "Le menu lui-même, par services — « Pour commencer », « Plats », « Pour finir ».",
      of: [
        defineArrayMember({
          type: "object",
          name: "course",
          fields: [
            defineField({
              name: "title",
              title: "Nom du service",
              type: "localeString",
            }),
            defineField({
              name: "items",
              title: "Plats",
              type: "localeStringList",
            }),
          ],
          preview: {
            select: { title: "title.fr", items: "items.fr" },
            prepare({ title, items }) {
              const count = Array.isArray(items) ? items.length : 0;
              return {
                title: title ?? "Service sans nom",
                subtitle: `${count} plat${count === 1 ? "" : "s"}`,
              };
            },
          },
        }),
      ],
    }),

    defineField({
      name: "pricePerPerson",
      title: "Prix par personne",
      type: "number",
      group: "pricing",
      description: "En euros, hors TVA. Affiché comme prix « à partir de ».",
      validation: (rule) => rule.required().positive(),
    }),

    defineField({
      name: "priceNote",
      title: "Précision sur le prix",
      type: "localeString",
      group: "pricing",
      description:
        "La mention imprimée sous le prix — par exemple « hors TVA, service et boissons ».",
    }),

    defineField({
      name: "minGuests",
      title: "Nombre minimum de convives",
      type: "number",
      group: "pricing",
      validation: (rule) => rule.required().integer().positive(),
    }),

    defineField({
      name: "maxGuests",
      title: "Nombre maximum de convives",
      type: "number",
      group: "pricing",
      description: "Laissez vide s'il n'y a pas de plafond.",
      validation: (rule) =>
        rule
          .integer()
          .positive()
          .custom((max, context) => {
            const min = (context.document as { minGuests?: number } | undefined)
              ?.minGuests;
            if (
              typeof max === "number" &&
              typeof min === "number" &&
              max < min
            ) {
              return "Le maximum ne peut pas être inférieur au minimum.";
            }
            return true;
          }),
    }),

    defineField({
      name: "leadTimeDays",
      title: "Délai de commande (en jours)",
      type: "number",
      group: "pricing",
      description:
        "Combien de temps à l'avance cette formule doit être réservée. Les multiples de 7 s'affichent en semaines.",
      validation: (rule) => rule.required().integer().positive(),
    }),

    defineField({
      name: "includes",
      title: "Compris dans le prix",
      type: "localeStringList",
      group: "pricing",
    }),

    defineField({
      name: "excludes",
      title: "Non compris",
      type: "localeStringList",
      group: "pricing",
      description:
        "Facturé séparément — service, boissons, location, mobilier.",
    }),

    defineField({
      name: "dietaryNote",
      title: "Régimes et allergies",
      type: "localeText",
      group: "pricing",
      description:
        "Comment les demandes végétariennes, véganes et les allergies sont traitées pour cette formule. À faire relire par quelqu'un qui lit la langue : ce champ porte de l'information de sécurité, pas du marketing.",
    }),
  ],

  preview: {
    select: {
      title: "title.fr",
      format: "format",
      price: "pricePerPerson",
      media: "image",
    },
    prepare({ title, format, price, media }) {
      const parts = [
        format,
        typeof price === "number" ? `€${price} pp` : null,
      ].filter(Boolean);

      return { title, subtitle: parts.join(" · "), media };
    },
  },
});
