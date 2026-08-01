"use client";

import { useSyncExternalStore } from "react";
import {
  getConsentSnapshot,
  getServerConsentSnapshot,
  subscribeConsent,
} from "@/lib/consent/store";

/**
 * Mount analytics and marketing tags here once they are added to the stack.
 * Scripts only render after the visitor has opted in.
 */
export function ConsentScripts() {
  const consent = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getServerConsentSnapshot,
  );

  if (!consent) return null;

  return (
    <>
      {consent.analytics && null}
      {consent.marketing && null}
    </>
  );
}
