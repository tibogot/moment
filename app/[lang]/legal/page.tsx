import { Brand } from "@/components/Brand";
import { LegalDoc, LegalLink, LegalSection } from "@/components/LegalDoc";
import { toLocale, type Locale } from "@/lib/i18n/config";
import { colon, COMPANY_REGISTRY, HOSTING_PROVIDER } from "@/lib/legal";
import { routes } from "@/lib/routes";
import { localizedMetadata } from "@/lib/seo";
import { SITE_DETAILS } from "@/lib/site";

export const generateMetadata = localizedMetadata("legal", {
  path: routes.legal,
});

/**
 * The legal notice: the identification a Belgian company owes on its website
 * (art. XII.6 CDE for an online service; art. 2:20 CSA for the company's
 * denomination, form, seat, enterprise number and register).
 */
const COPY = {
  fr: {
    title: "Mentions légales",
    country: "Belgique",
    city: "Forest",
    lead: "Informations d’identification de l’éditeur du site, conformément au droit belge.",
    publisher: "Éditeur du site",
    seat: "Siège social",
    atelier: "Atelier",
    contact: "Contact",
    registration: "Immatriculation",
    enterprise: "Numéro d’entreprise (BCE)",
    vat: "Numéro de TVA",
    register: "Registre",
    hosting: "Hébergement",
    hostingBody: "Le site est hébergé par",
    ip: "Propriété intellectuelle",
    ipBody:
      "L’ensemble des contenus de ce site — textes, photographies, logos, illustrations et mise en page — est la propriété de MOMENT LAB SRL ou de ses partenaires et est protégé par le droit d’auteur et le droit des marques. Toute reproduction, même partielle, sans autorisation écrite préalable est interdite.",
    liability: "Responsabilité",
    liabilityBody:
      "Nous veillons à ce que les informations publiées sur ce site soient exactes et à jour, sans pouvoir le garantir en permanence. Les prix, disponibilités et conditions applicables à une commande sont ceux affichés au moment de la validation de celle-ci. Les liens vers des sites tiers sont fournis à titre informatif ; nous ne sommes pas responsables de leur contenu.",
  },
  nl: {
    title: "Wettelijke vermeldingen",
    country: "België",
    city: "Vorst",
    lead: "Identificatiegegevens van de uitgever van deze website, overeenkomstig het Belgische recht.",
    publisher: "Uitgever van de website",
    seat: "Maatschappelijke zetel",
    atelier: "Atelier",
    contact: "Contact",
    registration: "Inschrijving",
    enterprise: "Ondernemingsnummer (KBO)",
    vat: "Btw-nummer",
    register: "Register",
    hosting: "Hosting",
    hostingBody: "De website wordt gehost door",
    ip: "Intellectuele eigendom",
    ipBody:
      "Alle inhoud van deze website — teksten, foto’s, logo’s, illustraties en vormgeving — is eigendom van MOMENT LAB SRL of haar partners en is beschermd door het auteursrecht en het merkenrecht. Elke reproductie, ook gedeeltelijk, zonder voorafgaande schriftelijke toestemming is verboden.",
    liability: "Aansprakelijkheid",
    liabilityBody:
      "We doen ons best om de informatie op deze website juist en actueel te houden, zonder dat we dat te allen tijde kunnen garanderen. De prijzen, beschikbaarheid en voorwaarden die voor een bestelling gelden, zijn die welke worden getoond op het moment dat de bestelling wordt bevestigd. Links naar websites van derden dienen enkel ter informatie; voor hun inhoud zijn wij niet verantwoordelijk.",
  },
  en: {
    title: "Legal notice",
    country: "Belgium",
    city: "Forest",
    lead: "Identification of the publisher of this website, as required under Belgian law.",
    publisher: "Publisher",
    seat: "Registered office",
    atelier: "Atelier",
    contact: "Contact",
    registration: "Registration",
    enterprise: "Enterprise number (CBE)",
    vat: "VAT number",
    register: "Register",
    hosting: "Hosting",
    hostingBody: "This website is hosted by",
    ip: "Intellectual property",
    ipBody:
      "All content on this website — text, photographs, logos, illustrations and layout — belongs to MOMENT LAB SRL or its partners and is protected by copyright and trade mark law. Any reproduction, even partial, without prior written permission is prohibited.",
    liability: "Liability",
    liabilityBody:
      "We take care to keep the information on this website accurate and up to date, but cannot guarantee that it always is. The prices, availability and conditions that apply to an order are those shown at the moment the order is confirmed. Links to third-party websites are provided for information only; we are not responsible for their content.",
  },
} satisfies Record<Locale, Record<string, string>>;

export default async function LegalPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const locale = toLocale((await params).lang);
  const t = COPY[locale];
  const { contact, legal } = SITE_DETAILS;
  const c = colon(locale);

  return (
    <LegalDoc locale={locale} title={t.title} lead={t.lead}>
      <LegalSection title={t.publisher}>
        <p>
          <Brand name={legal.companyName} />
          {legal.legalForm ? ` ${legal.legalForm}` : ""}
        </p>
        <p>
          {t.seat}
          {c}{legal.registeredOffice.street},{" "}
          {legal.registeredOffice.postalCode} {legal.registeredOffice.city},{" "}
          {t.country}
        </p>
        <p>
          {t.atelier}
          {c}{contact.street},{" "}
          {contact.postalCode} {t.city},{" "}
          {t.country}
        </p>
        <p>
          {t.contact}
          {c}
          <LegalLink href={`mailto:${contact.email}`}>{contact.email}</LegalLink>
          {" · "}
          <LegalLink href={`tel:${contact.phone.replace(/\s+/g, "")}`}>
            {contact.phone}
          </LegalLink>
        </p>
      </LegalSection>

      <LegalSection title={t.registration}>
        <p>
          {t.enterprise}
          {c}{legal.enterpriseNumber}
        </p>
        <p>
          {t.vat}
          {c}{legal.vatNumber}
        </p>
        <p>
          {t.register}
          {c}{COMPANY_REGISTRY[locale]}
        </p>
      </LegalSection>

      <LegalSection title={t.hosting}>
        <p>
          {t.hostingBody} {HOSTING_PROVIDER.name}, {HOSTING_PROVIDER.address} —{" "}
          <LegalLink href={HOSTING_PROVIDER.url}>vercel.com</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection title={t.ip}>
        <p>{t.ipBody}</p>
      </LegalSection>

      <LegalSection title={t.liability}>
        <p>{t.liabilityBody}</p>
      </LegalSection>
    </LegalDoc>
  );
}
