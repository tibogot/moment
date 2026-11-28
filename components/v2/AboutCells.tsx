import { LocaleLink as Link } from "@/components/LocaleLink";
import { CellGrid } from "@/components/v2/CellGrid";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";

/*
 * The À propos page's own sections on the 16 / 12 / 4 grid (28 November
 * 2026), for the parts the home's v2 sections do not already cover: text in
 * quarter columns (the values, what Moment does), the facts, and the closing
 * call. Each is one section with the frame (the rule on top, the two
 * spines) and the text a cell's padding (--v2-pad) in from the lines.
 */

const LABEL = "font-owners-medium text-[12px] uppercase tracking-wide";
const BODY =
  "font-archivo-light text-(length:--body-text) leading-normal text-pretty";

function Frame({
  children,
  theme = "cream",
}: {
  children: React.ReactNode;
  theme?: "cream" | "sky";
}) {
  return (
    <section
      className={`relative w-full ${theme === "sky" ? "bg-sky" : "bg-cream"}`}
    >
      <CellGrid
        lineClassName={theme === "sky" ? "bg-cream" : "bg-sky"}
        subdivide={2}
        cells={false}
        readout={false}
        bands={false}
      />
      <div
        className="relative grid pt-[10svh] pb-[12svh]"
        style={{ gridTemplateColumns: "var(--s-grid-columns)" }}
      >
        {children}
      </div>
    </section>
  );
}

type ColumnsCellsProps = {
  label: string;
  /** Two paragraphs above the columns: one on each half of the grid. */
  lead?: string;
  aside?: string;
  items: { title: string; body: string }[];
};

/**
 * A label, optionally two paragraphs on the two halves, then the items a
 * quarter of the grid each from a desktop up (4 cells of 16), two across on
 * a tablet (6 of 12), stacked on a phone — the FAQ's steps, with titles.
 */
export function ColumnsCells({ label, lead, aside, items }: ColumnsCellsProps) {
  return (
    <Frame>
      <h2 className={`col-[2/-2] px-(--v2-pad) ${LABEL}`}>{label}</h2>
      {(lead || aside) && (
        <div className="col-[2/-2] mt-[4svh] grid gap-y-[3svh] md:grid-cols-12 lg:grid-cols-16">
          {lead && (
            <p
              className={`min-w-0 px-(--v2-pad) md:col-[1/span_6] lg:col-[1/span_7] ${BODY}`}
            >
              {lead}
            </p>
          )}
          {aside && (
            <p
              className={`min-w-0 px-(--v2-pad) md:col-[7/span_6] lg:col-[9/span_7] ${BODY}`}
            >
              {aside}
            </p>
          )}
        </div>
      )}
      <ul className="col-[2/-2] mt-[7svh] grid gap-y-[6svh] md:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <li key={item.title} className="min-w-0 px-(--v2-pad)">
            <h3 className="font-owners-narrow-bold max-w-[16ch] text-[8vw] leading-[0.95] tracking-[-0.005em] wrap-break-word uppercase md:text-[min(2.6vw,4svh)]">
              {item.title}
            </h3>
            <p className={`mt-4 ${BODY}`}>{item.body}</p>
          </li>
        ))}
      </ul>
    </Frame>
  );
}

/** The order the facts appear in; the words are in the dictionaries. */
const FACT_KEYS = [
  "based",
  "cookFor",
  "services",
  "deliveryArea",
  "leadTime",
  "diets",
  "languages",
] as const;

/**
 * The practical answers: the label and headline on the left half, the facts
 * as a ruled list on the right half. Plain text, readable to a search engine
 * as well as to somebody deciding whether to send an enquiry.
 */
export function FactsCells({ copy }: { copy: Dictionary["about"]["facts"] }) {
  return (
    <Frame>
      <div className="col-[2/span_4] min-w-0 px-(--v2-pad) md:col-[2/span_12] lg:col-[2/span_7]">
        <h2 className={LABEL}>{copy.label}</h2>
        <p className="font-owners-narrow-bold mt-[3svh] max-w-full text-[8vw] leading-[0.95] tracking-[-0.005em] wrap-break-word uppercase md:text-[min(4.4vw,7svh)]">
          {copy.headline}
        </p>
      </div>
      <dl className="col-[2/span_4] mt-[6svh] min-w-0 px-(--v2-pad) md:col-[2/span_12] lg:col-[10/span_8] lg:mt-0">
        {FACT_KEYS.map((key) => (
          <div
            key={key}
            className="grid gap-y-1 border-t border-sky py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-x-6"
          >
            <dt className={LABEL}>{copy.terms[key]}</dt>
            <dd className="font-archivo-light text-[17px] leading-snug">
              {copy.values[key]}
            </dd>
          </div>
        ))}
      </dl>
    </Frame>
  );
}

const CTA_LINKS = [
  { key: "events", href: routes.events },
  { key: "delivery", href: routes.shop },
  { key: "contact", href: routes.contact },
] as const;

/**
 * The sky band closing the page, on the grid: cream rules on sky, the
 * headline over the left half and a half more, the body and the three ways
 * in under it. The footer after it is cream and carries its own large type,
 * so this one inverts rather than stacking a second cream headline.
 */
export function CtaCells({ copy }: { copy: Dictionary["about"]["cta"] }) {
  return (
    <Frame theme="sky">
      <div className="col-[2/span_4] min-w-0 px-(--v2-pad) md:col-[2/span_10] lg:col-[2/span_11]">
        <h2 className="font-owners-narrow-bold max-w-full text-[9vw] leading-[0.95] tracking-[-0.005em] wrap-break-word uppercase md:text-[min(5.4vw,8svh)]">
          {copy.headline}
        </h2>
        <p className={`mt-[4svh] max-w-[42ch] ${BODY}`}>{copy.body}</p>
        <div className="mt-[4svh] flex flex-wrap gap-3">
          {CTA_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group inline-block border border-cream bg-cream px-3 py-2.5 transition-colors duration-500 hover:bg-sky"
            >
              <span className="font-owners-medium inline-flex items-center gap-2 text-[11px] uppercase tracking-wide">
                {copy.links[link.key]}
                <span
                  className="transition-transform duration-500 group-hover:translate-x-1.5"
                  aria-hidden
                >
                  &rarr;
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </Frame>
  );
}
