import { LocaleLink } from "@/components/LocaleLink";
import {
  LegalDoc,
  LegalLink,
  LegalList,
  LegalSection,
  legalLinkClassName,
} from "@/components/LegalDoc";
import { toLocale, type Locale } from "@/lib/i18n/config";
import { CONSUMER_MEDIATION } from "@/lib/legal";
import { routes } from "@/lib/routes";
import { localizedMetadata } from "@/lib/seo";
import { SITE_DETAILS } from "@/lib/site";

export const generateMetadata = localizedMetadata("terms", {
  path: routes.terms,
});

/**
 * General terms of sale.
 *
 * Written against Book VI of the Belgian Code of Economic Law (pre-contractual
 * information, art. VI.45; withdrawal and its exceptions, art. VI.47–VI.53)
 * and the legal guarantee of conformity in the Civil Code (art. 1649bis ff.).
 * The 24-hour cancellation rule is the owners' own and is
 * repeated on the shipping page and in the FAQ — change all three together.
 *
 * No link to the EU ODR platform: it was abolished on 20 July 2025
 * (Regulation (EU) 2024/3228), and a dead link is worse than none.
 */
const COPY = {
  fr: {
    title: "Conditions de vente",
    lead: "Conditions générales de vente applicables aux commandes en ligne et aux prestations traiteur de MOMENT LAB SRL.",
    scope: "1. Vendeur et champ d’application",
    scopeBody:
      "Le site moment-lab.be est exploité par MOMENT LAB SRL, dont les coordonnées complètes figurent dans les",
    scopeLink: "mentions légales",
    scopeBody2:
      "Les présentes conditions s’appliquent à toute commande passée sur le site et à toute prestation traiteur, par des consommateurs comme par des clients professionnels. Un accord écrit spécifique (par exemple un devis signé ou un contrat-cadre) prévaut sur elles pour ce qu’il règle. En validant votre commande, vous déclarez avoir lu et accepté ces conditions.",
    products: "2. Produits",
    productsBody:
      "Nos produits sont préparés de façon artisanale ; les photos sont indicatives et peuvent différer légèrement du produit livré. Les informations sur les ingrédients et les allergènes sont indiquées sur la fiche produit et peuvent toujours nous être demandées avant de commander. Signalez-nous toute allergie ou intolérance au moment de la commande. Nos produits étant préparés dans un même atelier, nous ne pouvons pas exclure la présence de traces d’allergènes.",
    order: "3. Commande et conclusion du contrat",
    orderBody:
      "Vous choisissez vos produits, le jour et le mode de livraison ou de retrait, puis vous payez sur la page de paiement sécurisée. Le récapitulatif affiché avant le paiement vous permet de vérifier et de corriger votre commande. Le contrat est conclu lorsque le paiement est accepté ; vous recevez alors une confirmation par e-mail. Pour une prestation traiteur, le contrat est conclu à l’acceptation écrite de notre devis.",
    prices: "4. Prix",
    pricesBody:
      "Les prix sont indiqués en euros, TVA comprise. Les frais de livraison dépendent de la zone et sont affichés avant le paiement ; ils sont détaillés dans la page",
    shippingLink: "Livraison et retours",
    pricesBody2:
      "Les devis destinés aux professionnels peuvent être exprimés hors TVA, ce qui est alors indiqué clairement. Le prix applicable est celui affiché au moment de la validation de la commande.",
    payment: "5. Paiement",
    paymentBody:
      "Le paiement s’effectue en ligne au moment de la commande, par les moyens proposés sur la page de paiement, traitée par Shopify. Pour les prestations traiteur, un acompte ou un paiement intégral préalable peut être demandé selon l’événement ; les modalités figurent dans le devis.",
    delivery: "6. Livraison et retrait",
    deliveryBody:
      "Les zones, frais, minimums de commande, délais et créneaux sont décrits dans la page Livraison et retours. Merci de veiller à ce qu’une personne soit présente ou joignable pendant le créneau choisi. Les produits sont sous votre responsabilité dès leur remise ; les produits frais doivent être conservés au réfrigérateur et consommés dans les délais indiqués.",
    cancellation: "7. Annulation par le client",
    cancellationList: [
      "Toute commande peut être annulée gratuitement jusqu’à 24 heures avant la date de livraison ou de retrait prévue. Le montant total est alors remboursé.",
      "Une annulation intervenant moins de 24 heures avant la livraison ne peut, en règle générale, pas être remboursée, les produits étant frais et préparés spécialement pour chaque commande.",
      "Pour annuler, écrivez-nous ou appelez-nous en indiquant votre numéro de commande.",
    ],
    withdrawal: "8. Droit de rétractation (consommateurs)",
    withdrawalIntro:
      "Conformément à l’article VI.53 du Code de droit économique, le droit de rétractation de 14 jours ne s’applique pas :",
    withdrawalExceptions: [
      "aux denrées susceptibles de se détériorer ou de se périmer rapidement — c’est le cas de la grande majorité de nos produits (plats, pâtisseries, sandwichs, jus frais…) ;",
      "aux produits préparés selon vos spécifications ou nettement personnalisés ;",
      "aux biens scellés qui ont été descellés après la livraison et ne peuvent être renvoyés pour des raisons d’hygiène ou de protection de la santé ;",
      "aux prestations traiteur et de service d’événement, qui sont des services de restauration fournis à une date déterminée.",
    ],
    withdrawalOther:
      "Pour les autres produits — par exemple des articles d’épicerie non périssables encore scellés — vous disposez d’un délai de 14 jours à compter de leur réception pour vous rétracter, sans avoir à vous justifier. Informez-nous de votre décision par une déclaration dénuée d’ambiguïté (e-mail ou courrier), par exemple au moyen du formulaire ci-dessous. Renvoyez ou rapportez les produits dans les 14 jours suivant votre rétractation ; les frais de retour sont à votre charge. Nous vous remboursons, frais de livraison standard compris, dans les 14 jours suivant votre rétractation, par le même moyen de paiement, et pouvons différer le remboursement jusqu’à la réception des produits.",
    guarantee: "9. Garantie légale de conformité",
    guaranteeBody:
      "Les consommateurs bénéficient de la garantie légale de conformité prévue par les articles 1649bis et suivants du Code civil, pendant deux ans à compter de la livraison. Les produits frais doivent par nature être conformes jusqu’à leur date limite de consommation. Tout défaut de conformité doit nous être signalé dans les deux mois suivant sa constatation — pour un produit frais, idéalement le jour même, avec une photo, afin que nous puissions le remplacer ou vous rembourser.",
    complaints: "10. Réclamations",
    complaintsBody:
      "Pour toute réclamation, contactez-nous à {email} ou au {phone} en indiquant votre numéro de commande. Nous vous répondons dans les meilleurs délais, au plus tard sous 7 jours ouvrables.",
    mediation:
      "Si votre réclamation n’aboutit pas, vous pouvez vous adresser gratuitement au",
    liability: "11. Responsabilité",
    liabilityBody:
      "Nous ne sommes pas responsables d’un retard ou d’une inexécution dus à un cas de force majeure (intempéries, grève, accident, panne d’un prestataire…), ni d’une réaction allergique liée à une allergie qui ne nous a pas été signalée. Rien dans les présentes conditions ne limite les droits que la loi garantit impérativement aux consommateurs.",
    privacy: "12. Données personnelles",
    privacyBody: "Le traitement de vos données est décrit dans notre",
    privacyLink: "politique de confidentialité",
    law: "13. Droit applicable et juridiction",
    lawBody:
      "Ces conditions sont régies par le droit belge. En cas de litige avec un client professionnel, les tribunaux de Bruxelles sont seuls compétents. Un consommateur conserve la protection des règles impératives de son pays de résidence et peut saisir le tribunal compétent selon la loi.",
    form: "Modèle de formulaire de rétractation",
    formIntro:
      "(Veuillez compléter et renvoyer le présent formulaire uniquement si vous souhaitez vous rétracter du contrat.)",
    formLines: [
      "À l’attention de MOMENT LAB SRL, {address}, {email} :",
      "Je/Nous (*) vous notifie/notifions (*) par la présente ma/notre (*) rétractation du contrat portant sur la vente du bien (*)/pour la prestation de services (*) ci-dessous :",
      "Commandé le (*)/reçu le (*) :",
      "Nom du (des) consommateur(s) :",
      "Adresse du (des) consommateur(s) :",
      "Signature du (des) consommateur(s) (uniquement en cas de notification du présent formulaire sur papier) :",
      "Date :",
    ],
    formNote: "(*) Rayez la mention inutile.",
  },
  nl: {
    title: "Verkoopvoorwaarden",
    lead: "Algemene verkoopvoorwaarden voor onlinebestellingen en cateringdiensten van MOMENT LAB SRL.",
    scope: "1. Verkoper en toepassingsgebied",
    scopeBody:
      "De website moment-lab.be wordt uitgebaat door MOMENT LAB SRL, waarvan de volledige gegevens in de",
    scopeLink: "wettelijke vermeldingen",
    scopeBody2:
      "staan. Deze voorwaarden gelden voor elke bestelling op de website en voor elke cateringdienst, zowel voor consumenten als voor professionele klanten. Een specifieke schriftelijke overeenkomst (bijvoorbeeld een ondertekende offerte of een raamovereenkomst) heeft voorrang voor wat ze regelt. Door uw bestelling te bevestigen, verklaart u deze voorwaarden te hebben gelezen en aanvaard.",
    products: "2. Producten",
    productsBody:
      "Onze producten worden ambachtelijk bereid; de foto’s zijn indicatief en kunnen licht afwijken van het geleverde product. Informatie over ingrediënten en allergenen staat op de productpagina en kan ons altijd vóór de bestelling worden gevraagd. Meld ons elke allergie of intolerantie bij het bestellen. Omdat onze producten in één atelier worden bereid, kunnen we sporen van allergenen niet uitsluiten.",
    order: "3. Bestelling en totstandkoming van de overeenkomst",
    orderBody:
      "U kiest uw producten, de dag en de wijze van levering of afhaling, en betaalt op de beveiligde betaalpagina. Met het overzicht vóór de betaling kunt u uw bestelling controleren en verbeteren. De overeenkomst komt tot stand wanneer de betaling is aanvaard; u ontvangt dan een bevestiging per e-mail. Voor een cateringdienst komt de overeenkomst tot stand bij de schriftelijke aanvaarding van onze offerte.",
    prices: "4. Prijzen",
    pricesBody:
      "De prijzen zijn vermeld in euro, inclusief btw. De leveringskosten hangen af van de zone en worden vóór de betaling getoond; ze worden toegelicht op de pagina",
    shippingLink: "Levering en retour",
    pricesBody2:
      "Offertes voor professionele klanten kunnen exclusief btw zijn, wat dan duidelijk wordt vermeld. De geldende prijs is die welke wordt getoond op het moment dat de bestelling wordt bevestigd.",
    payment: "5. Betaling",
    paymentBody:
      "Betaling gebeurt online bij de bestelling, met de betaalmiddelen die op de betaalpagina worden aangeboden; die wordt verwerkt door Shopify. Voor cateringdiensten kan afhankelijk van het evenement een voorschot of volledige vooruitbetaling worden gevraagd; de voorwaarden staan in de offerte.",
    delivery: "6. Levering en afhaling",
    deliveryBody:
      "De zones, kosten, minimale bestelbedragen, termijnen en tijdvakken staan op de pagina Levering en retour. Zorg ervoor dat er tijdens het gekozen tijdvak iemand aanwezig of bereikbaar is. De producten vallen onder uw verantwoordelijkheid zodra ze zijn overhandigd; verse producten moeten in de koelkast worden bewaard en binnen de aangegeven termijn worden geconsumeerd.",
    cancellation: "7. Annulering door de klant",
    cancellationList: [
      "Elke bestelling kan kosteloos worden geannuleerd tot 24 uur vóór de geplande leverings- of afhaaldatum. Het volledige bedrag wordt dan terugbetaald.",
      "Een annulering minder dan 24 uur vóór de levering kan in de regel niet worden terugbetaald, omdat de producten vers zijn en speciaal voor elke bestelling worden bereid.",
      "Om te annuleren, schrijft of belt u ons met vermelding van uw bestelnummer.",
    ],
    withdrawal: "8. Herroepingsrecht (consumenten)",
    withdrawalIntro:
      "Overeenkomstig artikel VI.53 van het Wetboek van economisch recht geldt het herroepingsrecht van 14 dagen niet voor:",
    withdrawalExceptions: [
      "goederen die snel kunnen bederven of snel verouderen — dat geldt voor het overgrote deel van onze producten (gerechten, gebak, sandwiches, verse sappen…);",
      "producten die volgens uw specificaties zijn bereid of duidelijk gepersonaliseerd zijn;",
      "verzegelde goederen die na de levering zijn ontzegeld en om redenen van hygiëne of gezondheidsbescherming niet kunnen worden teruggezonden;",
      "catering- en evenementdiensten, die restauratiediensten zijn die op een bepaalde datum worden verleend.",
    ],
    withdrawalOther:
      "Voor de andere producten — bijvoorbeeld niet-bederfelijke kruidenierswaren die nog verzegeld zijn — hebt u 14 dagen vanaf de ontvangst om de overeenkomst zonder opgave van redenen te herroepen. Deel ons uw beslissing mee met een ondubbelzinnige verklaring (e-mail of brief), bijvoorbeeld met het modelformulier hieronder. Stuur of breng de producten terug binnen 14 dagen na uw herroeping; de kosten van terugzending zijn voor uw rekening. We betalen u, inclusief de standaardleveringskosten, terug binnen 14 dagen na uw herroeping, met hetzelfde betaalmiddel, en kunnen de terugbetaling uitstellen tot we de producten hebben ontvangen.",
    guarantee: "9. Wettelijke garantie van conformiteit",
    guaranteeBody:
      "Consumenten genieten de wettelijke garantie van conformiteit van de artikelen 1649bis en volgende van het Burgerlijk Wetboek, gedurende twee jaar vanaf de levering. Verse producten moeten uit hun aard conform zijn tot hun uiterste consumptiedatum. Elk gebrek aan overeenstemming moet ons worden gemeld binnen twee maanden nadat het is vastgesteld — voor een vers product bij voorkeur dezelfde dag, met een foto, zodat we het kunnen vervangen of terugbetalen.",
    complaints: "10. Klachten",
    complaintsBody:
      "Voor elke klacht kunt u ons bereiken via {email} of op {phone}, met vermelding van uw bestelnummer. We antwoorden zo snel mogelijk, uiterlijk binnen 7 werkdagen.",
    mediation:
      "Als uw klacht niet tot een oplossing leidt, kunt u zich kosteloos wenden tot de",
    liability: "11. Aansprakelijkheid",
    liabilityBody:
      "We zijn niet aansprakelijk voor een vertraging of niet-uitvoering door overmacht (noodweer, staking, ongeval, storing bij een dienstverlener…), noch voor een allergische reactie door een allergie die ons niet werd gemeld. Niets in deze voorwaarden beperkt de rechten die de wet dwingend aan consumenten waarborgt.",
    privacy: "12. Persoonsgegevens",
    privacyBody: "De verwerking van uw gegevens wordt beschreven in ons",
    privacyLink: "privacybeleid",
    law: "13. Toepasselijk recht en bevoegde rechtbank",
    lawBody:
      "Op deze voorwaarden is het Belgische recht van toepassing. Bij een geschil met een professionele klant zijn uitsluitend de rechtbanken van Brussel bevoegd. Een consument behoudt de bescherming van de dwingende regels van zijn land van verblijf en kan zich wenden tot de rechtbank die volgens de wet bevoegd is.",
    form: "Modelformulier voor herroeping",
    formIntro:
      "(Dit formulier alleen invullen en terugzenden als u de overeenkomst wilt herroepen.)",
    formLines: [
      "Aan MOMENT LAB SRL, {address}, {email}:",
      "Ik/Wij (*) deel/delen (*) u hierbij mede dat ik/wij (*) onze overeenkomst betreffende de verkoop van de volgende goederen (*)/levering van de volgende dienst (*) herroep/herroepen (*):",
      "Besteld op (*)/ontvangen op (*):",
      "Naam/Namen consument(en):",
      "Adres consument(en):",
      "Handtekening van consument(en) (alleen wanneer dit formulier op papier wordt ingediend):",
      "Datum:",
    ],
    formNote: "(*) Doorhalen wat niet van toepassing is.",
  },
  en: {
    title: "Terms of sale",
    lead: "General terms of sale for online orders and catering services from MOMENT LAB SRL.",
    scope: "1. Seller and scope",
    scopeBody:
      "The website moment-lab.be is operated by MOMENT LAB SRL, whose full details are given in the",
    scopeLink: "legal notice",
    scopeBody2:
      "These terms apply to every order placed on the site and every catering service, for consumers and business clients alike. A specific written agreement (for example a signed quote or a framework contract) takes precedence over them for what it covers. By confirming your order, you confirm that you have read and accepted these terms.",
    products: "2. Products",
    productsBody:
      "Our products are made by hand; photographs are for illustration and the product delivered may differ slightly. Ingredient and allergen information is shown on the product page and can always be requested before ordering. Please tell us about any allergy or intolerance when you order. As all our products are prepared in the same kitchen, we cannot rule out traces of allergens.",
    order: "3. Ordering and conclusion of the contract",
    orderBody:
      "You choose your products, the day and the delivery or collection method, then pay on the secure checkout page. The summary shown before payment lets you check and correct your order. The contract is concluded when payment is accepted, and you receive a confirmation by email. For catering, the contract is concluded when you accept our quote in writing.",
    prices: "4. Prices",
    pricesBody:
      "Prices are shown in euros, including VAT. Delivery fees depend on the zone and are shown before payment; they are set out on the",
    shippingLink: "Shipping & returns page",
    pricesBody2:
      "Quotes for business clients may be given excluding VAT, which is then clearly stated. The price that applies is the one shown when the order is confirmed.",
    payment: "5. Payment",
    paymentBody:
      "Payment is made online when you order, using the methods offered on the checkout page, which is operated by Shopify. For catering, a deposit or full prepayment may be required depending on the event; the terms are set out in the quote.",
    delivery: "6. Delivery and collection",
    deliveryBody:
      "Zones, fees, minimum orders, lead times and time slots are described on the Shipping & returns page. Please make sure someone is present or reachable during the chosen slot. Products are your responsibility once handed over; fresh products must be kept refrigerated and eaten within the stated time.",
    cancellation: "7. Cancellation by the customer",
    cancellationList: [
      "Any order may be cancelled free of charge up to 24 hours before the scheduled delivery or collection date, and the full amount is refunded.",
      "A cancellation made less than 24 hours before delivery cannot, as a rule, be refunded, as the products are fresh and prepared specifically for each order.",
      "To cancel, write to us or call us with your order number.",
    ],
    withdrawal: "8. Right of withdrawal (consumers)",
    withdrawalIntro:
      "Under article VI.53 of the Belgian Code of Economic Law, the 14-day right of withdrawal does not apply to:",
    withdrawalExceptions: [
      "goods liable to deteriorate or expire rapidly — which covers the great majority of our products (dishes, pastries, sandwiches, fresh juices…);",
      "products made to your specifications or clearly personalised;",
      "sealed goods unsealed after delivery that cannot be returned for health protection or hygiene reasons;",
      "catering and event services, which are catering services provided on a specific date.",
    ],
    withdrawalOther:
      "For other products — for example non-perishable grocery items still sealed — you have 14 days from receipt to withdraw from the contract without giving any reason. Tell us of your decision by an unequivocal statement (email or letter), for example using the model form below. Send back or bring back the products within 14 days of withdrawing; the cost of returning them is yours. We refund you, including standard delivery costs, within 14 days of your withdrawal, using the same payment method, and may withhold the refund until we have received the products.",
    guarantee: "9. Legal guarantee of conformity",
    guaranteeBody:
      "Consumers benefit from the legal guarantee of conformity under articles 1649bis and following of the Belgian Civil Code, for two years from delivery. Fresh products must by their nature be in conformity until their use-by date. Any lack of conformity must be reported to us within two months of being discovered — for a fresh product, ideally the same day, with a photo, so that we can replace it or refund you.",
    complaints: "10. Complaints",
    complaintsBody:
      "For any complaint, contact us at {email} or on {phone} with your order number. We reply as soon as possible and within 7 working days at the latest.",
    mediation:
      "If your complaint is not resolved, you may turn, free of charge, to the",
    liability: "11. Liability",
    liabilityBody:
      "We are not liable for delay or non-performance caused by force majeure (severe weather, strikes, accidents, failure of a service provider…), nor for an allergic reaction caused by an allergy we were not told about. Nothing in these terms limits the rights that the law grants consumers on a mandatory basis.",
    privacy: "12. Personal data",
    privacyBody: "How we process your data is described in our",
    privacyLink: "privacy policy",
    law: "13. Governing law and jurisdiction",
    lawBody:
      "These terms are governed by Belgian law. In a dispute with a business client, the courts of Brussels have exclusive jurisdiction. A consumer keeps the protection of the mandatory rules of their country of residence and may bring a claim before the court competent under the law.",
    form: "Model withdrawal form",
    formIntro:
      "(Complete and return this form only if you wish to withdraw from the contract.)",
    formLines: [
      "To MOMENT LAB SRL, {address}, {email}:",
      "I/We (*) hereby give notice that I/We (*) withdraw from my/our (*) contract of sale of the following goods (*)/for the provision of the following service (*):",
      "Ordered on (*)/received on (*):",
      "Name of consumer(s):",
      "Address of consumer(s):",
      "Signature of consumer(s) (only if this form is notified on paper):",
      "Date:",
    ],
    formNote: "(*) Delete as appropriate.",
  },
} satisfies Record<Locale, Record<string, string | string[]>>;

export default async function TermsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const locale = toLocale((await params).lang);
  const t = COPY[locale];
  const { contact } = SITE_DETAILS;
  const city = locale === "nl" ? "Vorst" : "Forest";
  const address = `${contact.street}, ${contact.postalCode} ${city}`;
  const fill = (text: string) =>
    text
      .replace("{email}", contact.email)
      .replace("{phone}", contact.phone)
      .replace("{address}", address);
  const mediation = CONSUMER_MEDIATION;

  return (
    <LegalDoc locale={locale} title={t.title} lead={t.lead}>
      <LegalSection title={t.scope}>
        <p>
          {t.scopeBody}{" "}
          <LocaleLink href={routes.legal} className={legalLinkClassName}>
            {t.scopeLink}
          </LocaleLink>
          {locale === "nl" ? " " : ". "}
          {t.scopeBody2}
        </p>
      </LegalSection>

      <LegalSection title={t.products}>
        <p>{t.productsBody}</p>
      </LegalSection>

      <LegalSection title={t.order}>
        <p>{t.orderBody}</p>
      </LegalSection>

      <LegalSection title={t.prices}>
        <p>
          {t.pricesBody}{" "}
          <LocaleLink href={routes.shipping} className={legalLinkClassName}>
            {t.shippingLink}
          </LocaleLink>
          . {t.pricesBody2}
        </p>
      </LegalSection>

      <LegalSection title={t.payment}>
        <p>{t.paymentBody}</p>
      </LegalSection>

      <LegalSection title={t.delivery}>
        <p>{t.deliveryBody}</p>
      </LegalSection>

      <LegalSection title={t.cancellation}>
        {t.cancellationList.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </LegalSection>

      <LegalSection title={t.withdrawal}>
        <p>{t.withdrawalIntro}</p>
        <LegalList>
          {t.withdrawalExceptions.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </LegalList>
        <p>{t.withdrawalOther}</p>
      </LegalSection>

      <LegalSection title={t.guarantee}>
        <p>{t.guaranteeBody}</p>
      </LegalSection>

      <LegalSection title={t.complaints}>
        <p>{fill(t.complaintsBody)}</p>
        <p>
          {t.mediation} {mediation.name[locale]}, {mediation.address[locale]}{" "}
          —{" "}
          <LegalLink href={mediation.url[locale]}>
            {mediation.url[locale].replace(/^https:\/\//, "")}
          </LegalLink>
          .
        </p>
      </LegalSection>

      <LegalSection title={t.liability}>
        <p>{t.liabilityBody}</p>
      </LegalSection>

      <LegalSection title={t.privacy}>
        <p>
          {t.privacyBody}{" "}
          <LocaleLink href={routes.privacy} className={legalLinkClassName}>
            {t.privacyLink}
          </LocaleLink>
          .
        </p>
      </LegalSection>

      <LegalSection title={t.law}>
        <p>{t.lawBody}</p>
      </LegalSection>

      <LegalSection title={t.form}>
        <div className="space-y-2 border border-sky p-4">
          <p className="italic">{t.formIntro}</p>
          {t.formLines.map((line) => (
            <p key={line}>— {fill(line)}</p>
          ))}
          <p className="text-[13px]">{t.formNote}</p>
        </div>
      </LegalSection>
    </LegalDoc>
  );
}
