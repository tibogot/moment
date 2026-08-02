import { defineArrayMember, defineField, defineType } from "sanity";
import { UlistIcon } from "@sanity/icons";

/**
 * A catering menu — one of the per-person formats quoted on /menus.
 *
 * This file is the Studio's schema, not frontend code. Nothing in the Next app
 * imports it; the app reads the documents it produces through
 * `lib/sanity/queries.ts`. There is no Studio in this repository yet — register
 * this type in whichever Studio serves project `msn9ulmx`. See sanity/README.md.
 *
 * Keep the field names in step with the `Menu` type in `lib/menus.ts`; the GROQ
 * projection sits between them and will silently return `undefined` if they
 * drift.
 */
export const menu = defineType({
  name: "menu",
  title: "Menu",
  type: "document",
  icon: UlistIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "pricing", title: "Pricing & terms" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      description:
        "What the format is called on the site — 'Apéro dînatoire', 'Seated dinner'.",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),

    // A list rather than free text: the site sorts and labels menus by format,
    // so a typo here would drop a menu to the bottom of the page.
    defineField({
      name: "format",
      title: "Format",
      type: "string",
      group: "content",
      options: {
        list: [
          { title: "Breakfast", value: "breakfast" },
          { title: "Office lunch", value: "lunch" },
          { title: "Apéro", value: "apero" },
          { title: "Buffet", value: "buffet" },
          { title: "Seated dinner", value: "seated" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3,
      group: "content",
      description:
        "One or two sentences. Used on the menus index and as the search description.",
      validation: (rule) =>
        rule.max(200).warning("Keep it under 200 characters — it is the snippet Google shows."),
    }),

    defineField({
      name: "image",
      title: "Image",
      type: "image",
      group: "content",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          description: "Describe the food for someone who cannot see the photo.",
        }),
      ],
    }),

    defineField({
      name: "courses",
      title: "Courses",
      type: "array",
      group: "content",
      description:
        "The menu itself, in named parts — 'To start', 'Mains', 'To finish'.",
      of: [
        defineArrayMember({
          type: "object",
          name: "course",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "items",
              title: "Items",
              type: "array",
              of: [defineArrayMember({ type: "string" })],
              validation: (rule) => rule.min(1).error("Add at least one item."),
            }),
          ],
          preview: {
            select: { title: "title", items: "items" },
            prepare({ title, items }) {
              const count = Array.isArray(items) ? items.length : 0;
              return {
                title,
                subtitle: `${count} item${count === 1 ? "" : "s"}`,
              };
            },
          },
        }),
      ],
    }),

    defineField({
      name: "pricePerPerson",
      title: "Price per person",
      type: "number",
      group: "pricing",
      description: "In euros, excluding VAT. Shown as the headline 'from' price.",
      validation: (rule) => rule.required().positive(),
    }),

    defineField({
      name: "priceNote",
      title: "Price note",
      type: "string",
      group: "pricing",
      description:
        "The qualifier printed under the price — e.g. 'excl. VAT, staff and drinks'.",
    }),

    defineField({
      name: "minGuests",
      title: "Minimum guests",
      type: "number",
      group: "pricing",
      validation: (rule) => rule.required().integer().positive(),
    }),

    defineField({
      name: "maxGuests",
      title: "Maximum guests",
      type: "number",
      group: "pricing",
      description: "Leave empty if there is no ceiling.",
      validation: (rule) =>
        rule.integer().positive().custom((max, context) => {
          const min = (context.document as { minGuests?: number } | undefined)
            ?.minGuests;
          if (typeof max === "number" && typeof min === "number" && max < min) {
            return "Maximum cannot be below the minimum.";
          }
          return true;
        }),
    }),

    defineField({
      name: "leadTimeDays",
      title: "Notice needed (days)",
      type: "number",
      group: "pricing",
      description:
        "How far ahead this has to be booked. Multiples of 7 are shown as weeks.",
      validation: (rule) => rule.required().integer().positive(),
    }),

    defineField({
      name: "includes",
      title: "Included in the price",
      type: "array",
      group: "pricing",
      of: [defineArrayMember({ type: "string" })],
    }),

    defineField({
      name: "excludes",
      title: "Not included",
      type: "array",
      group: "pricing",
      description: "Quoted separately — staff, drinks, hire, furniture.",
      of: [defineArrayMember({ type: "string" })],
    }),

    defineField({
      name: "dietaryNote",
      title: "Dietary note",
      type: "text",
      rows: 2,
      group: "pricing",
      description:
        "How vegetarian, vegan and allergen requests are handled for this format.",
    }),
  ],

  preview: {
    select: {
      title: "title",
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
