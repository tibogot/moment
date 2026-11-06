import { LegalDoc, LegalSection } from "@/components/LegalDoc";
import { LocaleLink } from "@/components/LocaleLink";
import {
  DEFAULT_NEXT_DAY_CUTOFF_HOUR,
  formatCutoffHour,
} from "@/lib/delivery/dates";
import { formatSlot, formatWindow } from "@/lib/delivery/slots";
import {
  freeDeliveryThresholdFor,
  maxDeliveryDistanceKm,
} from "@/lib/delivery/zones";
import { toLocale, type Locale } from "@/lib/i18n/config";
import { formatMoney } from "@/lib/i18n/format";
import { routes } from "@/lib/routes";
import { localizedMetadata } from "@/lib/seo";
import { getDeliveryRules } from "@/lib/shopify/zones";
import { formatAddressLine, SITE_DETAILS } from "@/lib/site";

export const generateMetadata = localizedMetadata("shipping", {
  path: routes.shipping,
});

/**
 * Delivery and returns, written from the rules the checkout actually enforces.
 *
 * The bands, the windows, the cut-off and the cancellation policy are the
 * owners' own, so this is a server
 * component reading the same tables the cart prices against, for the same
 * reason the FAQ is: terms of sale that contradict the checkout are worse than
 * terms nobody wrote.
 *
 * In all three languages. The 24-hour cancellation rule
 * is repeated on the terms page and in the FAQ — change all three together.
 */
type Facts = {
  maxKm: number;
  address: string;
  lead: number;
  cutoff: string;
  slots: string;
  pickup: string;
  pickupMinimum: string;
  pickupSlots: string;
  nextDayCutoff: string;
  nextDayMinimum: string;
};

type ShippingCopy = {
  title: string;
  lead: string;
  area: string;
  areaIntro: (f: Facts) => string;
  region: string;
  band: (fee: string, min: string, free: string) => string;
  free: (f: Facts) => string;
  distance: string;
  timing: string;
  timingBody: (f: Facts) => string;
  slotsBody: (f: Facts) => string;
  events: string;
  collection: string;
  collectionBody: (f: Facts) => string;
  cancel: string;
  cancelLines: string[];
  returns: string;
  returnsBody: string;
  termsLink: string;
};

const COPY: Record<Locale, ShippingCopy> = {
  fr: {
    title: "Livraison et retours",
    lead: "Comment fonctionnent la livraison, le retrait et l’annulation des commandes Moment. Les frais, minimums et délais ci-dessous sont ceux appliqués au paiement.",
    area: "Zone de livraison et frais",
    areaIntro: (f) =>
      `Nous livrons jusqu’à ${f.maxKm} km de l’atelier, ${f.address}. Les frais et le minimum de commande dépendent de la distance :`,
    region: "Région de Bruxelles-Capitale",
    band: (fee, min, free) =>
      `${fee}, minimum de commande ${min}, livraison offerte à partir de ${free}`,
    free: (f) =>
      `Au-delà de ${f.maxKm} km, nous établissons un devis sur mesure : le site vous redirige alors vers le formulaire de demande.`,
    distance:
      "Les distances sont mesurées à vol d’oiseau depuis l’atelier, et non par la route : la zone qui vous est attribuée est donc fixée dès l’enregistrement de votre adresse et ne change pas d’ici au paiement. La distance routière étant généralement supérieure de 20 à 30 %, ce calcul joue en votre faveur.",
    timing: "Délais et créneaux de livraison",
    timingBody: (f) =>
      `Les commandes doivent être passées au moins ${f.lead} jours à l’avance, avant ${f.cutoff}. Une commande passée après ${f.cutoff} est considérée comme passée le lendemain, et le délai court à partir de ce jour-là. Le calendrier du site ne propose que les jours encore disponibles.`,
    slotsBody: (f) =>
      `Les livraisons se font par créneaux de deux heures, choisis lors de la commande : ${f.slots}. Si le créneau souhaité est complet, contactez-nous : selon votre adresse et la tournée prévue, nous pourrons peut-être vous ajouter à une livraison existante.`,
    events:
      "Les prestations traiteur pour événements font l’objet d’un devis et leurs horaires sont convenus au cas par cas.",
    collection: "Retrait à l’atelier",
    collectionBody: (f) =>
      `Les commandes peuvent être retirées à l’atelier, ${f.address}, gratuitement, avec un minimum de commande de ${f.pickupMinimum}, à l’heure choisie lors de la commande : ${f.pickupSlots}. Les cookies, cakes, healthy snacks, produits d’épicerie et jus pressés à froid peuvent être commandés jusqu’à ${f.nextDayCutoff} la veille pour un retrait le lendemain, avec un minimum de ${f.nextDayMinimum} ; une commande qui contient d’autres produits suit le délai habituel de ${f.lead} jours.`,
    cancel: "Annulation et remboursement",
    cancelLines: [
      "Toute commande peut être annulée gratuitement jusqu’à 24 heures avant la date de livraison prévue ; le montant total est alors remboursé.",
      "Une annulation intervenant moins de 24 heures avant la livraison ne peut, en règle générale, pas être remboursée : les produits sont frais et préparés spécialement pour chaque commande.",
      "En cas de problème avec notre service, ou si les produits ne correspondent pas à la commande, contactez-nous immédiatement pour que nous puissions y remédier.",
    ],
    returns: "Retours",
    returnsBody:
      "Nos produits étant frais et périssables, le droit de rétractation de 14 jours ne s’applique pas à la plupart d’entre eux. Une commande abîmée ou incorrecte doit nous être signalée le plus tôt possible après la livraison, idéalement avec une photo, afin que nous puissions la remplacer ou la rembourser. Les règles complètes — y compris pour les produits non périssables — figurent aux articles 8 et 9 des",
    termsLink: "conditions de vente",
  },
  nl: {
    title: "Levering en retour",
    lead: "Hoe levering, afhaling en annulering van Moment-bestellingen werken. De kosten, minimumbedragen en termijnen hieronder zijn die welke bij het afrekenen worden toegepast.",
    area: "Leveringsgebied en kosten",
    areaIntro: (f) =>
      `We leveren tot ${f.maxKm} km van het atelier, ${f.address}. De kosten en het minimale bestelbedrag hangen af van de afstand:`,
    region: "Brussels Hoofdstedelijk Gewest",
    band: (fee, min, free) =>
      `${fee}, minimaal bestelbedrag ${min}, gratis levering vanaf ${free}`,
    free: (f) =>
      `Voorbij ${f.maxKm} km maken we een offerte op maat: de website verwijst u dan naar het aanvraagformulier.`,
    distance:
      "Afstanden worden in vogelvlucht vanaf het atelier gemeten en niet over de weg. De zone waarin u valt, ligt dus vast zodra uw adres is opgeslagen en verandert niet meer tot de betaling. Omdat de afstand over de weg doorgaans 20 à 30 % groter is, valt die berekening in uw voordeel uit.",
    timing: "Termijnen en levertijdvakken",
    timingBody: (f) =>
      `Bestellingen moeten minstens ${f.lead} dagen op voorhand worden geplaatst, vóór ${f.cutoff}. Een bestelling na ${f.cutoff} geldt als geplaatst op de volgende dag, en de termijn begint dan te lopen. De kalender op de website toont alleen de dagen die nog beschikbaar zijn.`,
    slotsBody: (f) =>
      `Leveringen gebeuren in tijdvakken van twee uur, die u bij het bestellen kiest: ${f.slots}. Is het gewenste tijdvak vol, neem dan contact met ons op: afhankelijk van uw adres en de geplande ronde kunnen we u misschien aan een bestaande levering toevoegen.`,
    events:
      "Catering voor evenementen gebeurt op offerte en de uurregeling wordt geval per geval afgesproken.",
    collection: "Afhalen in het atelier",
    collectionBody: (f) =>
      `Bestellingen kunnen gratis worden afgehaald in het atelier, ${f.address}, met een minimumbedrag van ${f.pickupMinimum}, op het uur dat u bij de bestelling kiest: ${f.pickupSlots}. Cookies, cakes, healthy snacks, kruidenierswaren en koudgeperste sappen kunnen tot ${f.nextDayCutoff} de dag ervoor worden besteld om de volgende dag af te halen, met een minimumbedrag van ${f.nextDayMinimum}; een bestelling met andere producten volgt de gewone termijn van ${f.lead} dagen.`,
    cancel: "Annulering en terugbetaling",
    cancelLines: [
      "Elke bestelling kan kosteloos worden geannuleerd tot 24 uur vóór de geplande leveringsdatum; het volledige bedrag wordt dan terugbetaald.",
      "Een annulering minder dan 24 uur vóór de levering kan in de regel niet worden terugbetaald: de producten zijn vers en worden speciaal voor elke bestelling bereid.",
      "Is er een probleem met onze dienstverlening, of komen de producten niet overeen met de bestelling, neem dan meteen contact met ons op zodat we het kunnen rechtzetten.",
    ],
    returns: "Retour",
    returnsBody:
      "Omdat onze producten vers en bederfelijk zijn, geldt het herroepingsrecht van 14 dagen voor de meeste ervan niet. Een beschadigde of onjuiste bestelling moet zo snel mogelijk na de levering worden gemeld, bij voorkeur met een foto, zodat we ze kunnen vervangen of terugbetalen. De volledige regels — ook voor niet-bederfelijke producten — staan in de artikelen 8 en 9 van de",
    termsLink: "verkoopvoorwaarden",
  },
  en: {
    title: "Shipping & returns",
    lead: "How delivery, collection and cancellation work for Moment orders. The fees, minimums and lead times below are the ones the checkout applies.",
    area: "Delivery area and fees",
    areaIntro: (f) =>
      `We deliver up to ${f.maxKm} km from the atelier at ${f.address}. The fee and the minimum order depend on the distance:`,
    region: "Brussels-Capital Region",
    band: (fee, min, free) =>
      `${fee}, minimum order ${min}, free delivery from ${free}`,
    free: (f) =>
      `Beyond ${f.maxKm} km we quote by hand — the site will send you to the enquiry form rather than price the trip itself.`,
    distance:
      "Distances are measured in a straight line from the atelier rather than by road, so the band you fall in is fixed the moment your address is saved and cannot change between then and checkout. Road distance is typically 20–30% greater, which means the bands are applied generously rather than strictly.",
    timing: "Lead time and delivery windows",
    timingBody: (f) =>
      `Orders need at least ${f.lead} days’ notice and close at ${f.cutoff}. An order placed after ${f.cutoff} counts as placed the following day, so the notice period starts from then. The calendar on the site only offers days that are still open.`,
    slotsBody: (f) =>
      `Deliveries run in two-hour windows, chosen when you order: ${f.slots}. If the window you want is full, contact us — depending on your location and the route already planned, we may be able to add you to an existing round.`,
    events:
      "Event catering is quoted rather than ordered online and its timings are agreed case by case.",
    collection: "Collection",
    collectionBody: (f) =>
      `Orders can be collected from the atelier at ${f.address}, free of charge, with a minimum order of ${f.pickupMinimum}, at the time chosen when ordering: ${f.pickupSlots}. Cookies, cakes, healthy snacks, pantry goods and cold-pressed juices can be ordered until ${f.nextDayCutoff} the day before for collection the next day, with a minimum of ${f.nextDayMinimum}; an order that includes anything else follows the standard ${f.lead}-day notice.`,
    cancel: "Cancellation and refunds",
    cancelLines: [
      "Any order may be cancelled free of charge up to 24 hours before the scheduled delivery date, and the full amount is refunded.",
      "Cancellations made less than 24 hours before delivery cannot, as a rule, be refunded: the products are fresh and prepared specifically for each order.",
      "If there is a problem with our service, or the products do not match the order, contact us immediately so we can put it right.",
    ],
    returns: "Returns",
    returnsBody:
      "Because our products are fresh and perishable, the 14-day right of withdrawal does not apply to most of them. Damaged or incorrect orders should be reported as soon as possible after delivery, ideally with a photo, so we can replace or refund them. The full rules — including for non-perishable products — are set out in sections 8 and 9 of the",
    termsLink: "terms of sale",
  },
};

export default async function ShippingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = toLocale(lang);
  const t = COPY[locale];
  const { availability, zones, slots, pickupSlots, pickupWindow } =
    await getDeliveryRules();

  const cutoff = formatCutoffHour(availability.cutoffHour);
  const maxKm = maxDeliveryDistanceKm(zones);
  // Forest is Vorst in Dutch; the street name is the same in both.
  const address =
    locale === "nl"
      ? formatAddressLine(SITE_DETAILS).replace(/Forest$/, "Vorst")
      : formatAddressLine(SITE_DETAILS);

  const facts: Facts = {
    maxKm,
    address,
    lead: availability.leadTimeDays,
    cutoff,
    slots: slots.map(formatSlot).join(", "),
    pickup: formatWindow(pickupWindow),
    pickupMinimum: formatMoney(locale, zones.pickupMinimumOrder),
    pickupSlots: pickupSlots.map(formatSlot).join(", "),
    nextDayCutoff: formatCutoffHour(
      availability.nextDay?.cutoffHour ?? DEFAULT_NEXT_DAY_CUTOFF_HOUR,
    ),
    nextDayMinimum: formatMoney(locale, zones.nextDayPickupMinimumOrder),
  };

  return (
    <LegalDoc locale={locale} title={t.title} lead={t.lead}>
      <LegalSection title={t.area}>
        <p>{t.areaIntro(facts)}</p>
        <ul className="list-disc space-y-1 pl-5">
          {zones.zones.map((zone, index) => {
            const from = zones.zones[index - 1]?.maxDistanceKm ?? 0;

            return (
              <li key={zone.id}>
                {zone.maxDistanceKm === null
                  ? t.region
                  : `${from}–${zone.maxDistanceKm} km`}
                {" — "}
                {t.band(
                  formatMoney(locale, zone.fee),
                  formatMoney(locale, zone.minimumOrder),
                  formatMoney(locale, freeDeliveryThresholdFor(zone, zones)),
                )}
              </li>
            );
          })}
        </ul>
        <p>{t.free(facts)}</p>
        {/* The client should know this is stated, and why. It is a pricing
            decision of theirs, not an implementation detail of ours. */}
        <p>{t.distance}</p>
      </LegalSection>

      <LegalSection title={t.timing}>
        <p>{t.timingBody(facts)}</p>
        <p>{t.slotsBody(facts)}</p>
        <p>{t.events}</p>
      </LegalSection>

      <LegalSection title={t.collection}>
        <p>{t.collectionBody(facts)}</p>
      </LegalSection>

      <LegalSection title={t.cancel}>
        {t.cancelLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </LegalSection>

      <LegalSection title={t.returns}>
        <p>
          {t.returnsBody}{" "}
          <LocaleLink
            href={routes.terms}
            className="underline underline-offset-2 transition-opacity hover:opacity-60"
          >
            {t.termsLink}
          </LocaleLink>
          .
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
