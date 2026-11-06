"use client";

import { useEffect, useState } from "react";

/**
 * The slots that are full on `date`, as slot ids — delivery windows, or
 * collection times when `method` is "pickup" — fetched from
 * `/api/delivery-capacity` whenever the day or the method changes.
 *
 * Empty while loading and on any failure. The pickers only grey out what this
 * returns; the server re-checks the count before saving a slot and again at
 * checkout, so a stale or missing answer here can mislead nobody into a
 * booking the kitchen cannot take.
 */
export function useFullSlots(
  date: string | null,
  method: "delivery" | "pickup" | null = "delivery",
): string[] {
  const kind = method === "pickup" ? "pickup" : "delivery";
  const key = date ? `${kind}:${date}` : null;
  const [result, setResult] = useState<{ key: string; ids: string[] } | null>(
    null,
  );

  useEffect(() => {
    if (!date || !key) return;

    const controller = new AbortController();
    fetch(
      `/api/delivery-capacity?date=${encodeURIComponent(date)}&method=${kind}`,
      { signal: controller.signal, cache: "no-store" },
    )
      .then((response) => (response.ok ? response.json() : null))
      .then((json: { fullSlotIds?: string[] } | null) => {
        setResult({ key, ids: json?.fullSlotIds ?? [] });
      })
      .catch(() => {
        // Aborted by a newer request, or offline — either way, nothing is greyed.
      });

    return () => controller.abort();
  }, [date, key, kind]);

  // Keyed by day and method, so Tuesday's answer never greys Wednesday's
  // slots, nor a delivery answer the collection times.
  return result && result.key === key ? result.ids : [];
}
