"use client";

import { useEffect, useState } from "react";

/**
 * The delivery windows that are full on `date`, as slot ids, fetched from
 * `/api/delivery-capacity` whenever the day changes.
 *
 * Empty while loading and on any failure. The pickers only grey out what this
 * returns; the server re-checks the count before saving a window and again at
 * checkout, so a stale or missing answer here can mislead nobody into a
 * booking the kitchen cannot take.
 */
export function useFullSlots(date: string | null): string[] {
  const [result, setResult] = useState<{ date: string; ids: string[] } | null>(
    null,
  );

  useEffect(() => {
    if (!date) return;

    const controller = new AbortController();
    fetch(`/api/delivery-capacity?date=${encodeURIComponent(date)}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((json: { fullSlotIds?: string[] } | null) => {
        setResult({ date, ids: json?.fullSlotIds ?? [] });
      })
      .catch(() => {
        // Aborted by a newer date, or offline — either way, nothing is greyed.
      });

    return () => controller.abort();
  }, [date]);

  // Keyed by date so the answer for Tuesday never greys Wednesday's windows
  // while Wednesday's is on its way.
  return result && result.date === date ? result.ids : [];
}
