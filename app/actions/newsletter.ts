"use server";

import { HONEYPOT_FIELD, isEmailAddress } from "@/lib/contact";
import { siteConfig } from "@/lib/site";
import { headers } from "next/headers";
import { clientAddress, takeToken } from "@/lib/rate-limit";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

const SUBMIT_LIMIT = { limit: 5, windowMs: 10 * 60_000 };

export type NewsletterState = "idle" | "success" | "error";

/**
 * A newsletter sign-up, sent to the kitchen's inbox.
 *
 * A form that thanks the visitor and sends the address nowhere is worse than
 * having no form: someone who asked to hear from the atelier is told they will
 * and never does. There is no mailing-list provider yet, so
 * until the client picks one, each sign-up arrives as an email through the same
 * Resend account the contact form already uses, and the list lives in that
 * inbox. When a provider is chosen, this is the one function to change.
 */
export async function subscribeToNewsletter(
  _previous: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const read = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value.trim() : "";
  };

  // Answer a bot as though it worked, as the contact form does.
  if (read(HONEYPOT_FIELD)) return "success";

  const email = read("email");
  if (!isEmailAddress(email)) return "error";

  if (!takeToken(`newsletter:${clientAddress(await headers())}`, SUBMIT_LIMIT)) {
    return "error";
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_EMAIL_FROM;
  const to = process.env.CONTACT_EMAIL_TO;

  if (!apiKey || !from || !to) {
    console.error(
      `[newsletter] Resend is not configured — sign-up not delivered: ${email}`,
    );
    return "error";
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
        reply_to: email,
        subject: `${siteConfig.name} — newsletter sign-up: ${email}`,
        text: `${email} asked to receive the newsletter from the website.`,
      }),
    });

    if (!response.ok) {
      console.error(
        `[newsletter] Resend returned ${response.status}: ${await response.text()}`,
      );
      return "error";
    }
  } catch (error) {
    console.error("[newsletter] could not reach Resend", error);
    return "error";
  }

  return "success";
}
