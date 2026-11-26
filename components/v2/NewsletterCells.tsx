"use client";

import { useActionState } from "react";
import { subscribeToNewsletter } from "@/app/actions/newsletter";
import { CellGrid } from "@/components/v2/CellGrid";
import { HONEYPOT_FIELD } from "@/lib/contact";

type NewsletterCellsProps = {
  copy: {
    headline: string;
    body: string;
    formLabel: string;
    placeholder: string;
    submit: string;
    success: string;
    error: string;
  };
};

/**
 * The newsletter sign-up on the 16 / 12 / 4 grid — a first version, to be
 * redesigned (26 November 2026). The v1 home's NewsletterSection, same form
 * and same action, on the page grid in sky.
 *
 * Where a sign-up goes: for now each one arrives as an e-mail in the
 * kitchen's inbox (`subscribeToNewsletter`), until the owners pick a mailing
 * tool — Shopify Email is the natural one; connecting it needs the
 * `write_customers` scope on their Admin app. That is the one function to
 * change.
 *
 *   desktop  headline and text cells 1–7; the form cells 10–16
 *   tablet   headline and text cells 1–6; the form cells 7–12
 *   phone    one under the other, across the 4 cells
 */
export function NewsletterCells({ copy }: NewsletterCellsProps) {
  const [state, formAction, isPending] = useActionState(
    subscribeToNewsletter,
    "idle",
  );

  return (
    <section
      aria-labelledby="newsletter-title"
      className="relative w-full bg-sky"
    >
      <CellGrid
        lineClassName="bg-cream/60"
        bands={false}
        cells={false}
        readout={false}
        subdivide={2}
      />
      <div
        className="relative grid gap-y-[5svh] py-(--s-cell-h)"
        style={{ gridTemplateColumns: "var(--s-grid-columns)" }}
      >
        <div className="col-[2/span_4] min-w-0 px-(--v2-pad) md:col-[2/span_6] lg:col-[2/span_7]">
          <h2
            id="newsletter-title"
            className="font-owners-narrow-bold text-[9vw] leading-[0.95] tracking-[-0.005em] text-balance text-black uppercase md:text-[min(3.6vw,5.5svh)]"
          >
            {copy.headline}
          </h2>
          <p className="font-archivo-light mt-5 max-w-[46ch] text-(length:--body-text) leading-normal text-black">
            {copy.body}
          </p>
        </div>

        <div className="col-[2/span_4] min-w-0 self-end px-(--v2-pad) md:col-[8/span_6] lg:col-[11/span_7]">
          <p className="font-owners-medium text-[12px] tracking-wide uppercase">
            {copy.formLabel}
          </p>

          {state === "success" ? (
            <p
              role="status"
              className="font-archivo-light mt-4 text-(length:--body-text) leading-normal"
            >
              {copy.success}
            </p>
          ) : (
            <>
              <form
                action={formAction}
                className="mt-3 flex w-full items-stretch border border-cream bg-cream"
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
                <label className="sr-only" htmlFor="newsletter-cells-email">
                  {copy.placeholder}
                </label>
                <input
                  id="newsletter-cells-email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  aria-invalid={state === "error" || undefined}
                  aria-describedby={
                    state === "error" ? "newsletter-cells-error" : undefined
                  }
                  placeholder={copy.placeholder}
                  className="font-archivo-light min-w-0 flex-1 bg-transparent px-3 py-3 text-[15px] text-black outline-none placeholder:text-black/40 md:px-4"
                />
                <button
                  type="submit"
                  disabled={isPending}
                  className="font-owners-medium shrink-0 bg-black px-4 py-3 text-[11px] tracking-wide text-cream uppercase transition-opacity duration-500 hover:opacity-80 disabled:cursor-wait disabled:opacity-60 md:px-5"
                >
                  {copy.submit}
                </button>
              </form>
              {state === "error" && (
                <p
                  id="newsletter-cells-error"
                  role="alert"
                  className="font-archivo-light mt-3 text-[14px] leading-normal"
                >
                  {copy.error}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
