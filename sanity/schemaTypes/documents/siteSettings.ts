import { defineField, defineType } from "sanity";
import { CogIcon } from "@sanity/icons/Cog";

/**
 * The company's own facts — address, phone, VAT, social accounts — kept where
 * the owners can change them without a deployment. A singleton: the Studio's
 * structure pins it to the document id `siteSettings`, so there is one of these
 * and no "create new" button.
 *
 * Every field here is read by the site, through `getSiteDetails` in
 * `lib/sanity/queries.ts` and the `SiteDetails` type in `lib/site.ts`. That is
 * the rule this document is held to: **a field nobody reads does not belong in
 * the Studio.** An owner who fills one in and sees nothing change learns not to
 * trust the whole screen.
 *
 * Which is why the site's *copy* is not here. This document has no tagline, no
 * about text and no meta description, even though a single-site Studio would
 * normally carry all three: the site runs in French, Dutch and English, and a
 * single-language field would either publish French to Dutch visitors or drift
 * out of step with the dictionaries in `lib/i18n/dictionaries`. Copy lives
 * there, in three languages, on purpose.
 */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Coordonnées de l'entreprise",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "contact", title: "Contact", default: true },
    { name: "legal", title: "Mentions légales" },
    { name: "social", title: "Réseaux sociaux" },
  ],
  fields: [
    defineField({
      name: "contact",
      title: "Contact",
      type: "object",
      group: "contact",
      options: { collapsible: false },
      fields: [
        defineField({
          name: "street",
          title: "Rue et numéro",
          type: "string",
          description:
            "L'adresse de l'atelier, telle qu'elle doit apparaître sur la page des mentions légales.",
        }),
        defineField({
          name: "postalCode",
          title: "Code postal",
          type: "string",
        }),
        defineField({ name: "city", title: "Ville", type: "string" }),
        defineField({
          name: "region",
          title: "Région",
          type: "string",
          description: "Bruxelles-Capitale, Flandre, Wallonie.",
        }),
        defineField({ name: "country", title: "Pays", type: "string" }),
        defineField({
          name: "phone",
          title: "Téléphone",
          type: "string",
          description:
            "Affiché sur le site et composé directement depuis un téléphone. Écrivez-le comme vous le diriez : +32 2 123 45 67.",
        }),
        defineField({
          name: "email",
          title: "Email",
          type: "string",
          description: "L'adresse à laquelle les demandes doivent arriver.",
        }),
      ],
    }),

    defineField({
      name: "legal",
      title: "Mentions légales",
      type: "object",
      group: "legal",
      options: { collapsible: false },
      description:
        "La loi belge impose le numéro d'entreprise et la dénomination sur un site commercial. La page des mentions légales affiche « [to be completed] » tant qu'ils ne sont pas remplis ici.",
      fields: [
        defineField({
          name: "companyName",
          title: "Dénomination sociale",
          type: "string",
          description: "Le nom inscrit à la BCE, s'il diffère de « Moment ».",
        }),
        defineField({
          name: "enterpriseNumber",
          title: "Numéro d'entreprise (BCE)",
          type: "string",
          description: "Dix chiffres, par exemple 0123.456.789",
        }),
        defineField({
          name: "vatNumber",
          title: "Numéro de TVA",
          type: "string",
          description: "BE suivi de dix chiffres, par exemple BE0123456789",
        }),
        defineField({
          name: "legalForm",
          title: "Forme juridique",
          type: "string",
          description: "SRL, SA, ASBL…",
        }),
      ],
    }),

    defineField({
      name: "socialLinks",
      title: "Réseaux sociaux",
      type: "object",
      group: "social",
      options: { collapsible: false },
      description:
        "Des adresses complètes, pas des noms de compte. Elles sont liées depuis le menu mobile et transmises aux moteurs de recherche comme profils officiels de l'entreprise.",
      fields: [
        defineField({ name: "instagram", title: "Instagram", type: "url" }),
        defineField({ name: "facebook", title: "Facebook", type: "url" }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Coordonnées de l'entreprise" };
    },
  },
});
