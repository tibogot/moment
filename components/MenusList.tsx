import Link from "next/link";
import TextReveal from "@/components/TextReveal";
import { REVEAL_BLOCK } from "@/lib/colors";
import { routes } from "@/lib/routes";
import {
  MENU_FORMAT_LABELS,
  formatMenuPrice,
  formatMenuTerms,
  type Menu,
} from "@/lib/menus";

type MenusListProps = {
  menus: Menu[];
};

/**
 * The menus index — one ruled row per format, in the same construction as the
 * services rows on the home page: the row's own top border is the rule, so no
 * two neighbours ever draw a double line.
 *
 * The price sits in the right-hand columns rather than under the title. It is
 * the thing the page exists to answer, and putting it on the same baseline as
 * the headline means a visitor can read the whole ladder of formats in one
 * vertical scan without opening any of them.
 */
export function MenusList({ menus }: MenusListProps) {
  return (
    <div className="col-start-2 col-end-5 min-w-0 md:col-end-9">
      <div className="border-b border-sky">
        {menus.map((menu, index) => (
          <Link
            key={menu._id}
            href={routes.menu(menu.slug.current)}
            className="group block border-t border-sky"
          >
            <div className="px-(--grid-gutter) py-[5svh] md:grid md:grid-cols-7 md:gap-(--grid-gutter)">
              {/* Type — four of the seven columns, matching the split the
                  contact form uses for its aside and its fields. */}
              <div className="min-w-0 text-left md:col-span-4">
                <div className="flex items-baseline gap-5">
                  <span className="font-archivo-light shrink-0 text-[12px] tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-owners-medium text-[11px] uppercase tracking-wide text-black/55">
                    {MENU_FORMAT_LABELS[menu.format] ?? menu.format}
                  </span>
                </div>

                <TextReveal blockColor={REVEAL_BLOCK} stagger={0.1}>
                  <h2 className="font-owners-narrow-bold mt-5 max-w-full text-[11vw] leading-[0.92] wrap-break-word uppercase md:text-[min(4vw,6svh)]">
                    {menu.title}
                  </h2>
                </TextReveal>

                {menu.summary && (
                  <p className="font-archivo-light mt-5 max-w-[42ch] text-[18px] leading-normal">
                    {menu.summary}
                  </p>
                )}
              </div>

              {/* Price and terms. md:text-right so the euro figures line up as
                  a column the eye can compare down. */}
              <div className="mt-8 min-w-0 md:col-span-3 md:mt-0 md:text-right">
                <p className="font-owners-narrow-bold text-[7vw] leading-none md:text-[min(2.6vw,4svh)]">
                  {formatMenuPrice(menu.pricePerPerson)}
                  <span className="font-archivo-light ml-2 text-[16px] leading-none">
                    per person
                  </span>
                </p>

                {menu.priceNote && (
                  <p className="font-archivo-light mt-3 text-[13px] text-black/55">
                    {menu.priceNote}
                  </p>
                )}

                <p className="font-archivo-light mt-4 text-[13px]">
                  {formatMenuTerms(menu)}
                </p>

                <span className="mt-6 inline-block border border-sky bg-sky px-3 py-2.5 transition-colors duration-500 group-hover:bg-cream">
                  <span className="font-owners-medium inline-flex items-center gap-2 text-[11px] uppercase tracking-wide">
                    See the menu
                    <span
                      className="transition-transform duration-500 group-hover:translate-x-1.5"
                      aria-hidden
                    >
                      &rarr;
                    </span>
                  </span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
