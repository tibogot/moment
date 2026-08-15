"use client";

import { useEffect, useRef, useState } from "react";
import type { AddressSearch } from "@/lib/address/provider";
import { interpolate, type Dictionary } from "@/lib/i18n/dictionaries";
import { MIN_ADDRESS_QUERY_LENGTH } from "@/lib/order-preferences";

/** Long enough that typing a street does not fire a request per keystroke. */
const SEARCH_DEBOUNCE_MS = 250;

/**
 * Type a Belgian street, pick a match, done.
 *
 * Its own file because two places ask the question now: the bar on a product
 * page, and the cart panel — where "add a delivery address" used to be a
 * sentence pointing the customer back to a product page they had already left.
 * A blocker the customer cannot clear where they are told about it is a blocker
 * they abandon.
 */
type AddressPanelProps = {
  current: string | null;
  onSelect: (value: string) => void;
  saving: boolean;
  t: Dictionary["orderBar"];
};

const NO_RESULTS: AddressSearch = { matches: [], streets: [] };

export function AddressPanel({
  current,
  onSelect,
  saving,
  t,
}: AddressPanelProps) {
  const [query, setQuery] = useState(current ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  // Results are stored with the query that produced them, so "are these still
  // the right results?" is a comparison rather than a second piece of state
  // that has to be cleared in step with this one.
  const [results, setResults] = useState<{
    query: string;
    data: AddressSearch;
  } | null>(null);

  const trimmed = query.trim();
  const shouldSearch =
    trimmed.length >= MIN_ADDRESS_QUERY_LENGTH && trimmed !== current;

  const data = results?.query === trimmed ? results.data : null;
  const searching = shouldSearch && data === null;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!shouldSearch) return;

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/address?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );

        setResults({
          query: trimmed,
          data: response.ok
            ? ((await response.json()) as AddressSearch)
            : NO_RESULTS,
        });
      } catch {
        // Aborted by the next keystroke — leave the state alone, the request
        // replacing this one owns it now. Anything else settles as no results
        // so the panel does not sit on "Checking…" forever.
        if (!controller.signal.aborted) {
          setResults({ query: trimmed, data: NO_RESULTS });
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, shouldSearch]);

  const showEmpty = shouldSearch && data !== null && data.matches.length === 0;

  return (
    <div>
      <div className="p-4">
        {/* The overlay's own title already asks the question, so the field goes
            without a second heading above it. */}
        <input
          ref={inputRef}
          id="delivery-address"
          type="text"
          autoComplete="off"
          aria-label={t.streetAndNumber}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.addressPlaceholder}
          className="font-archivo-light w-full border-b border-sky bg-transparent pb-2 text-[18px] outline-none placeholder:opacity-40"
        />
        <p className="font-archivo-light mt-3 text-[18px] leading-normal opacity-70">
          {t.addressHint}
        </p>
      </div>

      {(searching || (data && data.matches.length > 0) || showEmpty) && (
        <div
          data-lenis-prevent
          className="max-h-60 overflow-y-auto border-t border-sky"
        >
          {searching && (
            <p className="font-archivo-light px-4 py-3 text-[18px] opacity-70">
              {t.checking}
            </p>
          )}

          {data?.matches.map((match) => (
            <button
              key={match.id}
              type="button"
              disabled={saving}
              onClick={() => onSelect(match.label)}
              className="font-archivo-light block w-full px-4 py-3 text-left text-[18px] wrap-break-word transition-colors hover:bg-sky/30 disabled:opacity-40"
            >
              {match.label}
            </button>
          ))}

          {showEmpty && (
            <div className="px-4 py-3">
              <p className="font-archivo-light text-[18px]">{t.noMatch}</p>
              {data.streets.length > 0 && (
                <p className="font-archivo-light mt-2 text-[18px] opacity-70">
                  {interpolate(t.didYouMean, {
                    streets: data.streets.join(", "),
                  })}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
