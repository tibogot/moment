/**
 * Shape and validation for the quote request on /contact.
 *
 * Kept out of the server action so the client form can name its fields off the
 * same list and render the errors the action hands back, rather than the two
 * sides agreeing on strings by hand.
 */

/** What the enquiry is for. Drives the subject line of the mail we receive. */
export const OCCASIONS = [
  "Delivery",
  "Event",
  "Coffee",
  "Something else",
] as const;

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
] as const;

export type ContactField = (typeof CONTACT_FIELDS)[number];

export type ContactValues = Record<ContactField, string>;

export type ContactErrors = Partial<Record<ContactField, string>>;

export type ContactFormState = {
  /**
   * `invalid` is a field-level rejection the visitor can fix; `error` is ours
   * — the mail did not go out and retrying is the only advice we have.
   */
  status: "idle" | "invalid" | "error" | "success";
  /** Form-level message, announced politely. Empty while idle. */
  message: string;
  errors: ContactErrors;
};

export const INITIAL_CONTACT_STATE: ContactFormState = {
  status: "idle",
  message: "",
  errors: {},
};

export const EMPTY_CONTACT_VALUES: ContactValues = {
  name: "",
  email: "",
  phone: "",
  company: "",
  occasion: "",
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

export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};

  if (!values.name) {
    errors.name = "We need a name to address the reply to.";
  } else if (values.name.length > SHORT_MAX) {
    errors.name = "That is longer than we can store.";
  }

  if (!values.email) {
    errors.email = "We reply by email, so we need an address.";
  } else if (!EMAIL.test(values.email)) {
    errors.email = "That address looks incomplete.";
  }

  if (!OCCASIONS.includes(values.occasion as Occasion)) {
    errors.occasion = "Pick the one that fits closest.";
  }

  if (!values.message) {
    errors.message = "Tell us a little about what you have in mind.";
  } else if (values.message.length > MESSAGE_MAX) {
    errors.message = `Please keep this under ${MESSAGE_MAX} characters.`;
  }

  for (const field of ["phone", "company", "date", "guests"] as const) {
    if (values[field].length > SHORT_MAX) {
      errors[field] = "That is longer than we can store.";
    }
  }

  return errors;
}
