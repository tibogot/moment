import { defineField, defineType } from "sanity";
import { BellIcon } from "@sanity/icons/Bell";

/**
 * The announcement bar: one line across the top of every page — "Fermé du 24
 * décembre au 2 janvier", "La carte d'hiver est arrivée".
 *
 * A singleton, pinned by `sanity/structure.ts` to the document id
 * `announcement`. It is the thing a caterer most often needs to say at short
 * notice, and without a maintenance contract it has to be theirs to say.
 *
 * Switched on and off by hand rather than by dates. Pages are cached until a
 * webhook says otherwise, so a "show until 2 January" would only stop showing
 * at the next unrelated publish; the switch is published, and so it is
 * immediate.
 */
export const announcement = defineType({
  name: "announcement",
  title: "Bandeau d'annonce",
  type: "document",
  icon: BellIcon,
  fields: [
    defineField({
      name: "enabled",
      title: "Afficher le bandeau",
      description:
        "Allumé : le bandeau apparaît en haut de toutes les pages. Éteint : il disparaît, le texte reste enregistré pour la prochaine fois.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "message",
      title: "Message",
      description:
        "Une phrase courte, par exemple « Fermé du 24 décembre au 2 janvier ». Le français est obligatoire ; sans traduction, le néerlandais et l'anglais affichent le français.",
      type: "localeString",
      validation: (rule) =>
        rule.custom((value: { fr?: string } | undefined, context) => {
          const enabled = (context.document as { enabled?: boolean } | undefined)
            ?.enabled;
          if (enabled && !value?.fr?.trim()) {
            return "Le message en français est obligatoire pour afficher le bandeau.";
          }
          if (value?.fr && value.fr.length > 120) {
            return "Gardez le message sous 120 caractères : il doit tenir sur une ligne.";
          }
          return true;
        }),
    }),
    defineField({
      name: "linkLabel",
      title: "Texte du lien (facultatif)",
      description: "Par exemple « Voir la carte ». Laissé vide : pas de lien.",
      type: "localeString",
    }),
    defineField({
      name: "linkUrl",
      title: "Adresse du lien (facultatif)",
      description:
        "Une page du site sans la langue, par exemple /menus ou /shop, ou une adresse complète commençant par https://.",
      type: "string",
      validation: (rule) =>
        rule.custom((value: string | undefined) => {
          if (!value) return true;
          if (value.startsWith("/") || value.startsWith("https://")) return true;
          return "Commencez par / (une page du site) ou par https:// (un autre site).";
        }),
    }),
  ],
  preview: {
    select: { enabled: "enabled", message: "message.fr" },
    prepare: ({ enabled, message }) => ({
      title: message || "Bandeau d'annonce",
      subtitle: enabled ? "Affiché" : "Masqué",
    }),
  },
});
