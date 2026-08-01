export const CONSENT_COOKIE_NAME = "moment_consent";
export const CONSENT_VERSION = 1;
/** One year — re-confirm if the policy version bumps. */
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

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

export type ConsentCategoryMeta = {
  id: ConsentCategory;
  title: string;
  description: string;
};
