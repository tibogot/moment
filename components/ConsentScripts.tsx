"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  GA_COOKIE_EXPIRES_SECONDS,
  GA_MEASUREMENT_ID,
  flushPendingAnalytics,
  isAnalyticsConfigured,
} from "@/lib/analytics";
import {
  getConsentSnapshot,
  getServerConsentSnapshot,
  subscribeConsent,
} from "@/lib/consent/store";

type GtagWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
} & Record<string, unknown>;

let gaLoaded = false;

/**
 * Injects gtag.js the first time analytics is granted, and never before.
 *
 * Consent Mode v2 defaults are set in the same breath, before the library
 * runs: analytics granted (the visitor just said yes), every advertising
 * signal denied. Page views follow client-side navigation through GA4's
 * enhanced measurement ("page changes based on browser history events"),
 * which is on by default in the web stream — nothing to wire per route.
 */
function loadGoogleAnalytics() {
  const w = window as unknown as GtagWindow;

  // Granted again after a withdrawal in the same visit: the library is
  // already there, it only needs switching back on.
  if (gaLoaded) {
    w[`ga-disable-${GA_MEASUREMENT_ID}`] = false;
    w.gtag?.("consent", "update", { analytics_storage: "granted" });
    return;
  }
  gaLoaded = true;

  w[`ga-disable-${GA_MEASUREMENT_ID}`] = false;
  w.dataLayer = w.dataLayer ?? [];
  w.gtag = function gtag() {
    // gtag.js reads the `arguments` object itself, not an array copy.
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  };

  w.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  w.gtag("js", new Date());
  w.gtag("config", GA_MEASUREMENT_ID, {
    cookie_expires: GA_COOKIE_EXPIRES_SECONDS,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  flushPendingAnalytics();

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  document.head.appendChild(script);
}

/**
 * Consent withdrawn after GA had loaded: stop it sending, and remove what it
 * set. Withdrawing has to be as complete as granting — leaving `_ga` behind
 * would keep identifying a visitor who said no.
 */
function stopGoogleAnalytics() {
  const w = window as unknown as GtagWindow;
  w[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
  w.gtag?.("consent", "update", { analytics_storage: "denied" });

  const host = window.location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (!name || !(name === "_ga" || name.startsWith("_ga_"))) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/${domain ? `; Domain=${domain}` : ""}`;
    }
  }
}

/**
 * Where optional tags are mounted, each behind its consent category. Today
 * that is Google Analytics alone; there is no marketing tag.
 */
export function ConsentScripts() {
  const consent = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getServerConsentSnapshot,
  );

  const analyticsGranted = Boolean(consent?.analytics);

  useEffect(() => {
    if (!isAnalyticsConfigured()) return;
    if (analyticsGranted) loadGoogleAnalytics();
    else if (gaLoaded) stopGoogleAnalytics();
  }, [analyticsGranted]);

  return null;
}
