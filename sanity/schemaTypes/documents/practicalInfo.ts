import { defineArrayMember, defineField, defineType } from "sanity";
// Per-icon subpath, not the package root: `@sanity/icons` v5 ships each icon as
// its own entry point and the barrel does not re-export them by name.
import { ClockIcon } from "@sanity/icons/Clock";
import { SITE_DETAILS, WEEKDAYS } from "@/lib/site";

/**
 * "Infos pratiques": the few company facts that change without warning — the
 * phone number, the e-mail, the hours, the social accounts (26 November 2026).
 *
 * Everything else about the company stays in `lib/site.ts`: the address, the
 * VAT and enterprise numbers, the legal form and seat move once every few
 * years, are legal facts, and a developer changes them.
 *
 * One rule against the "two copies" problem the note on `SITE_DETAILS`
 * describes: once this document is published it wins whole, field by field
 * included — there is no merge with the code's values. That is safe because
 * the fields that must never be empty (phone, e-mail, hours, days) are
 * required here, so the Studio cannot publish them blank. The social links
 * may be empty: an empty one simply hides the link. Until the document is
 * first published, the site keeps the values in `lib/site.ts`, which are also
 * what the form opens with.
 *
 * Read by `getSiteDetails()` (lib/site-details.ts) on the server and passed to
 * the client components through `SiteDetailsProvider`.
 */
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

const DAY_TITLES: Record<(typeof WEEKDAYS)[number], string> = {
  monday: "Lundi",
  tuesday: "Mardi",
  wednesday: "Mercredi",
  thursday: "Jeudi",
  friday: "Vendredi",
  saturday: "Samedi",
  sunday: "Dimanche",
};

export const practicalInfo = defineType({
  name: "practicalInfo",
  title: "Infos pratiques",
  type: "document",
  icon: ClockIcon,
  initialValue: {
    phone: SITE_DETAILS.contact.phone,
    email: SITE_DETAILS.contact.email,
    opensAt: SITE_DETAILS.hours.opensAt,
    closesAt: SITE_DETAILS.hours.closesAt,
    openDays: [...SITE_DETAILS.hours.days],
    instagram: SITE_DETAILS.social.instagram,
    facebook: SITE_DETAILS.social.facebook,
  },
  fields: [
    defineField({
      name: "phone",
      title: "Téléphone",
      type: "string",
      description:
        "Affiché dans le bas de page, le menu, la page Contact et repris par Google. Par exemple : +32 472 35 51 53",
      validation: (rule) => rule.required().max(30),
    }),
    defineField({
      name: "email",
      title: "E-mail de contact",
      type: "string",
      description:
        "L'adresse affichée sur le site. Les formulaires du site, eux, arrivent toujours à la même boîte : pour la changer, il faut un développeur.",
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: "opensAt",
      title: "Ouverture",
      type: "string",
      description:
        "Les heures où l'on vous joint, au format 08:00. Ce ne sont pas les créneaux de livraison ni de retrait : ceux-là se règlent dans Shopify.",
      validation: (rule) =>
        rule.required().regex(TIME, { name: "heure au format 08:00" }),
    }),
    defineField({
      name: "closesAt",
      title: "Fermeture",
      type: "string",
      description: "Au format 16:00.",
      validation: (rule) =>
        rule.required().regex(TIME, { name: "heure au format 16:00" }),
    }),
    defineField({
      name: "openDays",
      title: "Jours d'ouverture",
      type: "array",
      description:
        "Les jours où ces horaires s'appliquent. Les vacances et jours fériés ne se mettent pas ici : ajoutez une fermeture dans Shopify (voir le Mode d'emploi).",
      of: [defineArrayMember({ type: "string" })],
      options: {
        list: WEEKDAYS.map((value) => ({ title: DAY_TITLES[value], value })),
        layout: "grid",
      },
      validation: (rule) => rule.required().min(1).unique(),
    }),
    defineField({
      name: "instagram",
      title: "Instagram",
      type: "url",
      description:
        "Facultatif. L'adresse complète, qui commence par https://. Laissé vide, le lien disparaît du site.",
      validation: (rule) => rule.uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "facebook",
      title: "Facebook",
      type: "url",
      description: "Facultatif, comme Instagram.",
      validation: (rule) => rule.uri({ scheme: ["https"] }),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Infos pratiques" }),
  },
});
