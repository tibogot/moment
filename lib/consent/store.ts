import {
  acceptAllConsentRecord,
  readConsentCookie,
  rejectAllConsentRecord,
  writeConsentCookie,
  buildConsentRecord,
} from "@/lib/consent/cookie";
import type { ConsentChoices, ConsentRecord } from "@/lib/consent/types";

const listeners = new Set<() => void>();
let preferencesOpen = false;
let consentHydrated = false;
/** Cached snapshot — must keep referential stability for useSyncExternalStore. */
let consentSnapshot: ConsentRecord | null = null;

function emit() {
  for (const listener of listeners) emitOnce(listener);
}

function emitOnce(listener: () => void) {
  listener();
}

function hydrateConsentSnapshot() {
  if (consentHydrated) return;
  consentSnapshot = readConsentCookie();
  consentHydrated = true;
}

function commitConsent(record: ConsentRecord) {
  writeConsentCookie(record);
  consentSnapshot = record;
  consentHydrated = true;
}

export function subscribeConsent(callback: () => void): () => void {
  hydrateConsentSnapshot();
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getConsentSnapshot(): ConsentRecord | null {
  hydrateConsentSnapshot();
  return consentSnapshot;
}

export function getServerConsentSnapshot(): ConsentRecord | null {
  return null;
}

export function getPreferencesOpenSnapshot(): boolean {
  return preferencesOpen;
}

export function getServerPreferencesOpenSnapshot(): boolean {
  return false;
}

export function setPreferencesOpen(open: boolean) {
  preferencesOpen = open;
  emit();
}

export function acceptAllConsent() {
  commitConsent(acceptAllConsentRecord());
  preferencesOpen = false;
  emit();
}

export function rejectAllConsent() {
  commitConsent(rejectAllConsentRecord());
  preferencesOpen = false;
  emit();
}

export function saveConsent(choices: ConsentChoices) {
  commitConsent(buildConsentRecord(choices));
  preferencesOpen = false;
  emit();
}

export function openCookiePreferences() {
  preferencesOpen = true;
  emit();
}

if (typeof window !== "undefined") {
  window.addEventListener("cookie-preferences-open", () => {
    openCookiePreferences();
  });
}
