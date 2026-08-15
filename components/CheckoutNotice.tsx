import { cn } from "@/lib/utils";

type CheckoutNoticeProps = {
  /**
   * `blocker` — the customer has not finished. An address is missing, a day is
   * unpicked, the basket is under a zone's minimum. Nobody has done anything
   * wrong, so this is an instruction, not a telling-off.
   *
   * `error` — something failed. The mutation was refused, the network went, the
   * address lookup came back empty.
   */
  tone: "blocker" | "error";
  title: string;
  children: React.ReactNode;
  /** A control that clears the notice where it is raised. */
  action?: React.ReactNode;
  className?: string;
};

/**
 * The one shape for anything standing between a basket and a checkout.
 *
 * There were twelve `role="alert"` elements in this flow and eleven of them
 * rendered as `font-archivo-light text-[14px]` — the same font, size and colour
 * as the "taxes calculated at checkout" note sitting beside them. The message
 * that says why the button is dead looked exactly like ambient small print.
 *
 * The fix is rank, not colour. Red would be the obvious answer and the wrong
 * one twice over: this palette is three colours and a fourth for one message is
 * a bigger decision than the problem deserves, and — more to the point — a
 * missing address is not an error. The customer has not made a mistake, they
 * have not finished. Red tells someone off for a step nobody offered them.
 *
 * So two ranks out of the palette that already exists. `border-sky` is the
 * house "this needs you" block, borrowed from the quote panel in
 * OrderPreferencesBar, which was the one of the twelve that got it right.
 * `border-black` is heavier without being a new colour, and is kept for things
 * that actually went wrong.
 */
export function CheckoutNotice({
  tone,
  title,
  children,
  action,
  className,
}: CheckoutNoticeProps) {
  return (
    <div
      role="alert"
      className={cn(
        "border p-4",
        tone === "error" ? "border-black" : "border-sky",
        className,
      )}
    >
      <p className="font-owners-medium text-[12px] uppercase tracking-wide">
        {title}
      </p>
      <p className="font-archivo-light mt-2 text-[15px] leading-normal">
        {children}
      </p>
      {action}
    </div>
  );
}

/**
 * The notice's own button, styled like the site's primary action so the remedy
 * reads as the next thing to do rather than as more prose.
 */
export function CheckoutNoticeAction({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group mt-4 inline-block border border-sky bg-sky px-3 py-2.5 transition-colors duration-500 hover:bg-cream"
    >
      <span className="font-owners-medium inline-flex items-center gap-2 text-[11px] uppercase tracking-wide">
        {children}
        <span
          className="transition-transform duration-500 group-hover:translate-x-1.5"
          aria-hidden
        >
          &rarr;
        </span>
      </span>
    </button>
  );
}
