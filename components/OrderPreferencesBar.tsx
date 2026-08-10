"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import {
  setDeliveryAddress,
  setDeliveryDate,
  setDeliveryMethod,
} from "@/app/actions/cart";
import { DeliveryDatePicker } from "@/components/DeliveryDatePicker";
import type { AddressSearch } from "@/lib/address/provider";
import {
  getAvailabilitySnapshot,
  getCartSnapshot,
  getServerAvailabilitySnapshot,
  getServerCartSnapshot,
  getZonesSnapshot,
  notifyCartUpdated,
  subscribeCart,
} from "@/lib/cart-store";
import { useDictionary, useLocale } from "@/components/LocaleProvider";
import { interpolate, type Dictionary } from "@/lib/i18n/dictionaries";
import { closedWeekdaysNote, formatLongDate } from "@/lib/i18n/format";
import {
  DELIVERY_METHODS,
  MIN_ADDRESS_QUERY_LENGTH,
  needsAddress,
  type DeliveryMethod,
} from "@/lib/order-preferences";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { maxDeliveryDistanceKm } from "@/lib/delivery-zones";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type Panel = "date" | "address" | "delivery";

/** Long enough that typing a street does not fire a request per keystroke. */
const SEARCH_DEBOUNCE_MS = 250;

/**
 * The order preferences bar that sits at the top of a product page: the
 * delivery day, the address, and how the order leaves the kitchen.
 *
 * Everything here is cart state, not product state — the same three answers
 * apply to the whole order, and they are stored on the Shopify cart as
 * attributes. That is also why nothing is passed in as a prop: the product page
 * is prerendered by `generateStaticParams`, so reading the cart on the server
 * would make every product page dynamic. It reads through the same client-side
 * cart store the navbar badge and cart panel use instead.
 *
 * Nothing here gates adding to the basket. Unlike the sites this pattern comes
 * from, our catalogue does not change with the answers, so making it a wall
 * would buy friction and nothing else. The date is still required before
 * checkout, which is enforced in the cart.
 */
export function OrderPreferencesBar({ className }: { className?: string }) {
  const dict = useDictionary();
  const locale = useLocale();
  const t = dict.orderBar;
  const cart = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getServerCartSnapshot,
  );
  const availability = useSyncExternalStore(
    subscribeCart,
    getAvailabilitySnapshot,
    getServerAvailabilitySnapshot,
  );
  // Never null, and the same before and after hydration, so one getter serves
  // both sides — see `getZonesSnapshot`.
  const zones = useSyncExternalStore(
    subscribeCart,
    getZonesSnapshot,
    getZonesSnapshot,
  );

  const [panel, setPanel] = useState<Panel | null>(null);
  const [error, setError] = useState<string | null>(null);
  /**
   * An address we can reach but cannot price. Held apart from `error` because
   * it is not a mistake to correct — the sale is real, it just leaves the site
   * and becomes an enquiry.
   */
  const [quote, setQuote] = useState<{ address: string; km: number } | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  // The cart round-trips through the server on every change, so the chosen
  // value is held locally too and the segment updates on click rather than a
  // few hundred milliseconds later. Once the cart catches up the two agree.
  const [draft, setDraft] = useState<{
    date?: string;
    method?: DeliveryMethod;
    address?: string;
  }>({});

  const deliveryDate = draft.date ?? cart?.deliveryDate ?? null;
  const deliveryMethod = draft.method ?? cart?.deliveryMethod ?? null;
  const deliveryAddress = draft.address ?? cart?.deliveryAddress ?? null;

  const closePanel = useCallback(() => {
    setPanel(null);
    setError(null);
  }, []);

  const togglePanel = (next: Panel) => {
    setError(null);
    setPanel((current) => (current === next ? null : next));
  };

  useEffect(() => {
    if (!panel) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePanel();
    };

    // Pointerdown rather than click: a click that starts inside the panel and
    // ends outside it should not count as leaving.
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && containerRef.current?.contains(target)) {
        return;
      }
      closePanel();
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [panel, closePanel]);

  const chooseDate = (iso: string) => {
    setDraft((current) => ({ ...current, date: iso }));
    setError(null);

    startTransition(async () => {
      const result = await setDeliveryDate(iso);
      if (!result.ok) {
        setDraft((current) => ({ ...current, date: undefined }));
        setError(dict.errors[result.code]);
        return;
      }
      notifyCartUpdated();
      closePanel();
    });
  };

  const chooseMethod = (method: DeliveryMethod) => {
    setDraft((current) => ({
      ...current,
      method,
      // Switching to collection drops the address on the server, so the segment
      // must not keep showing a stale one.
      address: method === "pickup" ? undefined : current.address,
    }));
    setError(null);

    startTransition(async () => {
      const result = await setDeliveryMethod(method);
      if (!result.ok) {
        setDraft((current) => ({ ...current, method: undefined }));
        setError(dict.errors[result.code]);
        return;
      }
      notifyCartUpdated();
      closePanel();
    });
  };

  const chooseAddress = (value: string) => {
    setError(null);
    setQuote(null);

    startTransition(async () => {
      const result = await setDeliveryAddress(value);

      if (!result.ok) {
        // Too far to price, not wrong. The panel swaps to an enquiry rather
        // than telling the customer their address is a problem.
        if ("needsQuote" in result) {
          setQuote({ address: result.address, km: result.distanceKm });
          return;
        }
        setError(dict.errors[result.code]);
        return;
      }
      setDraft((current) => ({
        ...current,
        address: result.address,
        method: "delivery",
      }));
      notifyCartUpdated();
      closePanel();
    });
  };

  const addressDisabled = !needsAddress(deliveryMethod);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="flex flex-col border border-sky md:flex-row md:items-stretch">
        <Segment
          label={t.date}
          title={t.chooseDateTitle}
          value={deliveryDate ? formatLongDate(locale, deliveryDate) : null}
          placeholder={t.selectDate}
          open={panel === "date"}
          onToggle={() => togglePanel("date")}
        >
          {availability ? (
            <>
              <p className="font-archivo-light px-4 pt-4 text-[15px] leading-normal">
                {interpolate(dict.delivery.calendarNote, {
                  days: availability.leadTimeDays,
                })}{" "}
                {closedWeekdaysNote(locale, dict, availability.closedWeekdays)}
              </p>
              <DeliveryDatePicker
                availability={availability}
                value={deliveryDate}
                onSelect={chooseDate}
                disabled={isPending}
              />
            </>
          ) : (
            <p className="font-archivo-light p-4 text-[15px]">
              {t.loadingDays}
            </p>
          )}
        </Segment>

        <Divider />

        <Segment
          label={t.address}
          title={t.whereDeliver}
          value={addressDisabled ? t.notNeeded : deliveryAddress}
          placeholder={t.addAddress}
          open={panel === "address"}
          onToggle={() => togglePanel("address")}
          disabled={addressDisabled}
          disabledHint={t.collectHint}
        >
          <AddressPanel
            current={deliveryAddress}
            onSelect={chooseAddress}
            saving={isPending}
            t={t}
          />
        </Segment>

        <Divider />

        <Segment
          label={t.deliveryLabel}
          title={t.howLike}
          value={
            deliveryMethod ? dict.deliveryMethods[deliveryMethod].label : null
          }
          placeholder={t.deliveryType}
          open={panel === "delivery"}
          onToggle={() => togglePanel("delivery")}
          align="right"
        >
          {/* Only vertical padding: the options carry px-4 of their own, which
              is what lines their text up with the title above. */}
          <div className="py-2">
            {DELIVERY_METHODS.map((option) => (
              <button
                key={option}
                type="button"
                disabled={isPending}
                aria-pressed={deliveryMethod === option}
                onClick={() => chooseMethod(option)}
                className={cn(
                  "block w-full px-4 py-3 text-left transition-colors hover:bg-sky/30 disabled:opacity-40",
                  deliveryMethod === option && "bg-sky/40",
                )}
              >
                <span className="font-owners-medium block text-[13px] uppercase tracking-wide">
                  {dict.deliveryMethods[option].label}
                </span>
                <span className="font-archivo-light mt-1 block text-[15px] leading-normal">
                  {dict.deliveryMethods[option].description}
                </span>
              </button>
            ))}
          </div>
        </Segment>
      </div>

      {error && (
        <p role="alert" className="font-archivo-light mt-3 text-[15px]">
          {error}
        </p>
      )}

      {quote && (
        <div role="alert" className="mt-3 border border-sky p-4">
          <p className="font-owners-medium text-[12px] uppercase tracking-wide">
            {dict.quote.heading}
          </p>
          <p className="font-archivo-light mt-2 text-[15px] leading-normal">
            {interpolate(dict.quote.body, {
              address: quote.address,
              km: quote.km,
              max: maxDeliveryDistanceKm(zones),
            })}
          </p>
          <Link
            href={`${routes.contact}?occasion=Delivery&address=${encodeURIComponent(quote.address)}&km=${quote.km}`}
            className="group mt-4 inline-block border border-sky bg-sky px-3 py-2.5 transition-colors duration-500 hover:bg-cream"
          >
            <span className="font-owners-medium inline-flex items-center gap-2 text-[11px] uppercase tracking-wide">
              {dict.quote.cta}
              <span
                className="transition-transform duration-500 group-hover:translate-x-1.5"
                aria-hidden
              >
                &rarr;
              </span>
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}

function Divider() {
  return <div className="border-t border-sky md:border-t-0 md:border-l" />;
}

type SegmentProps = {
  label: string;
  /**
   * Names the overlay in full. The segment's own label is a one-word column
   * heading — opening a bare calendar or a bare text field left it to the
   * visitor to work out what was being asked of them.
   */
  title: string;
  value: string | null;
  placeholder: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  disabledHint?: string;
  align?: "left" | "right";
};

function Segment({
  label,
  title,
  value,
  placeholder,
  open,
  onToggle,
  children,
  disabled = false,
  disabledHint,
  align = "left",
}: SegmentProps) {
  const titleId = useId();

  return (
    <div className="relative flex-1">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="dialog"
        title={disabled ? disabledHint : undefined}
        className={cn(
          "flex w-full flex-col items-start px-5 py-4 text-left transition-colors",
          disabled ? "cursor-default opacity-50" : "hover:bg-sky/20",
          open && "bg-sky/25",
        )}
      >
        <span className="font-owners-medium text-[11px] uppercase tracking-wide opacity-60">
          {label}
        </span>
        <span
          className={cn(
            "font-archivo-light mt-1 text-[16px]",
            !value && "opacity-50",
          )}
        >
          {value ?? placeholder}
        </span>
      </button>

      {open && !disabled && (
        <div
          role="dialog"
          aria-labelledby={titleId}
          className={cn(
            "absolute top-full z-10 mt-2 w-[min(88vw,420px)] border border-sky bg-cream",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          <p
            id={titleId}
            className="font-owners-medium border-b border-sky px-4 py-3.5 text-left text-[12px] uppercase tracking-wide"
          >
            {title}
          </p>

          {children}
        </div>
      )}
    </div>
  );
}

type AddressPanelProps = {
  current: string | null;
  onSelect: (value: string) => void;
  saving: boolean;
  t: Dictionary["orderBar"];
};

const NO_RESULTS: AddressSearch = { matches: [], streets: [] };

function AddressPanel({ current, onSelect, saving, t }: AddressPanelProps) {
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
          className="font-archivo-light w-full border-b border-sky bg-transparent pb-2 text-[16px] outline-none placeholder:opacity-40"
        />
        <p className="font-archivo-light mt-3 text-[14px] leading-normal opacity-70">
          {t.addressHint}
        </p>
      </div>

      {(searching || (data && data.matches.length > 0) || showEmpty) && (
        <div
          data-lenis-prevent
          className="max-h-60 overflow-y-auto border-t border-sky"
        >
          {searching && (
            <p className="font-archivo-light px-4 py-3 text-[15px] opacity-70">
              {t.checking}
            </p>
          )}

          {data?.matches.map((match) => (
            <button
              key={match.id}
              type="button"
              disabled={saving}
              onClick={() => onSelect(match.label)}
              className="font-archivo-light block w-full px-4 py-3 text-left text-[15px] transition-colors hover:bg-sky/30 disabled:opacity-40"
            >
              {match.label}
            </button>
          ))}

          {showEmpty && (
            <div className="px-4 py-3">
              <p className="font-archivo-light text-[15px]">
                {t.noMatch}
              </p>
              {data.streets.length > 0 && (
                <p className="font-archivo-light mt-2 text-[15px] opacity-70">
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
