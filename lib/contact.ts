/**
 * Shape and validation for the quote request on /contact.
 *
 * Kept out of the server action so the client form can name its fields off the
 * same list and render the errors the action hands back, rather than the two
 * sides agreeing on strings by hand.
 */

/**
 * What the enquiry is for. Drives the subject line of the mail we receive, so
 * these stay English and are never rendered — the radio labels come from the
 * dictionary under the same keys.
 */
export const OCCASIONS = [
  "Delivery",
  "Event",
  "Coffee",
  "Something else",
] as const;

/**
 * The occasion a professional account application arrives under. Kept out of
 * OCCASIONS because it is never one of the radio choices — the /pro form sets
 * it, and the enquiry form must not offer it.
 */
export const PRO_OCCASION = "Professional account";

/**
 * What a venue writes in about, on /collaborations — the three kinds of request
 * the owners named. Like OCCASIONS these are the subject
 * line of the mail and stay English; the labels come from `partner.requests`.
 *
 * Kept apart from OCCASIONS and from the pro application because they are a
 * different audience: a café that wants to stock the cookies is not booking a
 * delivery and is not opening a company account to order lunch.
 */
export const PARTNER_REQUESTS = ["Partnership", "Supply", "Restock"] as const;

export type PartnerRequest = (typeof PARTNER_REQUESTS)[number];

/**
 * What a venue can tick under "Quels produits vous intéressent ?" — the
 * owners' families, 27 November 2026. English for the mail, like the requests;
 * the labels come from `partner.productOptions`. Several can be ticked, and
 * `productsOther` takes anything the list does not name.
 */
export const PARTNER_PRODUCTS = [
  "Cold-pressed juices",
  "Other drinks",
  "Salads",
  "Sweet pots",
  "Bagels & sandwiches",
  "Toasts",
  "Desserts & sweets",
  "Healthy snacks",
  "Grocery",
] as const;

/** How often the venue wants a delivery. One choice; labels in `partner.frequencies`. */
export const PARTNER_FREQUENCIES = [
  "Several times a week",
  "Once a week",
  "Every two weeks",
  "Occasionally",
] as const;

/** Joins the ticked products into the one string the form carries. */
export const PRODUCTS_SEPARATOR = ", ";

export function isPartnerRequest(value: string): value is PartnerRequest {
  return (PARTNER_REQUESTS as readonly string[]).includes(value);
}

export type Occasion = (typeof OCCASIONS)[number];

export const CONTACT_FIELDS = [
  "name",
  "email",
  "phone",
  "company",
  "occasion",
  "date",
  "guests",
  "message",
  /** Professional applications only; the enquiry form never renders these. */
  "vat",
  "address",
  /** Collaboration requests only (/collaborations). */
  "products",
  "productsOther",
  "frequency",
  "quantities",
] as const;

export type ContactField = (typeof CONTACT_FIELDS)[number];

export type ContactValues = Record<ContactField, string>;

/**
 * Why a field was rejected, as a code.
 *
 * Same reasoning as lib/order-errors.ts: validation runs in a Server Action,
 * which has no locale, and these are read by someone who has just failed to
 * send a form. The component names the language.
 */
export type ContactErrorCode =
  | "name_required"
  | "email_required"
  | "email_invalid"
  | "occasion_required"
  | "message_required"
  | "message_too_long"
  | "too_long"
  | "company_required"
  | "products_required"
  | "frequency_required"
  | "address_required"
  | "vat_required"
  | "vat_invalid";

export type ContactErrors = Partial<Record<ContactField, ContactErrorCode>>;

export type ContactFormState = {
  /**
   * `invalid` is a field-level rejection the visitor can fix; `error` is ours
   * — the mail did not go out and retrying is the only advice we have.
   */
  status: "idle" | "invalid" | "error" | "success";
  errors: ContactErrors;
};

export const INITIAL_CONTACT_STATE: ContactFormState = {
  status: "idle",
  errors: {},
};

export const EMPTY_CONTACT_VALUES: ContactValues = {
  name: "",
  email: "",
  phone: "",
  company: "",
  occasion: "",
  vat: "",
  address: "",
  date: "",
  guests: "",
  message: "",
  products: "",
  productsOther: "",
  frequency: "",
  quantities: "",
};

/**
 * The name of a field a real visitor never sees. Anything in it came from a bot
 * filling every input it could find.
 */
export const HONEYPOT_FIELD = "website";

export const MESSAGE_MAX = 1200;
const SHORT_MAX = 120;

/** Deliberately loose — this catches typos, it does not police addresses. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmailAddress(value: string) {
  return value.length <= 254 && EMAIL.test(value);
}

/**
 * Belgian VAT: BE followed by ten digits, the first of which is 0 or 1. Spaces
 * and dots are how people actually type it, so they are stripped before the
 * test rather than rejected.
 *
 * Shape only. Whether the number is registered to a real company is a question
 * for VIES, which is a network call and belongs in the approval step, not in
 * front of someone trying to submit a form.
 */
const BE_VAT = /^BE[01]\d{9}$/i;

export function normaliseVat(value: string) {
  return value.replace(/[\s.]/g, "").toUpperCase();
}

export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  const isProApplication = values.occasion === PRO_OCCASION;
  const isPartner = isPartnerRequest(values.occasion);

  if (!values.name) {
    errors.name = "name_required";
  } else if (values.name.length > SHORT_MAX) {
    errors.name = "too_long";
  }

  if (!values.email) {
    errors.email = "email_required";
  } else if (!EMAIL.test(values.email)) {
    errors.email = "email_invalid";
  }

  // A professional application sets its own occasion and offers no choice, so
  // it is checked against that rather than against the radio list.
  if (isProApplication) {
    if (!values.company) errors.company = "company_required";

    if (!values.vat) {
      errors.vat = "vat_required";
    } else if (!BE_VAT.test(normaliseVat(values.vat))) {
      errors.vat = "vat_invalid";
    }
  } else if (isPartner) {
    // The venue is the point of the request: without its name and where it
    // is, the owners cannot tell whether it is a fit, or how far the van goes.
    if (!values.company) errors.company = "company_required";
    if (!values.address) errors.address = "address_required";

    // VAT is optional here — a first contact is not an account opening — but
    // a number that is given has to be one.
    if (values.vat && !BE_VAT.test(normaliseVat(values.vat))) {
      errors.vat = "vat_invalid";
    }

    // The owners' questions (27 November 2026): what, and how often. A tick
    // or the "Autre" box answers the first; quantities stay optional, since a
    // venue that has never sold the products can only guess.
    if (!values.products && !values.productsOther) {
      errors.products = "products_required";
    }
    if (
      !(PARTNER_FREQUENCIES as readonly string[]).includes(values.frequency)
    ) {
      errors.frequency = "frequency_required";
    }
  } else if (!OCCASIONS.includes(values.occasion as Occasion)) {
    errors.occasion = "occasion_required";
  }

  // A collaboration request has said what it needs in its own fields; the
  // message is there for the rest.
  if (!values.message) {
    if (!isPartner) errors.message = "message_required";
  } else if (values.message.length > MESSAGE_MAX) {
    errors.message = "message_too_long";
  }

  for (const field of [
    "phone",
    "company",
    "date",
    "guests",
    "vat",
    "address",
    "productsOther",
    "quantities",
  ] as const) {
    if (!errors[field] && values[field].length > SHORT_MAX) {
      errors[field] = "too_long";
    }
  }

  return errors;
}
