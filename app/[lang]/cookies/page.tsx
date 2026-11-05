import { CookiePreferencesButton } from "@/components/CookieConsent";
import { LocaleLink } from "@/components/LocaleLink";
import {
  LegalDoc,
  LegalLink,
  LegalSection,
} from "@/components/LegalDoc";
import { ENABLED_CONSENT_CATEGORIES } from "@/lib/consent/categories";
import { toLocale, type Locale } from "@/lib/i18n/config";
import {
  colon,
  DATA_PROTECTION_AUTHORITY,
  SHOPIFY_COOKIE_POLICY,
} from "@/lib/legal";
import { routes } from "@/lib/routes";
import { localizedMetadata } from "@/lib/seo";

export const generateMetadata = localizedMetadata("cookies", {
  path: routes.cookies,
});

type Localized = Record<Locale, string>;

type CookieRow = {
  name: string;
  /** Who sets it — first party unless stated. */
  provider: string;
  purpose: Localized;
  duration: Localized;
};

/**
 * Every cookie and storage key this site itself writes. **Keep this in step
 * with the code**: the names come from lib/consent/types.ts,
 * lib/i18n/config.ts, lib/shopify/cart.ts and
 * lib/shopify/customer-account/config.ts, and the durations from the max-ages
 * set there. The APD expects the list to be complete and exact.
 */
const NECESSARY_COOKIES: CookieRow[] = [
  {
    name: "shopify_cart_id",
    provider: "moment-lab.be",
    purpose: {
      fr: "Retrouver votre panier d’une page et d’une visite à l’autre.",
      nl: "Uw winkelmand bewaren van pagina tot pagina en tussen bezoeken.",
      en: "Keeps your basket from one page and one visit to the next.",
    },
    duration: { fr: "14 jours", nl: "14 dagen", en: "14 days" },
  },
  {
    name: "shopify_customer_session",
    provider: "moment-lab.be",
    purpose: {
      fr: "Vous garder connecté à votre compte client.",
      nl: "U aangemeld houden bij uw klantenaccount.",
      en: "Keeps you signed in to your customer account.",
    },
    duration: { fr: "30 jours", nl: "30 dagen", en: "30 days" },
  },
  {
    name: "shopify_oauth_state, shopify_oauth_nonce, shopify_oauth_code_verifier, shopify_oauth_return_to",
    provider: "moment-lab.be",
    purpose: {
      fr: "Sécuriser la connexion à votre compte (protection contre la falsification de requêtes) et vous ramener à la page d’origine.",
      nl: "De aanmelding bij uw account beveiligen (bescherming tegen vervalste verzoeken) en u terugbrengen naar de pagina waar u was.",
      en: "Secures signing in to your account (protection against forged requests) and returns you to the page you came from.",
    },
    duration: { fr: "10 minutes", nl: "10 minuten", en: "10 minutes" },
  },
  {
    name: "moment-locale",
    provider: "moment-lab.be",
    purpose: {
      fr: "Mémoriser la langue que vous avez choisie.",
      nl: "De taal onthouden die u hebt gekozen.",
      en: "Remembers the language you chose.",
    },
    duration: { fr: "12 mois", nl: "12 maanden", en: "12 months" },
  },
  {
    name: "moment_consent",
    provider: "moment-lab.be",
    purpose: {
      fr: "Mémoriser vos choix en matière de cookies, lorsque des cookies facultatifs vous sont proposés.",
      nl: "Uw cookievoorkeuren onthouden, wanneer u optionele cookies worden voorgesteld.",
      en: "Remembers your cookie choices, when optional cookies are offered.",
    },
    duration: { fr: "6 mois", nl: "6 maanden", en: "6 months" },
  },
  {
    name: "moment-palette (localStorage)",
    provider: "moment-lab.be",
    purpose: {
      fr: "Mémoriser la palette de couleurs que vous avez choisie pour le site.",
      nl: "Het kleurenpalet onthouden dat u voor de website hebt gekozen.",
      en: "Remembers the colour palette you chose for the site.",
    },
    duration: {
      fr: "Jusqu’à ce que vous l’effaciez",
      nl: "Tot u het wist",
      en: "Until you clear it",
    },
  },
];

const COPY = {
  fr: {
    title: "Cookies",
    lead: "Quels cookies et technologies similaires ce site utilise, à quoi ils servent et comment les gérer.",
    what: "Qu’est-ce qu’un cookie ?",
    whatBody:
      "Un cookie est un petit fichier enregistré sur votre appareil lorsque vous consultez un site. D’autres technologies, comme le stockage local du navigateur (localStorage), fonctionnent de la même manière ; cette page les couvre aussi.",
    necessary: "Cookies strictement nécessaires",
    necessaryBody:
      "Ces cookies sont indispensables au fonctionnement du site : panier, connexion à votre compte, sécurité et mémorisation de vos préférences d’affichage. La loi permet de les déposer sans votre consentement. Ils sont déposés par MOMENT LAB SRL et ne servent à aucun suivi publicitaire.",
    name: "Nom",
    purpose: "Finalité",
    duration: "Durée",
    checkout: "Paiement chez Shopify",
    checkoutBody:
      "Le paiement de votre commande se déroule sur la page de paiement sécurisée de Shopify, qui dépose ses propres cookies nécessaires (sécurité, prévention de la fraude, déroulement du paiement). Ils sont décrits dans la",
    checkoutLink: "politique cookies de Shopify",
    optional: "Cookies de mesure d’audience et de marketing",
    optionalNone:
      "Ce site n’utilise actuellement aucun cookie de mesure d’audience, de publicité ou de réseaux sociaux. C’est pourquoi aucun bandeau ne vous demande votre consentement. Si nous en ajoutons un jour, cette page sera mise à jour et votre accord vous sera demandé avant tout dépôt — refuser sera aussi simple qu’accepter.",
    optionalSome:
      "Les cookies de mesure d’audience et de marketing ne sont déposés qu’après votre accord, donné via le bandeau cookies. Votre choix est conservé 6 mois, après quoi il vous est à nouveau demandé.",
    manage: "Gérer vos cookies",
    manageBody:
      "Vous pouvez à tout moment supprimer ou bloquer les cookies dans les réglages de votre navigateur. Bloquer les cookies strictement nécessaires empêchera toutefois le panier et la connexion à votre compte de fonctionner.",
    manageButton:
      "Vous pouvez aussi modifier ou retirer votre consentement à tout moment :",
    questions: "Questions",
    questionsBody:
      "Pour toute question sur l’utilisation des cookies ou de vos données, consultez notre",
    privacyLink: "politique de confidentialité",
    authority: "Vous pouvez également contacter l’",
  },
  nl: {
    title: "Cookies",
    lead: "Welke cookies en vergelijkbare technologieën deze website gebruikt, waarvoor ze dienen en hoe u ze beheert.",
    what: "Wat is een cookie?",
    whatBody:
      "Een cookie is een klein bestand dat op uw toestel wordt opgeslagen wanneer u een website bezoekt. Andere technologieën, zoals de lokale opslag van de browser (localStorage), werken op dezelfde manier; ook die komen op deze pagina aan bod.",
    necessary: "Strikt noodzakelijke cookies",
    necessaryBody:
      "Deze cookies zijn onmisbaar voor de werking van de website: de winkelmand, de aanmelding bij uw account, de beveiliging en het onthouden van uw weergavevoorkeuren. De wet staat toe ze zonder uw toestemming te plaatsen. Ze worden geplaatst door MOMENT LAB SRL en dienen niet om u voor reclamedoeleinden te volgen.",
    name: "Naam",
    purpose: "Doel",
    duration: "Bewaartermijn",
    checkout: "Betalen bij Shopify",
    checkoutBody:
      "Uw bestelling wordt betaald op de beveiligde betaalpagina van Shopify, die haar eigen noodzakelijke cookies plaatst (beveiliging, fraudepreventie, verloop van de betaling). Ze worden beschreven in het",
    checkoutLink: "cookiebeleid van Shopify",
    optional: "Analytische en marketingcookies",
    optionalNone:
      "Deze website gebruikt momenteel geen analytische, reclame- of socialemediacookies. Daarom vraagt geen banner u om toestemming. Als we er ooit een toevoegen, wordt deze pagina bijgewerkt en wordt uw toestemming gevraagd voordat er iets wordt geplaatst — weigeren zal even eenvoudig zijn als aanvaarden.",
    optionalSome:
      "Analytische en marketingcookies worden pas geplaatst nadat u daarvoor toestemming hebt gegeven via de cookiebanner. Uw keuze wordt 6 maanden bewaard, daarna wordt ze u opnieuw gevraagd.",
    manage: "Uw cookies beheren",
    manageBody:
      "U kunt cookies op elk moment verwijderen of blokkeren in de instellingen van uw browser. Als u de strikt noodzakelijke cookies blokkeert, werken de winkelmand en de aanmelding bij uw account echter niet meer.",
    manageButton: "U kunt uw toestemming ook op elk moment wijzigen of intrekken:",
    questions: "Vragen",
    questionsBody:
      "Voor vragen over het gebruik van cookies of van uw gegevens, zie ons",
    privacyLink: "privacybeleid",
    authority: "U kunt ook contact opnemen met de ",
  },
  en: {
    title: "Cookies",
    lead: "Which cookies and similar technologies this site uses, what they are for and how to manage them.",
    what: "What is a cookie?",
    whatBody:
      "A cookie is a small file stored on your device when you visit a website. Other technologies, such as the browser’s local storage (localStorage), work in the same way; this page covers them too.",
    necessary: "Strictly necessary cookies",
    necessaryBody:
      "These cookies are essential for the site to work: the basket, signing in to your account, security and remembering your display preferences. The law allows them to be set without your consent. They are set by MOMENT LAB SRL and are not used for any advertising tracking.",
    name: "Name",
    purpose: "Purpose",
    duration: "Duration",
    checkout: "Paying through Shopify",
    checkoutBody:
      "Your order is paid on Shopify’s secure checkout page, which sets its own necessary cookies (security, fraud prevention, running the payment). They are described in",
    checkoutLink: "Shopify’s cookie policy",
    optional: "Analytics and marketing cookies",
    optionalNone:
      "This site does not currently use any analytics, advertising or social media cookies, which is why no banner asks for your consent. If we ever add one, this page will be updated and your consent will be asked before anything is set — refusing will be as easy as accepting.",
    optionalSome:
      "Analytics and marketing cookies are only set after you agree to them through the cookie banner. Your choice is kept for 6 months, after which you are asked again.",
    manage: "Managing cookies",
    manageBody:
      "You can delete or block cookies at any time in your browser settings. Blocking strictly necessary cookies will, however, stop the basket and account sign-in from working.",
    manageButton: "You can also change or withdraw your consent at any time:",
    questions: "Questions",
    questionsBody:
      "For any question about how we use cookies or your data, see our",
    privacyLink: "privacy policy",
    authority: "You may also contact the ",
  },
} satisfies Record<Locale, Record<string, string>>;

export default async function CookiesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const locale = toLocale((await params).lang);
  const t = COPY[locale];
  const hasOptional = ENABLED_CONSENT_CATEGORIES.length > 0;

  return (
    <LegalDoc locale={locale} title={t.title} lead={t.lead}>
      <LegalSection title={t.what}>
        <p>{t.whatBody}</p>
      </LegalSection>

      <LegalSection title={t.necessary}>
        <p>{t.necessaryBody}</p>
        {/* A list of cards rather than a table: five columns do not fit a
            phone, and a table that scrolls sideways hides the duration. */}
        <ul className="divide-y divide-sky border-y border-sky">
          {NECESSARY_COOKIES.map((cookie) => (
            <li key={cookie.name} className="space-y-1 py-3">
              <p className="font-owners-medium text-[12px] tracking-wide break-all">
                {cookie.name}
              </p>
              <p>{cookie.purpose[locale]}</p>
              <p className="text-[13px] text-black/60">
                {t.duration}
                {colon(locale)}
                {cookie.duration[locale]} · {cookie.provider}
              </p>
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title={t.checkout}>
        <p>
          {t.checkoutBody}{" "}
          <LegalLink href={SHOPIFY_COOKIE_POLICY}>{t.checkoutLink}</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection title={t.optional}>
        <p>{hasOptional ? t.optionalSome : t.optionalNone}</p>
      </LegalSection>

      <LegalSection title={t.manage}>
        <p>{t.manageBody}</p>
        {hasOptional && (
          <p>
            {t.manageButton}{" "}
            <CookiePreferencesButton className="underline underline-offset-2 transition-opacity hover:opacity-60" />
          </p>
        )}
      </LegalSection>

      <LegalSection title={t.questions}>
        <p>
          {t.questionsBody}{" "}
          <LocaleLink
            href={routes.privacy}
            className="underline underline-offset-2 transition-opacity hover:opacity-60"
          >
            {t.privacyLink}
          </LocaleLink>
          . {t.authority}
          <LegalLink href={DATA_PROTECTION_AUTHORITY.url[locale]}>
            {DATA_PROTECTION_AUTHORITY.name[locale]}
          </LegalLink>
          .
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
