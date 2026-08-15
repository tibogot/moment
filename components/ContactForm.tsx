"use client";

import { useActionState, useState } from "react";
import { sendContactRequest } from "@/app/actions/contact";
import { GridSection } from "@/components/GridSection";
import TextReveal from "@/components/TextReveal";
import { REVEAL_BLOCK } from "@/lib/colors";
import {
  EMPTY_CONTACT_VALUES,
  HONEYPOT_FIELD,
  INITIAL_CONTACT_STATE,
  MESSAGE_MAX,
  OCCASIONS,
  type ContactField,
  type ContactFormState,
  type ContactValues,
} from "@/lib/contact";
import { useSiteDetails } from "@/components/SiteDetailsProvider";
import { useDictionary } from "@/components/LocaleProvider";
import { interpolate } from "@/lib/i18n/dictionaries";
import { PRO_OCCASION, type ContactErrorCode } from "@/lib/contact";
import { cn } from "@/lib/utils";

/**
 * The aside takes three of the page's seven columns and the form takes four —
 * the same split the services index uses for its type and its image. It is what
 * puts the rule between them, and the rule down the middle of the form, on real
 * page column lines rather than near them.
 */
const ASIDE_COLUMNS = "md:col-span-3";
const FORM_COLUMNS = "md:col-span-4";

/**
 * Every field is a cell in a ruled field: the wrapper paints sky and the cells
 * paint cream, so the 1px gaps between them *are* the rules. Same construction
 * as the search results grid — it means no cell ever doubles a neighbour's line.
 */
const CELL = "bg-cream px-(--grid-gutter) py-[3.2svh] transition-colors duration-300 focus-within:bg-sky/20";

const LABEL = "font-owners-medium block text-[14px] uppercase tracking-wide";

const CONTROL =
  "font-archivo-light mt-3 block w-full bg-transparent text-[16px] leading-normal text-black outline-none placeholder:text-black/40";

const ERROR = "font-archivo-light mt-2.5 text-[18px] leading-normal";

/** Paired by position with `contact.steps` in the dictionaries. */
const STEP_INDICES = ["01", "02", "03"] as const;

type TextFieldProps = {
  name: ContactField;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  /** Sits beside the label, in body type — for "optional" and the like. */
  hint?: string;
  placeholder?: string;
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  required?: boolean;
  /** Renders a textarea instead of an input. */
  rows?: number;
  maxLength?: number;
  className?: string;
};

function TextField({
  name,
  label,
  value,
  onChange,
  error,
  hint,
  placeholder,
  type = "text",
  autoComplete,
  required = false,
  rows,
  maxLength,
  className,
}: TextFieldProps) {
  const id = `contact-${name}`;
  const errorId = `${id}-error`;

  const shared = {
    id,
    name,
    value,
    required,
    placeholder,
    autoComplete,
    maxLength,
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => onChange(event.target.value),
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    className: CONTROL,
  };

  return (
    <div className={cn(CELL, className)}>
      <label htmlFor={id} className={LABEL}>
        {label}
        {hint && (
          <span className="font-archivo-light ml-2 text-[14px] tracking-normal normal-case text-black/55">
            {hint}
          </span>
        )}
      </label>

      {rows ? (
        <textarea {...shared} rows={rows} className={cn(CONTROL, "resize-none")} />
      ) : (
        <input {...shared} type={type} />
      )}

      {error && (
        <p id={errorId} className={ERROR}>
          {error}
        </p>
      )}
    </div>
  );
}

type ContactFormProps = {
  /**
   * Starting contents of the boxes. Resolved on the server — a visitor arriving
   * from a menu page lands with the format and its price already written into
   * the message. Defaults to an empty form.
   */
  initialValues?: ContactValues;
  /**
   * Notice required for a delivery, quoted in the aside. Passed in rather than
   * read from a constant because the owners set it in the Shopify admin — a
   * page still promising two days while the kitchen wants four is a promise
   * made to a customer that nobody in the kitchen agreed to.
   */
  leadTimeDays: number;
  /**
   * `pro` is the professional account application: same pipeline, different
   * questions. It drops the occasion radios (the occasion is fixed), the date
   * and the headcount, and adds the VAT number and a delivery address.
   *
   * One component rather than two because the plumbing — controlled values, the
   * error map, the sent panel, the honeypot — is the whole of the work and none
   * of it differs.
   */
  variant?: "enquiry" | "pro";
};

/**
 * The quote request. Held in one client component rather than split per field:
 * the values are controlled so a rejected submission comes back with the copy
 * still in the boxes, and is only cleared once the mail has actually gone.
 */
export function ContactForm({
  initialValues = EMPTY_CONTACT_VALUES,
  variant = "enquiry",
  leadTimeDays,
}: ContactFormProps) {
  const dict = useDictionary();
  const t = dict.contact;
  const pro = variant === "pro";
  const [state, formAction, pending] = useActionState(
    sendContactRequest,
    INITIAL_CONTACT_STATE,
  );
  const [values, setValues] = useState<ContactValues>(
    pro ? { ...initialValues, occasion: PRO_OCCASION } : initialValues,
  );

  /**
   * The confirmation the visitor has clicked past. Held as the state object
   * itself rather than a boolean so the panel reappears on the next send: a
   * fresh submission is a new object, which by definition is not this one.
   */
  const [dismissed, setDismissed] = useState<ContactFormState | null>(null);
  const sent = state.status === "success" && dismissed !== state;

  // Back to the prefill, not to blank: someone sending a second request from a
  // menu page is still asking about that menu.
  const reopen = () => {
    setDismissed(state);
    setValues(initialValues);
  };

  /**
   * Validation crosses the server boundary as a code — see lib/contact.ts.
   * This is the only place that turns one back into a sentence.
   */
  const errorText = (code?: ContactErrorCode) =>
    code ? t.errors[code] : undefined;

  const update = (field: ContactField) => (value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  // Either may be empty until the owners fill the Studio in — the block that
  // renders them is guarded on that, rather than printing an empty line.
  const { email, phone } = useSiteDetails().contact;

  return (
    <GridSection className="pb-[16svh]">
      {/* Section label, with the rule that doubles as the top edge of the
          ruled field below it. */}
      <div className="col-start-2 col-end-5 min-w-0 px-(--grid-gutter) md:col-end-9">
        <h2 className="font-owners-medium text-[12px] uppercase tracking-wide">
          {pro ? dict.proAccount.intro : t.title}
        </h2>
        <div
          className="mt-4 h-(--grid-line) bg-sky"
          style={{
            marginInline: "calc(-1 * var(--grid-gutter))",
            width: "calc(100% + 2 * var(--grid-gutter))",
          }}
          aria-hidden
        />
      </div>

      <div className="col-start-2 col-end-5 min-w-0 md:col-end-9">
        <div className="md:grid md:grid-cols-7">
          {/* Aside — how it works, held against the top while the form scrolls
              past it, as in the kitchen section. */}
          <div className={ASIDE_COLUMNS}>
            <div className="px-(--grid-gutter) pt-[5svh] pb-[6svh] md:sticky md:top-(--grid-band) md:pb-[5svh]">
              {/* text-left: TextReveal centres each split line unless an
                  ancestor opts out. */}
              <div className="min-w-0 text-left">
                <TextReveal blockColor={REVEAL_BLOCK} stagger={0.12}>
                  <p className="font-owners-narrow-bold max-w-full text-[10vw] leading-[0.92] tracking-[-0.005em] wrap-break-word uppercase md:text-[min(3.1vw,5svh)]">
                    {pro ? dict.proAccount.body : t.intro}
                  </p>
                </TextReveal>
              </div>

              <ol className="mt-[4svh]">
                {STEP_INDICES.map((index, position) => (
                  <li
                    key={index}
                    className="flex gap-5 border-t border-sky py-[2.6svh] last:border-b md:py-[3svh]"
                  >
                    <span className="font-archivo-light shrink-0 text-[14px] tabular-nums">
                      {index}
                    </span>
                    <div className="min-w-0">
                      {/* Same size as the form's field labels across the rule —
                          the two columns read as one row of headings. */}
                      <p className="font-owners-medium text-[14px] uppercase tracking-wide">
                        {t.steps[position].title}
                      </p>
                      <p className="font-archivo-light mt-2 text-[18px] leading-normal">
                        {t.steps[position].body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <p className="font-archivo-light mt-[4svh] max-w-[36ch] text-[18px] leading-normal">
                {interpolate(t.notice, { days: leadTimeDays })}
              </p>

              {(email || phone) && (
                <ul className="mt-[3svh] flex flex-col gap-2.5">
                  {email && (
                    <li>
                      <a
                        href={`mailto:${email}`}
                        className="font-owners-medium animated-underline text-[14px] uppercase tracking-wide"
                      >
                        {email}
                      </a>
                    </li>
                  )}
                  {phone && (
                    <li>
                      <a
                        href={`tel:${phone.replace(/\s+/g, "")}`}
                        className="font-owners-medium animated-underline text-[14px] uppercase tracking-wide"
                      >
                        {phone}
                      </a>
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>

          {/* The rule on the left is the page's column line between 3 and 4.
              Both side rules are drawn here rather than left to GridSection:
              its outer column lines are painted behind the content grid, and
              the cells' cream fill covers them wherever the form reaches an
              edge — the right one on desktop, both of them once the form goes
              full width on mobile. */}
          <div
            className={cn(
              FORM_COLUMNS,
              "border-x border-sky border-t md:border-t-0",
            )}
          >
            {sent ? (
              // h-full so the panel closes the ruled box at the bottom of the
              // row. Left short, the rule down its left edge — which is the
              // page's column line — carried on past the panel's own bottom.
              // Kept a plain block: as a flex column it stretched the button to
              // the full width and squeezed the reveal's measured line boxes.
              <div className="border-b border-sky px-(--grid-gutter) py-[9svh] md:h-full">
                <p className="font-owners-medium text-[14px] uppercase tracking-wide">
                  {t.sentTitle}
                </p>

                <div className="mt-4 mb-[4svh] h-(--grid-line) bg-sky" aria-hidden />

                <div className="min-w-0 text-left">
                  <TextReveal blockColor={REVEAL_BLOCK} stagger={0.12}>
                    <p className="font-owners-narrow-bold max-w-full text-[9vw] leading-[0.92] tracking-[-0.005em] wrap-break-word uppercase md:text-[min(3.4vw,5.4svh)]">
                      {t.thankYou}
                    </p>
                  </TextReveal>
                </div>

                <p className="font-archivo-light mt-[4svh] max-w-[44ch] text-[18px] leading-normal">
                  {t.success}
                </p>

                <button
                  type="button"
                  onClick={reopen}
                  className="mt-[5svh] inline-block border border-sky bg-sky px-3 py-2.5 transition-colors duration-500 hover:bg-cream"
                >
                  <span className="font-owners-medium inline-flex items-center text-[14px] uppercase tracking-wide">
                    {t.sendAnother}
                  </span>
                </button>
              </div>
            ) : (
              <form
                action={formAction}
                aria-busy={pending}
                noValidate={false}
                className="grid gap-px border-b border-sky bg-sky md:grid-cols-2"
              >
                {/* Off-screen and out of the tab order — see HONEYPOT_FIELD. */}
                <input
                  type="text"
                  name={HONEYPOT_FIELD}
                  tabIndex={-1}
                  autoComplete="off"
                  className="sr-only"
                  aria-hidden
                />

                <TextField
                  name="name"
                  label={t.name}
                  value={values.name}
                  onChange={update("name")}
                  error={errorText(state.errors.name)}
                  placeholder={t.namePlaceholder}
                  autoComplete="name"
                  required
                />

                <TextField
                  name="email"
                  label={t.email}
                  type="email"
                  value={values.email}
                  onChange={update("email")}
                  error={errorText(state.errors.email)}
                  placeholder={t.emailPlaceholder}
                  autoComplete="email"
                  required
                />

                <TextField
                  name="phone"
                  label={t.phone}
                  hint={t.optional}
                  type="tel"
                  value={values.phone}
                  onChange={update("phone")}
                  error={errorText(state.errors.phone)}
                  placeholder={t.phonePlaceholder}
                  autoComplete="tel"
                />

                <TextField
                  name="company"
                  label={t.company}
                  hint={t.optional}
                  value={values.company}
                  onChange={update("company")}
                  error={errorText(state.errors.company)}
                  placeholder={t.companyPlaceholder}
                  autoComplete="organization"
                />

                {/* A professional application answers different questions: its occasion
                    is fixed, and a company account is not booked for a date or a
                    headcount the way a one-off event is. */}
                {pro ? (
                  <input type="hidden" name="occasion" value={PRO_OCCASION} />
                ) : (
                  <>
                  {/* Radios rather than a select: the native dropdown is the one
                      control we cannot dress in the site's type.

                      role=group rather than fieldset/legend — a legend is laid
                      out against the fieldset's border edge, so it ignored the
                      cell's padding and printed on top of the rule above it. */}
                  <div
                    role="group"
                    aria-labelledby="contact-occasion-label"
                    className={cn(CELL, "md:col-span-2")}
                  >
                    <p id="contact-occasion-label" className={LABEL}>
                      {t.occasion}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {OCCASIONS.map((occasion) => (
                        <label
                          key={occasion}
                          className={cn(
                            "font-owners-medium cursor-pointer border border-sky px-3 py-2.5 text-[14px] uppercase tracking-wide transition-colors duration-300",
                            "hover:bg-sky/30 has-checked:bg-black has-checked:text-cream",
                            "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-black",
                          )}
                        >
                          <input
                            type="radio"
                            name="occasion"
                            value={occasion}
                            checked={values.occasion === occasion}
                            onChange={(event) =>
                              update("occasion")(event.target.value)
                            }
                            aria-describedby={
                              state.errors.occasion
                                ? "contact-occasion-error"
                                : undefined
                            }
                            className="sr-only"
                          />
                          {t.occasions[occasion]}
                        </label>
                      ))}
                    </div>

                    {state.errors.occasion && (
                      <p id="contact-occasion-error" className={ERROR}>
                        {errorText(state.errors.occasion)}
                      </p>
                    )}
                  </div>

                  {/* Free text, not a date input: at quote stage the day is
                      usually still approximate, and "a week in March" is a more
                      useful answer than a picker will accept. */}
                  <TextField
                    name="date"
                    label={t.date}
                    hint={t.dateHint}
                    value={values.date}
                    onChange={update("date")}
                    error={errorText(state.errors.date)}
                    placeholder={t.datePlaceholder}
                  />

                  <TextField
                    name="guests"
                    label={t.guests}
                    hint={t.optional}
                    value={values.guests}
                    onChange={update("guests")}
                    error={errorText(state.errors.guests)}
                    placeholder={t.guestsPlaceholder}
                  />
                  </>
                )}

                {pro && (
                  <TextField
                    name="vat"
                    label={dict.proAccount.vat}
                    value={values.vat}
                    onChange={update("vat")}
                    error={errorText(state.errors.vat)}
                    placeholder={dict.proAccount.vatPlaceholder}
                    required
                  />
                )}

                {pro && (
                  <TextField
                    name="address"
                    label={dict.proAccount.address}
                    value={values.address}
                    onChange={update("address")}
                    error={errorText(state.errors.address)}
                    placeholder={dict.proAccount.addressPlaceholder}
                    className="md:col-span-2"
                  />
                )}


                <TextField
                  name="message"
                  label={pro ? dict.proAccount.message : t.message}
                  value={values.message}
                  onChange={update("message")}
                  error={errorText(state.errors.message)}
                  placeholder={t.messagePlaceholder}
                  rows={6}
                  maxLength={MESSAGE_MAX}
                  required
                  className="md:col-span-2"
                />

                <div
                  className={cn(
                    CELL,
                    "flex flex-col gap-6 md:col-span-2 md:flex-row md:items-center md:justify-between",
                  )}
                >
                  <p
                    aria-live="polite"
                    className="font-archivo-light max-w-[38ch] text-[18px] leading-normal"
                  >
                    {state.status === "invalid"
                      ? t.invalidSummary
                      : state.status === "error"
                        ? t.failed
                        : t.replyNote}
                  </p>

                  <button
                    type="submit"
                    disabled={pending}
                    className="shrink-0 self-start border border-sky bg-sky px-3 py-2.5 transition-colors duration-500 hover:bg-cream disabled:opacity-40 md:self-auto"
                  >
                    <span className="font-owners-medium inline-flex items-center text-[14px] uppercase tracking-wide">
                      {pending
                        ? t.sending
                        : pro
                          ? dict.proAccount.submit
                          : t.submit}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </GridSection>
  );
}
