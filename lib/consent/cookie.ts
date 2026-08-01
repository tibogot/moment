import {
  CONSENT_COOKIE_NAME,
  CONSENT_MAX_AGE_SECONDS,
  CONSENT_VERSION,
  type ConsentChoices,
  type ConsentRecord,
} from "@/lib/consent/types";

function isConsentRecord(value: unknown): value is ConsentRecord {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;
  return (
    record.necessary === true &&
    typeof record.analytics === "boolean" &&
    typeof record.marketing === "boolean" &&
    typeof record.version === "number" &&
    typeof record.updatedAt === "string"
  );
}

export function buildConsentRecord(choices: ConsentChoices): ConsentRecord {
  return {
    necessary: true,
    analytics: choices.analytics,
    marketing: choices.marketing,
    version: CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
  };
}

export function rejectAllConsentRecord(): ConsentRecord {
  return buildConsentRecord({ analytics: false, marketing: false });
}

export function acceptAllConsentRecord(): ConsentRecord {
  return buildConsentRecord({ analytics: true, marketing: true });
}

export function readConsentCookie(): ConsentRecord | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${CONSENT_COOKIE_NAME}=([^;]*)`),
  );
  if (!match) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(match[1])) as unknown;
    if (!isConsentRecord(parsed) || parsed.version !== CONSENT_VERSION) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeConsentCookie(record: ConsentRecord) {
  const value = encodeURIComponent(JSON.stringify(record));
  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie = `${CONSENT_COOKIE_NAME}=${value}; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function hasConsentDecision(): boolean {
  return readConsentCookie() !== null;
}
