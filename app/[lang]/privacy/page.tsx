import { LocaleLink } from "@/components/LocaleLink";
import {
  LegalDoc,
  LegalLink,
  LegalList,
  LegalSection,
} from "@/components/LegalDoc";
import { toLocale, type Locale } from "@/lib/i18n/config";
import { colon, DATA_PROTECTION_AUTHORITY } from "@/lib/legal";
import { routes } from "@/lib/routes";
import { localizedMetadata } from "@/lib/seo";
import { SITE_DETAILS } from "@/lib/site";

export const generateMetadata = localizedMetadata("privacy", {
  path: routes.privacy,
});

type Localized = Record<Locale, string>;

/**
 * One row per processing activity, carrying what art. 13 GDPR asks to be told
 * about each: what data, why, on what legal basis, for how long.
 *
 * Written from what the code does: app/actions/contact.ts and newsletter.ts
 * (Resend), lib/address (Geoapify / UrbIS), lib/rate-limit (the IP address),
 * and Shopify for the cart, checkout and customer accounts. A new form or a
 * new provider means a new row here.
 */
type Activity = {
  title: Localized;
  data: Localized;
  purpose: Localized;
  basis: Localized;
  retention: Localized;
};

const ACTIVITIES: Activity[] = [
  {
    title: {
      fr: "Commandes, paiement et livraison",
      nl: "Bestellingen, betaling en levering",
      en: "Orders, payment and delivery",
    },
    data: {
      fr: "Nom, adresse e-mail, téléphone, adresses de livraison et de facturation, société et numéro de TVA le cas échéant, contenu de la commande, jour et créneau de livraison ou de retrait, remarques que vous ajoutez, historique des paiements. Les données de carte bancaire sont traitées directement par Shopify et ses prestataires de paiement : nous n’y avons jamais accès.",
      nl: "Naam, e-mailadres, telefoonnummer, lever- en factuuradres, bedrijf en btw-nummer indien van toepassing, inhoud van de bestelling, leverings- of afhaaldag en tijdvak, opmerkingen die u toevoegt, betalingsgeschiedenis. Bankkaartgegevens worden rechtstreeks door Shopify en haar betaaldienstverleners verwerkt: wij hebben er nooit toegang toe.",
      en: "Name, email address, phone number, delivery and billing addresses, company and VAT number where relevant, order contents, delivery or collection day and time slot, notes you add, payment history. Card details are processed directly by Shopify and its payment providers: we never have access to them.",
    },
    purpose: {
      fr: "Préparer, livrer et facturer votre commande, vous en informer, traiter une annulation ou une réclamation.",
      nl: "Uw bestelling voorbereiden, leveren en factureren, u op de hoogte houden, een annulering of klacht behandelen.",
      en: "To prepare, deliver and invoice your order, keep you informed and handle a cancellation or complaint.",
    },
    basis: {
      fr: "Exécution du contrat (art. 6.1.b RGPD) ; obligations comptables et fiscales (art. 6.1.c).",
      nl: "Uitvoering van de overeenkomst (art. 6.1.b AVG); boekhoudkundige en fiscale verplichtingen (art. 6.1.c).",
      en: "Performance of the contract (art. 6(1)(b) GDPR); accounting and tax obligations (art. 6(1)(c)).",
    },
    retention: {
      fr: "Factures et pièces comptables : 10 ans, comme l’exige le droit belge. Autres données de commande : 3 ans après votre dernière commande.",
      nl: "Facturen en boekhoudstukken: 10 jaar, zoals het Belgische recht vereist. Andere bestelgegevens: 3 jaar na uw laatste bestelling.",
      en: "Invoices and accounting records: 10 years, as Belgian law requires. Other order data: 3 years after your last order.",
    },
  },
  {
    title: {
      fr: "Allergies et régimes alimentaires",
      nl: "Allergieën en diëten",
      en: "Allergies and dietary requirements",
    },
    data: {
      fr: "Les informations sur des allergies, intolérances ou régimes que vous choisissez de nous communiquer. Elles peuvent révéler des données de santé.",
      nl: "Informatie over allergieën, intoleranties of diëten die u ons wilt meedelen. Die kan gezondheidsgegevens onthullen.",
      en: "Information about allergies, intolerances or diets that you choose to give us. It may reveal health data.",
    },
    purpose: {
      fr: "Uniquement pour adapter et préparer votre commande en toute sécurité.",
      nl: "Uitsluitend om uw bestelling veilig aan te passen en voor te bereiden.",
      en: "Solely to adapt and prepare your order safely.",
    },
    basis: {
      fr: "Votre consentement explicite, donné en nous les communiquant (art. 9.2.a RGPD). Vous pouvez le retirer à tout moment.",
      nl: "Uw uitdrukkelijke toestemming, gegeven door ze ons mee te delen (art. 9.2.a AVG). U kunt die op elk moment intrekken.",
      en: "Your explicit consent, given by sharing it with us (art. 9(2)(a) GDPR). You can withdraw it at any time.",
    },
    retention: {
      fr: "Le temps de préparer et livrer la commande concernée.",
      nl: "Zolang nodig om de betrokken bestelling voor te bereiden en te leveren.",
      en: "For as long as it takes to prepare and deliver the order concerned.",
    },
  },
  {
    title: {
      fr: "Compte client",
      nl: "Klantenaccount",
      en: "Customer account",
    },
    data: {
      fr: "Adresse e-mail, nom, adresses enregistrées, historique des commandes.",
      nl: "E-mailadres, naam, opgeslagen adressen, bestelgeschiedenis.",
      en: "Email address, name, saved addresses, order history.",
    },
    purpose: {
      fr: "Vous permettre de vous connecter, de retrouver vos commandes et d’enregistrer vos adresses.",
      nl: "U laten aanmelden, uw bestellingen terugvinden en uw adressen opslaan.",
      en: "To let you sign in, find your orders and save your addresses.",
    },
    basis: {
      fr: "Exécution du contrat (art. 6.1.b RGPD).",
      nl: "Uitvoering van de overeenkomst (art. 6.1.b AVG).",
      en: "Performance of the contract (art. 6(1)(b) GDPR).",
    },
    retention: {
      fr: "Tant que votre compte existe. Il est supprimé sur simple demande, sous réserve des factures à conserver 10 ans.",
      nl: "Zolang uw account bestaat. Het wordt op eenvoudig verzoek verwijderd, met uitzondering van de facturen die 10 jaar bewaard moeten blijven.",
      en: "For as long as your account exists. It is deleted on request, apart from invoices that must be kept for 10 years.",
    },
  },
  {
    title: {
      fr: "Demandes de devis et de contact",
      nl: "Offerte- en contactaanvragen",
      en: "Quote and contact requests",
    },
    data: {
      fr: "Nom, adresse e-mail, téléphone, société, numéro de TVA, adresse, type d’occasion, date, nombre de personnes et votre message.",
      nl: "Naam, e-mailadres, telefoonnummer, bedrijf, btw-nummer, adres, soort gelegenheid, datum, aantal personen en uw bericht.",
      en: "Name, email address, phone number, company, VAT number, address, type of occasion, date, number of guests and your message.",
    },
    purpose: {
      fr: "Répondre à votre demande et, le cas échéant, établir un devis.",
      nl: "Uw aanvraag beantwoorden en, indien van toepassing, een offerte opstellen.",
      en: "To answer your request and, where relevant, prepare a quote.",
    },
    basis: {
      fr: "Mesures précontractuelles prises à votre demande (art. 6.1.b RGPD) ou notre intérêt légitime à répondre aux messages reçus (art. 6.1.f).",
      nl: "Precontractuele maatregelen op uw verzoek (art. 6.1.b AVG) of ons gerechtvaardigd belang om ontvangen berichten te beantwoorden (art. 6.1.f).",
      en: "Pre-contractual steps taken at your request (art. 6(1)(b) GDPR) or our legitimate interest in answering messages we receive (art. 6(1)(f)).",
    },
    retention: {
      fr: "3 ans après notre dernier échange, sauf si la demande aboutit à une commande.",
      nl: "3 jaar na ons laatste contact, tenzij de aanvraag tot een bestelling leidt.",
      en: "3 years after our last exchange, unless the request leads to an order.",
    },
  },
  {
    title: {
      fr: "Newsletter",
      nl: "Nieuwsbrief",
      en: "Newsletter",
    },
    data: {
      fr: "Votre adresse e-mail.",
      nl: "Uw e-mailadres.",
      en: "Your email address.",
    },
    purpose: {
      fr: "Vous envoyer nos nouveautés, menus de saison et offres.",
      nl: "U onze nieuwigheden, seizoensmenu’s en aanbiedingen sturen.",
      en: "To send you our news, seasonal menus and offers.",
    },
    basis: {
      fr: "Votre consentement (art. 6.1.a RGPD), que vous pouvez retirer à tout moment par le lien présent dans chaque e-mail ou en nous écrivant.",
      nl: "Uw toestemming (art. 6.1.a AVG), die u op elk moment kunt intrekken via de link in elke e-mail of door ons te schrijven.",
      en: "Your consent (art. 6(1)(a) GDPR), which you can withdraw at any time through the link in every email or by writing to us.",
    },
    retention: {
      fr: "Jusqu’à votre désinscription.",
      nl: "Tot u zich uitschrijft.",
      en: "Until you unsubscribe.",
    },
  },
  {
    title: {
      fr: "Vérification de l’adresse de livraison",
      nl: "Controle van het leveradres",
      en: "Delivery address check",
    },
    data: {
      fr: "L’adresse que vous saisissez dans le panier.",
      nl: "Het adres dat u in de winkelmand invoert.",
      en: "The address you type into the basket.",
    },
    purpose: {
      fr: "Proposer des adresses existantes, calculer la distance depuis notre atelier et donc la zone, les frais et le minimum de commande.",
      nl: "Bestaande adressen voorstellen, de afstand tot ons atelier berekenen en dus de zone, de kosten en het minimale bestelbedrag.",
      en: "To suggest real addresses and work out the distance from our atelier, and so the zone, the fee and the minimum order.",
    },
    basis: {
      fr: "Mesures précontractuelles et exécution du contrat (art. 6.1.b RGPD).",
      nl: "Precontractuele maatregelen en uitvoering van de overeenkomst (art. 6.1.b AVG).",
      en: "Pre-contractual steps and performance of the contract (art. 6(1)(b) GDPR).",
    },
    retention: {
      fr: "Le temps de la recherche ; l’adresse retenue suit ensuite la durée de la commande.",
      nl: "Zolang de opzoeking duurt; het gekozen adres volgt daarna de bewaartermijn van de bestelling.",
      en: "For the duration of the lookup; the address you choose then follows the order’s retention period.",
    },
  },
  {
    title: {
      fr: "Mesure d’audience (Google Analytics)",
      nl: "Bezoekersmeting (Google Analytics)",
      en: "Audience measurement (Google Analytics)",
    },
    data: {
      fr: "Identifiant pseudonyme du navigateur (cookie), pages consultées, provenance de la visite, type d’appareil et de navigateur, localisation approximative (ville, pays), et pour une commande : son numéro, son montant et les produits commandés. Google Analytics ne conserve pas l’adresse IP. Aucun signal publicitaire n’est activé.",
      nl: "Pseudonieme identificatie van de browser (cookie), bekeken pagina’s, herkomst van het bezoek, type toestel en browser, geschatte locatie (stad, land), en bij een bestelling: het nummer, het bedrag en de bestelde producten. Google Analytics bewaart het IP-adres niet. Er zijn geen reclamesignalen ingeschakeld.",
      en: "A pseudonymous browser identifier (cookie), pages viewed, where the visit came from, device and browser type, approximate location (city, country), and for an order: its number, amount and the products ordered. Google Analytics does not store the IP address. No advertising signals are enabled.",
    },
    purpose: {
      fr: "Comprendre la fréquentation du site, les sources de trafic et le parcours jusqu’à la commande, pour améliorer le site et l’offre.",
      nl: "Het bezoek aan de website, de verkeersbronnen en het traject tot de bestelling begrijpen, om de website en het aanbod te verbeteren.",
      en: "To understand visits to the site, traffic sources and the path to an order, in order to improve the site and the offer.",
    },
    basis: {
      fr: "Votre consentement, donné via le bandeau cookies (art. 6.1.a RGPD), que vous pouvez retirer à tout moment.",
      nl: "Uw toestemming, gegeven via de cookiebanner (art. 6.1.a AVG), die u op elk moment kunt intrekken.",
      en: "Your consent, given through the cookie banner (art. 6(1)(a) GDPR), which you can withdraw at any time.",
    },
    retention: {
      fr: "Cookies : 13 mois. Données dans Google Analytics : 14 mois, puis suppression automatique.",
      nl: "Cookies: 13 maanden. Gegevens in Google Analytics: 14 maanden, daarna automatisch gewist.",
      en: "Cookies: 13 months. Data in Google Analytics: 14 months, then deleted automatically.",
    },
  },
  {
    title: {
      fr: "Sécurité du site",
      nl: "Beveiliging van de website",
      en: "Site security",
    },
    data: {
      fr: "Adresse IP et données techniques de connexion (navigateur, pages demandées, date et heure).",
      nl: "IP-adres en technische verbindingsgegevens (browser, opgevraagde pagina’s, datum en tijd).",
      en: "IP address and technical connection data (browser, pages requested, date and time).",
    },
    purpose: {
      fr: "Faire fonctionner le site, limiter les envois abusifs des formulaires et détecter les attaques.",
      nl: "De website laten werken, misbruik van de formulieren beperken en aanvallen opsporen.",
      en: "To run the site, limit abusive form submissions and detect attacks.",
    },
    basis: {
      fr: "Notre intérêt légitime à assurer la sécurité du site (art. 6.1.f RGPD).",
      nl: "Ons gerechtvaardigd belang om de website te beveiligen (art. 6.1.f AVG).",
      en: "Our legitimate interest in keeping the site secure (art. 6(1)(f) GDPR).",
    },
    retention: {
      fr: "Quelques minutes pour la limitation des envois ; les journaux techniques de l’hébergeur sont conservés pour une courte durée, au plus 30 jours.",
      nl: "Enkele minuten voor de beperking van inzendingen; de technische logbestanden van de host worden kort bewaard, hoogstens 30 dagen.",
      en: "A few minutes for submission limits; the host’s technical logs are kept for a short time, at most 30 days.",
    },
  },
];

type Processor = { name: string; role: Localized };

const PROCESSORS: Processor[] = [
  {
    name: "Shopify International Ltd (Irlande / Ierland / Ireland)",
    role: {
      fr: "boutique en ligne, panier, paiement, comptes clients et e-mails de commande",
      nl: "webwinkel, winkelmand, betaling, klantenaccounts en bestelmails",
      en: "online shop, basket, payment, customer accounts and order emails",
    },
  },
  {
    name: "Vercel Inc. (États-Unis / Verenigde Staten / United States)",
    role: {
      fr: "hébergement du site",
      nl: "hosting van de website",
      en: "website hosting",
    },
  },
  {
    name: "Resend (Plus Five Five, Inc., États-Unis / Verenigde Staten / United States)",
    role: {
      fr: "acheminement des e-mails envoyés par les formulaires de contact et de newsletter",
      nl: "verzending van de e-mails van het contact- en nieuwsbriefformulier",
      en: "delivery of the emails sent by the contact and newsletter forms",
    },
  },
  {
    name: "Google Ireland Ltd (Irlande / Ierland / Ireland)",
    role: {
      fr: "mesure d’audience (Google Analytics), uniquement si vous l’acceptez",
      nl: "bezoekersmeting (Google Analytics), alleen als u dat aanvaardt",
      en: "audience measurement (Google Analytics), only if you accept it",
    },
  },
  {
    name: "Geoapify GmbH (Allemagne / Duitsland / Germany) — UrbIS, Région de Bruxelles-Capitale / Brussels Hoofdstedelijk Gewest",
    role: {
      fr: "recherche et vérification d’adresses, et fonds de carte de la page « Où nous trouver » (votre navigateur leur transmet alors votre adresse IP, sans cookie)",
      nl: "opzoeken en controleren van adressen, en de kaartachtergrond van de pagina ‘Waar vindt u ons’ (uw browser geeft daarbij uw IP-adres door, zonder cookie)",
      en: "address search and verification, and the map tiles on the ‘Find us’ page (your browser then sends them your IP address, with no cookie)",
    },
  },
];

const COPY = {
  fr: {
    title: "Confidentialité",
    lead: "Comment MOMENT LAB SRL collecte, utilise et protège vos données personnelles, conformément au RGPD et au droit belge.",
    controller: "Responsable du traitement",
    controllerBody:
      "Le responsable du traitement de vos données est MOMENT LAB SRL, dont le siège est situé",
    enterprise: "numéro d’entreprise",
    contactUs: "Pour toute question ou demande relative à vos données, écrivez-nous à",
    activities: "Ce que nous traitons, pourquoi et combien de temps",
    data: "Données",
    purpose: "Finalité",
    basis: "Base légale",
    retention: "Durée de conservation",
    required: "Données obligatoires",
    requiredBody:
      "Les champs marqués comme obligatoires sont nécessaires pour traiter votre commande ou votre demande. Sans eux, nous ne pouvons pas y donner suite. Nous ne prenons aucune décision fondée exclusivement sur un traitement automatisé et ne faisons pas de profilage.",
    recipients: "Destinataires",
    recipientsIntro:
      "Vos données ne sont jamais vendues. Elles sont accessibles à notre équipe, dans la limite de ce dont chacun a besoin, et à des prestataires (sous-traitants) qui agissent sur nos instructions et sont liés par un contrat de traitement :",
    recipientsOther:
      "Elles peuvent aussi être communiquées à notre comptable, à la personne qui livre votre commande (uniquement le nom, l’adresse, le téléphone et le créneau), et aux autorités lorsque la loi l’impose.",
    transfers: "Transferts hors de l’Union européenne",
    transfersBody:
      "Certains prestataires (Shopify, Vercel, Resend, Google) peuvent traiter des données au Canada ou aux États-Unis. Ces transferts reposent sur une décision d’adéquation de la Commission européenne — pour le Canada, et pour les entreprises américaines certifiées au titre du cadre de protection des données UE–États-Unis (Data Privacy Framework) — ou, à défaut, sur les clauses contractuelles types adoptées par la Commission européenne.",
    rights: "Vos droits",
    rightsIntro: "Vous disposez à tout moment des droits suivants :",
    rightsList: [
      "accéder à vos données et en obtenir une copie ;",
      "les faire rectifier si elles sont inexactes ou incomplètes ;",
      "les faire effacer, sauf lorsque la loi nous oblige à les conserver ;",
      "en limiter le traitement ;",
      "les recevoir dans un format structuré et les faire transmettre à un autre responsable (portabilité) ;",
      "vous opposer à un traitement fondé sur notre intérêt légitime, et à tout moment à l’envoi de communications commerciales ;",
      "retirer votre consentement à tout moment, sans que cela remette en cause les traitements déjà effectués.",
    ],
    rightsHow:
      "Pour exercer ces droits, écrivez-nous à l’adresse ci-dessus. Nous répondons dans un délai d’un mois. Si nous avons un doute raisonnable sur votre identité, nous pouvons vous demander de la confirmer.",
    complaint: "Réclamation",
    complaintBody:
      "Si vous estimez que vos données ne sont pas traitées correctement, vous pouvez introduire une réclamation auprès de l’",
    security: "Sécurité",
    securityBody:
      "Le site est servi exclusivement en HTTPS, les paiements sont traités par Shopify selon la norme PCI DSS, et l’accès aux données est limité aux personnes qui en ont besoin.",
    cookies: "Cookies",
    cookiesBody: "L’utilisation des cookies est décrite dans notre",
    cookiesLink: "politique cookies",
    changes: "Modifications",
    changesBody:
      "Nous pouvons mettre à jour cette politique, par exemple si nous changeons de prestataire. La date de la dernière mise à jour figure en bas de page.",
  },
  nl: {
    title: "Privacy",
    lead: "Hoe MOMENT LAB SRL uw persoonsgegevens verzamelt, gebruikt en beschermt, overeenkomstig de AVG en het Belgische recht.",
    controller: "Verwerkingsverantwoordelijke",
    controllerBody:
      "De verwerkingsverantwoordelijke voor uw gegevens is MOMENT LAB SRL, met zetel te",
    enterprise: "ondernemingsnummer",
    contactUs: "Voor elke vraag of elk verzoek over uw gegevens kunt u ons schrijven op",
    activities: "Wat we verwerken, waarom en hoelang",
    data: "Gegevens",
    purpose: "Doel",
    basis: "Rechtsgrond",
    retention: "Bewaartermijn",
    required: "Verplichte gegevens",
    requiredBody:
      "De velden die als verplicht zijn aangeduid, zijn nodig om uw bestelling of aanvraag te behandelen. Zonder die gegevens kunnen we er geen gevolg aan geven. We nemen geen beslissingen die uitsluitend op geautomatiseerde verwerking berusten en doen niet aan profilering.",
    recipients: "Ontvangers",
    recipientsIntro:
      "Uw gegevens worden nooit verkocht. Ze zijn toegankelijk voor ons team, voor zover ieder ze nodig heeft, en voor dienstverleners (verwerkers) die volgens onze instructies handelen en gebonden zijn door een verwerkersovereenkomst:",
    recipientsOther:
      "Ze kunnen ook worden meegedeeld aan onze boekhouder, aan de persoon die uw bestelling levert (alleen naam, adres, telefoonnummer en tijdvak), en aan de overheid wanneer de wet dat oplegt.",
    transfers: "Doorgifte buiten de Europese Unie",
    transfersBody:
      "Sommige dienstverleners (Shopify, Vercel, Resend, Google) kunnen gegevens verwerken in Canada of de Verenigde Staten. Die doorgiften steunen op een adequaatheidsbesluit van de Europese Commissie — voor Canada, en voor Amerikaanse bedrijven die gecertificeerd zijn onder het EU-VS-kader voor gegevensbescherming (Data Privacy Framework) — of, bij gebrek daaraan, op de door de Europese Commissie goedgekeurde modelcontractbepalingen.",
    rights: "Uw rechten",
    rightsIntro: "U hebt op elk moment de volgende rechten:",
    rightsList: [
      "uw gegevens inzien en er een kopie van krijgen;",
      "ze laten verbeteren als ze onjuist of onvolledig zijn;",
      "ze laten wissen, behalve wanneer de wet ons verplicht ze te bewaren;",
      "de verwerking ervan laten beperken;",
      "ze in een gestructureerd formaat ontvangen en aan een andere verantwoordelijke laten doorgeven (overdraagbaarheid);",
      "bezwaar maken tegen een verwerking die op ons gerechtvaardigd belang steunt, en op elk moment tegen het ontvangen van commerciële berichten;",
      "uw toestemming op elk moment intrekken, zonder dat dit afbreuk doet aan de verwerking die al heeft plaatsgevonden.",
    ],
    rightsHow:
      "Om deze rechten uit te oefenen, schrijft u ons op het adres hierboven. We antwoorden binnen een maand. Als we redelijke twijfel hebben over uw identiteit, kunnen we u vragen die te bevestigen.",
    complaint: "Klacht",
    complaintBody:
      "Als u vindt dat uw gegevens niet correct worden verwerkt, kunt u een klacht indienen bij de ",
    security: "Beveiliging",
    securityBody:
      "De website wordt uitsluitend via HTTPS aangeboden, betalingen worden door Shopify verwerkt volgens de PCI DSS-norm, en de toegang tot gegevens is beperkt tot wie ze nodig heeft.",
    cookies: "Cookies",
    cookiesBody: "Het gebruik van cookies wordt beschreven in ons",
    cookiesLink: "cookiebeleid",
    changes: "Wijzigingen",
    changesBody:
      "We kunnen dit beleid bijwerken, bijvoorbeeld als we van dienstverlener veranderen. De datum van de laatste wijziging staat onderaan de pagina.",
  },
  en: {
    title: "Privacy",
    lead: "How MOMENT LAB SRL collects, uses and protects your personal data, in accordance with the GDPR and Belgian law.",
    controller: "Data controller",
    controllerBody:
      "The controller of your personal data is MOMENT LAB SRL, with its registered office at",
    enterprise: "enterprise number",
    contactUs: "For any question or request about your data, write to us at",
    activities: "What we process, why and for how long",
    data: "Data",
    purpose: "Purpose",
    basis: "Legal basis",
    retention: "Retention",
    required: "Required data",
    requiredBody:
      "Fields marked as required are needed to process your order or request; without them we cannot act on it. We do not take decisions based solely on automated processing and do not carry out profiling.",
    recipients: "Recipients",
    recipientsIntro:
      "Your data is never sold. It is available to our team, limited to what each person needs, and to service providers (processors) who act on our instructions and are bound by a data processing agreement:",
    recipientsOther:
      "It may also be shared with our accountant, with the person delivering your order (only the name, address, phone number and time slot), and with the authorities where the law requires it.",
    transfers: "Transfers outside the European Union",
    transfersBody:
      "Some providers (Shopify, Vercel, Resend, Google) may process data in Canada or the United States. These transfers rely on an adequacy decision of the European Commission — for Canada, and for US companies certified under the EU–US Data Privacy Framework — or, failing that, on the standard contractual clauses adopted by the European Commission.",
    rights: "Your rights",
    rightsIntro: "You have the following rights at any time:",
    rightsList: [
      "to access your data and obtain a copy of it;",
      "to have it corrected if it is inaccurate or incomplete;",
      "to have it erased, except where the law requires us to keep it;",
      "to restrict its processing;",
      "to receive it in a structured format and have it passed to another controller (portability);",
      "to object to processing based on our legitimate interest, and at any time to receiving marketing communications;",
      "to withdraw your consent at any time, without affecting processing already carried out.",
    ],
    rightsHow:
      "To exercise these rights, write to us at the address above. We reply within one month. If we have reasonable doubts about your identity, we may ask you to confirm it.",
    complaint: "Complaints",
    complaintBody:
      "If you believe your data is not being handled properly, you can lodge a complaint with the ",
    security: "Security",
    securityBody:
      "The site is served over HTTPS only, payments are processed by Shopify to the PCI DSS standard, and access to data is limited to those who need it.",
    cookies: "Cookies",
    cookiesBody: "How we use cookies is described in our",
    cookiesLink: "cookie policy",
    changes: "Changes",
    changesBody:
      "We may update this policy, for example if we change provider. The date of the latest update is shown at the bottom of the page.",
  },
} satisfies Record<Locale, Record<string, string | string[]>>;

const linkClassName =
  "underline underline-offset-2 transition-opacity hover:opacity-60";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const locale = toLocale((await params).lang);
  const t = COPY[locale];
  const c = colon(locale);
  const { contact, legal } = SITE_DETAILS;
  const authority = DATA_PROTECTION_AUTHORITY;

  return (
    <LegalDoc locale={locale} title={t.title} lead={t.lead}>
      <LegalSection title={t.controller}>
        <p>
          {t.controllerBody} {contact.street}, {contact.postalCode}{" "}
          {locale === "nl" ? "Vorst" : "Forest"} ({t.enterprise}{" "}
          {legal.enterpriseNumber}).
        </p>
        <p>
          {t.contactUs}{" "}
          <LegalLink href={`mailto:${contact.email}`}>{contact.email}</LegalLink>
          .
        </p>
      </LegalSection>

      <LegalSection title={t.activities}>
        <ul className="divide-y divide-sky border-y border-sky">
          {ACTIVITIES.map((activity) => (
            <li key={activity.title.en} className="space-y-1.5 py-4">
              <h3 className="font-owners-medium text-[12px] tracking-wide uppercase">
                {activity.title[locale]}
              </h3>
              <p>
                <strong className="font-owners-medium">{t.data}</strong>
                {c}
                {activity.data[locale]}
              </p>
              <p>
                <strong className="font-owners-medium">{t.purpose}</strong>
                {c}
                {activity.purpose[locale]}
              </p>
              <p>
                <strong className="font-owners-medium">{t.basis}</strong>
                {c}
                {activity.basis[locale]}
              </p>
              <p>
                <strong className="font-owners-medium">{t.retention}</strong>
                {c}
                {activity.retention[locale]}
              </p>
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title={t.required}>
        <p>{t.requiredBody}</p>
      </LegalSection>

      <LegalSection title={t.recipients}>
        <p>{t.recipientsIntro}</p>
        <LegalList>
          {PROCESSORS.map((processor) => (
            <li key={processor.name}>
              {processor.name} — {processor.role[locale]}
            </li>
          ))}
        </LegalList>
        <p>{t.recipientsOther}</p>
      </LegalSection>

      <LegalSection title={t.transfers}>
        <p>{t.transfersBody}</p>
      </LegalSection>

      <LegalSection title={t.rights}>
        <p>{t.rightsIntro}</p>
        <LegalList>
          {t.rightsList.map((right) => (
            <li key={right}>{right}</li>
          ))}
        </LegalList>
        <p>{t.rightsHow}</p>
      </LegalSection>

      <LegalSection title={t.complaint}>
        <p>
          {t.complaintBody}
          {authority.name[locale]}, {authority.address[locale]},{" "}
          <LegalLink href={`mailto:${authority.email}`}>
            {authority.email}
          </LegalLink>
          ,{" "}
          <LegalLink href={authority.url[locale]}>
            {authority.url[locale].replace(/^https:\/\/(www\.)?/, "")}
          </LegalLink>
          .
        </p>
      </LegalSection>

      <LegalSection title={t.security}>
        <p>{t.securityBody}</p>
      </LegalSection>

      <LegalSection title={t.cookies}>
        <p>
          {t.cookiesBody}{" "}
          <LocaleLink href={routes.cookies} className={linkClassName}>
            {t.cookiesLink}
          </LocaleLink>
          .
        </p>
      </LegalSection>

      <LegalSection title={t.changes}>
        <p>{t.changesBody}</p>
      </LegalSection>
    </LegalDoc>
  );
}
