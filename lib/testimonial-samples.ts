import type { TestimonialContent } from "@/lib/sanity/queries";

/**
 * Sample reviews for designing the "Avis clients" section before Moment has
 * published real ones (26 November 2026). NOT customer words.
 *
 * Shown only when no real review is published AND the deployment is not
 * indexable (the test address, localhost) — see the home page. On the real
 * domain they can never appear, whatever anyone forgets on launch day: an
 * invented review is misleading advertising under Belgian consumer law.
 * They live in code rather than in the Studio for that reason — a sample in
 * Sanity would stay on the live site until someone deleted it.
 *
 * Six, so a carousel has something to scroll. The names are placeholders.
 */
export const SAMPLE_TESTIMONIALS: TestimonialContent[] = [
  {
    _id: "sample-1",
    quote: {
      fr: "Des lunchs pour toute l'équipe chaque jeudi : frais, beaux, toujours à l'heure. Nos réunions n'ont jamais été aussi populaires.",
      nl: "Elke donderdag lunch voor het hele team: vers, mooi en altijd op tijd. Onze vergaderingen waren nog nooit zo populair.",
      en: "Lunch for the whole team every Thursday: fresh, beautiful, always on time. Our meetings have never been so popular.",
    },
    name: "Exemple — Camille D.",
    company: "Office manager",
  },
  {
    _id: "sample-2",
    quote: {
      fr: "Un cocktail pour quatre-vingts invités, et tout le monde nous a demandé le nom du traiteur.",
      nl: "Een receptie voor tachtig gasten, en iedereen vroeg ons wie de catering deed.",
      en: "Drinks for eighty guests, and everyone asked us who the caterer was.",
    },
    name: "Exemple — Julien M.",
    company: "Lancement de produit",
  },
  {
    _id: "sample-3",
    quote: {
      fr: "Les jus pressés à froid sont devenus notre rituel du matin au bureau.",
      nl: "De koudgeperste sappen zijn ons ochtendritueel op kantoor geworden.",
      en: "The cold-pressed juices have become our morning ritual at the office.",
    },
    name: "Exemple — Sarah L.",
    company: "Agence de design",
  },
  {
    _id: "sample-4",
    quote: {
      fr: "Commande passée le matin pour le lendemain, retrait à l'atelier en cinq minutes. Simple et délicieux.",
      nl: "'s Ochtends besteld voor de volgende dag, in vijf minuten afgehaald in het atelier. Eenvoudig en heerlijk.",
      en: "Ordered in the morning for the next day, collected from the atelier in five minutes. Simple and delicious.",
    },
    name: "Exemple — Thomas V.",
    company: null,
  },
  {
    _id: "sample-5",
    quote: {
      fr: "Des options végétariennes et sans gluten qui ne font pas figure de plan B : tout le monde a été servi.",
      nl: "Vegetarische en glutenvrije opties die niet als noodoplossing aanvoelen: iedereen kwam aan zijn trekken.",
      en: "Vegetarian and gluten-free options that never felt like plan B: everyone was looked after.",
    },
    name: "Exemple — Inès B.",
    company: "Séminaire d'entreprise",
  },
  {
    _id: "sample-6",
    quote: {
      fr: "Une équipe attentive du premier message à la livraison. On recommande sans hésiter.",
      nl: "Een attent team, van het eerste bericht tot de levering. Een aanrader.",
      en: "An attentive team from the first message to the delivery. We recommend them without hesitation.",
    },
    name: "Exemple — Marc et Léa",
    company: "Dîner privé",
  },
];
