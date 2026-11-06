export const CONSENT_COOKIE_NAME = "moment_consent";
/** 2 is the version that covers Google Analytics: everyone is asked. */
export const CONSENT_VERSION = 2;
/**
 * Six months — the duration the APD's cookie checklist recommends for keeping
 * a visitor's choice before asking again. Listed on the cookies page; change
 * both together.
 */
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 183;

export type ConsentCategory = "analytics" | "marketing";

export type ConsentChoices = {
  analytics: boolean;
  marketing: boolean;
};

export type ConsentRecord = ConsentChoices & {
  necessary: true;
  version: number;
  updatedAt: string;
};
