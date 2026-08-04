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
import type { AddressSearch } from "@/lib/address/urbis";
import {
  getAvailabilitySnapshot,
  getCartSnapshot,
  getServerAvailabilitySnapshot,
  getServerCartSnapshot,
  notifyCartUpdated,
  subscribeCart,
} from "@/lib/cart-store";
import { LEAD_TIME_DAYS, formatDeliveryDate } from "@/lib/delivery";
import {
  DELIVERY_METHODS,
  MIN_ADDRESS_QUERY_LENGTH,
  deliveryMethodLabel,
  needsAddress,
  type DeliveryMethod,
} from "@/lib/order-preferences";
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

  const [panel, setPanel] = useState<Panel | null>(null);
  const [error, setError] = useState<string | null>(null);
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
        setError(result.error);
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
        setError(result.error);
        return;
      }
      notifyCartUpdated();
      closePanel();
    });
  };

  const chooseAddress = (value: string) => {
    setError(null);

    startTransition(async () => {
      const result = await setDeliveryAddress(value);
      if (!result.ok) {
        setError(result.error);
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
          label="Date"
          title="Choose a delivery date"
          value={deliveryDate ? formatDeliveryDate(deliveryDate) : null}
          placeholder="Select a date"
          open={panel === "date"}
          onToggle={() => togglePanel("date")}
        >
          {availability ? (
            <>
              <p className="font-archivo-light px-4 pt-4 text-[13px] leading-normal">
                Blue days are closed or already full — we need {LEAD_TIME_DAYS}{" "}
                days&apos; notice and we do not deliver on Sundays.
              </p>
              <DeliveryDatePicker
                availability={availability}
                value={deliveryDate}
                onSelect={chooseDate}
                disabled={isPending}
              />
            </>
          ) : (
            <p className="font-archivo-light p-6 text-[13px]">
              Loading available days&hellip;
            </p>
          )}
        </Segment>

        <Divider />

        <Segment
          label="Address"
          title="Where should we deliver?"
          value={addressDisabled ? "Not needed" : deliveryAddress}
          placeholder="Add an address"
          open={panel === "address"}
          onToggle={() => togglePanel("address")}
          disabled={addressDisabled}
          disabledHint="You chose click & collect"
        >
          <AddressPanel
            current={deliveryAddress}
            onSelect={chooseAddress}
            saving={isPending}
          />
        </Segment>

        <Divider />

        <Segment
          label="Delivery"
          title="How would you like it?"
          value={deliveryMethod ? deliveryMethodLabel(deliveryMethod) : null}
          placeholder="Delivery type"
          open={panel === "delivery"}
          onToggle={() => togglePanel("delivery")}
          align="right"
        >
          {/* Only vertical padding: the options carry px-4 of their own, which
              is what lines their text up with the title above. */}
          <div className="py-2">
            {DELIVERY_METHODS.map((option) => (
              <button
                key={option.id}
                type="button"
                disabled={isPending}
                aria-pressed={deliveryMethod === option.id}
                onClick={() => chooseMethod(option.id)}
                className={cn(
                  "block w-full px-4 py-3 text-left transition-colors hover:bg-sky/30 disabled:opacity-40",
                  deliveryMethod === option.id && "bg-sky/40",
                )}
              >
                <span className="font-owners-medium block text-[12px] uppercase tracking-wide">
                  {option.label}
                </span>
                <span className="font-archivo-light mt-1 block text-[13px] leading-normal">
                  {option.description}
                </span>
              </button>
            ))}
          </div>
        </Segment>
      </div>

      {error && (
        <p role="alert" className="font-archivo-light mt-3 text-[13px]">
          {error}
        </p>
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
        <span className="font-owners-medium text-[10px] uppercase tracking-wide opacity-60">
          {label}
        </span>
        <span
          className={cn(
            "font-archivo-light mt-1 text-[14px]",
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
            "absolute top-full z-40 mt-2 w-[min(88vw,380px)] border border-sky bg-cream",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          <p
            id={titleId}
            className="font-owners-medium border-b border-sky px-4 py-3 text-left text-[11px] uppercase tracking-wide"
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
};

const NO_RESULTS: AddressSearch = { matches: [], streets: [] };

function AddressPanel({ current, onSelect, saving }: AddressPanelProps) {
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
          aria-label="Street and number"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rue de Stalle 77"
          className="font-archivo-light w-full border-b border-sky bg-transparent pb-2 text-[14px] outline-none placeholder:opacity-40"
        />
        <p className="font-archivo-light mt-3 text-[12px] leading-normal opacity-60">
          Pick your address from the list. We deliver across Brussels only, in
          French or Dutch.
        </p>
      </div>

      {(searching || (data && data.matches.length > 0) || showEmpty) && (
        <div
          data-lenis-prevent
          className="max-h-60 overflow-y-auto border-t border-sky"
        >
          {searching && (
            <p className="font-archivo-light px-4 py-3 text-[13px] opacity-60">
              Checking&hellip;
            </p>
          )}

          {data?.matches.map((match) => (
            <button
              key={match.id}
              type="button"
              disabled={saving}
              onClick={() => onSelect(match.label)}
              className="font-archivo-light block w-full px-4 py-3 text-left text-[13px] transition-colors hover:bg-sky/30 disabled:opacity-40"
            >
              {match.label}
            </button>
          ))}

          {showEmpty && (
            <div className="px-4 py-3">
              <p className="font-archivo-light text-[13px]">
                No Brussels address matches that.
              </p>
              {data.streets.length > 0 && (
                <p className="font-archivo-light mt-2 text-[13px] opacity-60">
                  Did you mean {data.streets.join(", ")}? Add a house number.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
