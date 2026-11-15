/**
 * The texts of the "Comment ça marche ?" page (/faq), in one language.
 *
 * Written in the Studio (`faqPage`, see `sanity/schemaTypes/documents/
 * faqPage.ts`). Until that document exists — or if Sanity is unreachable —
 * the page shows the dictionary versions (`faq.steps`, `faq.items`), which are
 * also what the Studio form is prefilled with (`initialValue` in the schema).
 *
 * Steps and questions fall back separately: an owner who has written the
 * questions but emptied the steps gets their questions and the default steps,
 * never a page with a hole in it.
 *
 * Per field, a missing Dutch or English text falls back to French (`pick`), as
 * everywhere else Sanity copy is translated.
 */

import type { Locale } from "./i18n/config";
import type { Dictionary } from "./i18n/dictionaries";
import { pick } from "./sanity/locale";
import type { FaqPageContent } from "./sanity/queries";

export type FaqStep = { index: string; title: string; body: string };
export type FaqEntry = { question: string; answer: string };

export function resolveFaq(
  content: FaqPageContent | null,
  dict: Dictionary,
  locale: Locale,
): { steps: FaqStep[]; questions: FaqEntry[] } {
  const fromStudio = {
    steps: (content?.steps ?? [])
      .map((step) => ({
        title: pick(step.title, locale) ?? "",
        body: pick(step.body, locale) ?? "",
      }))
      .filter((step) => step.title && step.body),
    questions: (content?.questions ?? [])
      .map((item) => ({
        question: pick(item.question, locale) ?? "",
        answer: pick(item.answer, locale) ?? "",
      }))
      .filter((item) => item.question && item.answer),
  };

  const steps = fromStudio.steps.length ? fromStudio.steps : dict.faq.steps;
  const questions = fromStudio.questions.length
    ? fromStudio.questions
    : dict.faq.items.map(({ q, a }) => ({ question: q, answer: a }));

  return {
    steps: steps.map((step, index) => ({
      index: String(index + 1).padStart(2, "0"),
      ...step,
    })),
    questions,
  };
}
