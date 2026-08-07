"use server";

import {
  CONTACT_FIELDS,
  HONEYPOT_FIELD,
  validateContact,
  type ContactFormState,
  type ContactValues,
} from "@/lib/contact";
import { siteConfig } from "@/lib/site";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

function readField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

/** Plain text rather than HTML: this mail is read by the kitchen, not designed. */
function composeBody(values: ContactValues) {
  return [
    `Name:     ${values.name}`,
    `Email:    ${values.email}`,
    `Phone:    ${values.phone || "—"}`,
    `Company:  ${values.company || "—"}`,
    `VAT:      ${values.vat || "—"}`,
    `Address:  ${values.address || "—"}`,
    `For:      ${values.occasion}`,
    `Date:     ${values.date || "—"}`,
    `People:   ${values.guests || "—"}`,
    "",
    values.message,
  ].join("\n");
}

/**
 * Sends the quote request on to the kitchen's inbox. Called through
 * `useActionState`, so the first argument is the previous state — it is not
 * read: every submission is judged on its own form data.
 */
export async function sendContactRequest(
  _previous: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Answer a bot as though it worked. Telling it the submission failed only
  // buys another attempt.
  if (readField(formData, HONEYPOT_FIELD)) {
    return { status: "success", errors: {} };
  }

  const values = Object.fromEntries(
    CONTACT_FIELDS.map((field) => [field, readField(formData, field)]),
  ) as ContactValues;

  const errors = validateContact(values);

  if (Object.keys(errors).length > 0) {
    return { status: "invalid", errors };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_EMAIL_FROM;
  const to = process.env.CONTACT_EMAIL_TO;

  if (!apiKey || !from || !to) {
    // Log the enquiry rather than drop it: a request that arrives while the
    // mail credentials are still missing is recoverable from the server log.
    console.error(
      "[contact] RESEND_API_KEY, CONTACT_EMAIL_FROM or CONTACT_EMAIL_TO is " +
        "missing — request was not delivered:\n" +
        composeBody(values),
    );
    return { status: "error", errors: {} };
  }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        // So hitting Reply in the inbox answers the visitor directly.
        reply_to: values.email,
        subject: `${siteConfig.name} — ${values.occasion} request from ${values.name}`,
        text: composeBody(values),
      }),
    });

    if (!response.ok) {
      console.error(
        `[contact] Resend returned ${response.status}: ${await response.text()}`,
      );
      return { status: "error", errors: {} };
    }
  } catch (error) {
    console.error("[contact] could not reach Resend", error);
    return { status: "error", errors: {} };
  }

  return { status: "success", errors: {} };
}
