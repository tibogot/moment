"use client";

import { useDictionary } from "@/components/LocaleProvider";
import { formatSlot, slotId, type DeliverySlot } from "@/lib/delivery-slots";
import { cn } from "@/lib/utils";

type DeliverySlotPickerProps = {
  slots: DeliverySlot[];
  /** The window already chosen, or null. */
  value: DeliverySlot | null;
  onSelect: (slot: DeliverySlot) => void;
  disabled?: boolean;
  className?: string;
};

/**
 * The two-hour window, offered in the three places a delivery can be arranged:
 * the preferences bar on a product page, the cart page, and the slide-out
 * panel. One component rather than three copies, for the same reason
 * `checkoutBlocker` is one function — the windows are a rule, and a rule
 * written out three times is three rules.
 *
 * The closing note is part of the picker rather than something callers add.
 * It is the owners' own line, and it is the answer to the question a picker
 * with three fixed options provokes: a window that does not suit is a reason to
 * ring them, not a closed door. Leaving it to the caller is how two of the
 * three end up without it.
 */
export function DeliverySlotPicker({
  slots,
  value,
  onSelect,
  disabled = false,
  className,
}: DeliverySlotPickerProps) {
  const dict = useDictionary();
  const selectedId = value ? slotId(value) : null;

  return (
    <div className={className}>
      <p className="font-archivo-light px-6 pt-5 text-[15px] leading-normal">
        {dict.delivery.slotIntro}
      </p>

      {/* Only vertical padding: the options carry px-6 of their own, which is
          what lines their text up with the intro above. */}
      <div className="py-2">
        {slots.map((slot) => {
          const id = slotId(slot);

          return (
            <button
              key={id}
              type="button"
              disabled={disabled}
              aria-pressed={id === selectedId}
              onClick={() => onSelect(slot)}
              className={cn(
                "block w-full px-6 py-3 text-left transition-colors hover:bg-sky/30 disabled:opacity-40",
                id === selectedId && "bg-sky/40",
              )}
            >
              <span className="font-archivo-light block text-[15px] leading-normal">
                {formatSlot(slot)}
              </span>
            </button>
          );
        })}
      </div>

      <p className="font-archivo-light border-t border-sky px-6 py-4 text-[14px] leading-normal opacity-70">
        {dict.delivery.slotFull}
      </p>
    </div>
  );
}
