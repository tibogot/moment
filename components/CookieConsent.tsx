"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { OPTIONAL_CONSENT_CATEGORIES } from "@/lib/consent/categories";
import {
  acceptAllConsent,
  getConsentSnapshot,
  getPreferencesOpenSnapshot,
  getServerConsentSnapshot,
  getServerPreferencesOpenSnapshot,
  rejectAllConsent,
  saveConsent,
  setPreferencesOpen,
  subscribeConsent,
} from "@/lib/consent/store";
import type { ConsentChoices } from "@/lib/consent/types";
import { routes } from "@/lib/routes";
import { useOverlayScrollLock } from "@/lib/useOverlayScrollLock";

function CookieCtaButton({
  children,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="group inline-block border border-sky bg-cream px-3 py-2.5 transition-colors duration-500 hover:bg-sky"
    >
      <span className="font-owners-medium inline-flex items-center gap-2 text-[11px] uppercase tracking-wide">
        {children}
        <span
          className="transition-transform duration-500 group-hover:translate-x-1.5"
          aria-hidden
        >
          &rarr;
        </span>
      </span>
    </button>
  );
}

function choicesFromConsent(
  consent: ReturnType<typeof getConsentSnapshot>,
): ConsentChoices {
  return {
    analytics: consent?.analytics ?? false,
    marketing: consent?.marketing ?? false,
  };
}

export function CookieConsent() {
  const consent = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getServerConsentSnapshot,
  );
  const preferencesOpen = useSyncExternalStore(
    subscribeConsent,
    getPreferencesOpenSnapshot,
    getServerPreferencesOpenSnapshot,
  );
  const [mounted, setMounted] = useState(false);
  const [draft, setDraft] = useState<ConsentChoices>({
    analytics: false,
    marketing: false,
  });

  useOverlayScrollLock(preferencesOpen);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!preferencesOpen) return;
    setDraft(choicesFromConsent(consent));
  }, [preferencesOpen, consent]);

  if (!mounted) return null;

  const showBanner = consent === null && !preferencesOpen;

  return (
    <>
      {showBanner && (
        <div
          className="fixed inset-x-0 bottom-0 z-[90] border-t border-sky bg-cream"
          role="dialog"
          aria-label="Cookie consent"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-5 px-(--grid-inset) py-5 md:flex-row md:items-end md:justify-between md:gap-8 md:py-6">
            <div className="max-w-xl">
              <p className="font-owners-medium text-[12px] uppercase tracking-wide">
                Cookies
              </p>
              <p className="font-archivo-light mt-2 text-[14px] leading-normal md:text-[15px]">
                We use strictly necessary cookies for cart, checkout and account
                features. Analytics and marketing cookies are optional — choose
                what you are comfortable with.{" "}
                <Link
                  href={routes.cookies}
                  className="underline underline-offset-2 transition-opacity hover:opacity-60"
                >
                  Cookie policy
                </Link>
                {" · "}
                <Link
                  href={routes.privacy}
                  className="underline underline-offset-2 transition-opacity hover:opacity-60"
                >
                  Privacy
                </Link>
              </p>
            </div>

            <div className="flex flex-wrap gap-2 md:shrink-0 md:justify-end">
              <CookieCtaButton onClick={() => setPreferencesOpen(true)}>
                Manage
              </CookieCtaButton>
              <CookieCtaButton onClick={rejectAllConsent}>Reject</CookieCtaButton>
              <CookieCtaButton onClick={acceptAllConsent}>
                Accept all
              </CookieCtaButton>
            </div>
          </div>
        </div>
      )}

      {preferencesOpen && (
        <div className="fixed inset-0 z-[95] flex items-end justify-center md:items-center md:p-6">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close cookie preferences"
            onClick={() => setPreferencesOpen(false)}
          />

          <div
            className="relative max-h-[90svh] w-full overflow-y-auto border-t border-sky bg-cream md:max-w-lg md:border"
            role="dialog"
            aria-modal="true"
            aria-label="Cookie preferences"
            data-lenis-prevent
          >
            <div className="border-b border-sky px-(--grid-gutter) py-5">
              <h2 className="font-owners-medium text-[12px] uppercase tracking-wide">
                Cookie preferences
              </h2>
              <p className="font-archivo-light mt-2 text-[14px] leading-normal">
                Strictly necessary cookies are always active. You can enable or
                disable the categories below at any time.
              </p>
            </div>

            <ul className="divide-y divide-sky">
              <li className="px-(--grid-gutter) py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-owners-medium text-[12px] uppercase tracking-wide">
                      Strictly necessary
                    </p>
                    <p className="font-archivo-light mt-2 text-[14px] leading-normal">
                      Required for cart, checkout, sign-in and site security.
                    </p>
                  </div>
                  <span className="font-archivo-light shrink-0 text-[12px] text-black/50">
                    Always on
                  </span>
                </div>
              </li>

              {OPTIONAL_CONSENT_CATEGORIES.map(({ id, title, description }) => (
                <li key={id} className="px-(--grid-gutter) py-5">
                  <label className="flex cursor-pointer items-start justify-between gap-4">
                    <span>
                      <span className="font-owners-medium text-[12px] uppercase tracking-wide">
                        {title}
                      </span>
                      <span className="font-archivo-light mt-2 block text-[14px] leading-normal">
                        {description}
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={draft[id]}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          [id]: event.target.checked,
                        }))
                      }
                      className="mt-1 size-4 shrink-0 accent-black"
                    />
                  </label>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-2 border-t border-sky px-(--grid-gutter) py-5">
              <CookieCtaButton onClick={() => setPreferencesOpen(false)}>
                Cancel
              </CookieCtaButton>
              <CookieCtaButton onClick={() => saveConsent(draft)}>
                Save preferences
              </CookieCtaButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Footer control — reopens the preferences panel at any time. */
export function CookiePreferencesButton({
  className,
}: {
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("cookie-preferences-open"))}
      className={className}
    >
      Cookie preferences
    </button>
  );
}
