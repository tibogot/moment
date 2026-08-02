import { cn } from "@/lib/utils";

type DraftNoticeProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Marks copy on the page as stand-in rather than final — the same admission the
 * legal pages make in their lead, given somewhere it cannot be mistaken for
 * part of the design.
 *
 * It is deliberately plain and deliberately loud. Placeholder prices that read
 * as real ones are the failure mode worth spending a band of the page on.
 */
export function DraftNotice({ children, className }: DraftNoticeProps) {
  return (
    <div
      role="note"
      className={cn(
        "border border-sky bg-sky/30 px-(--grid-gutter) py-5",
        className,
      )}
    >
      <p className="font-owners-medium text-[11px] uppercase tracking-wide">
        Placeholder content
      </p>
      <p className="font-archivo-light mt-2.5 max-w-[60ch] text-[18px] leading-normal">
        {children}
      </p>
    </div>
  );
}
