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
  } else if (!OCCASIONS.includes(values.occasion as Occasion)) {
    errors.occasion = "occasion_required";
  }

  if (!values.message) {
    errors.message = "message_required";
  } else if (values.message.length > MESSAGE_MAX) {
    errors.message = "message_too_long";
  }

  for (const field of ["phone", "company", "date", "guests", "vat", "address"] as const) {
    if (!errors[field] && values[field].length > SHORT_MAX) {
      errors[field] = "too_long";
    }
  }

  return errors;
}
