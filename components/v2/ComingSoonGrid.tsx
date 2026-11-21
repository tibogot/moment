"use client";

import Image from "next/image";
import { useEffect } from "react";
import { CellGrid } from "@/components/v2/CellGrid";

/**
 * Design preview of the holding page ("Bientôt en ligne") on the v2 grid.
 *
 * The real page is a separate static site — `moment-coming-soon/index.html`
 * next to this project, with its own `/api/notify` on Vercel — and its copy
 * lives there. This is only a mock-up of what it would look like rebuilt on
 * the v2 grid, so the copy is written here rather than going through this
 * site's dictionaries. The form does nothing here.
 *
 * English throughout (21 November 2026): one page for every visitor, and the
 * client wrote the headline and the sign-up in English — the neutral language
 * between French and Dutch in Brussels. Only the eyebrow stays in all three
 * languages, as a nod to them.
 *
 * Full screen, the hero's grid (12 columns on desktop, 9 on tablet, 4 on a
 * phone), cells drawn. The words sit bottom-left in a cleared block, like
 * the site's titles; the bands carry the masthead and the contact line.
 */

const SMALL = "font-owners-medium text-[11px] uppercase tracking-wide";

export function ComingSoonGrid() {
  // The preview is a layer over the site, which keeps a scrollbar gutter
  // (globals.css, scrollbar-gutter: stable) that a fixed layer cannot cover —
  // the site's scrollbar showed down the right. While this page is up, the
  // page underneath neither scrolls nor reserves the gutter; both come back
  // on leaving. The real holding page is a page of its own and needs none of
  // this.
  useEffect(() => {
    const root = document.documentElement;
    const previous = {
      overflow: root.style.overflow,
      gutter: root.style.scrollbarGutter,
    };
    root.style.overflow = "hidden";
    root.style.scrollbarGutter = "auto";
    return () => {
      root.style.overflow = previous.overflow;
      root.style.scrollbarGutter = previous.gutter;
    };
  }, []);

  return (
    // Over the site's navbar (z-40): the holding page has none.
    <div
      lang="en"
      className="v2 fixed inset-0 z-50 overflow-y-auto bg-cream text-black [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <section className="relative flex min-h-svh flex-col">
        <CellGrid lineClassName="bg-sky" readout={false} subdivide={1.5} />

        {/* Masthead, in the top band. */}
        <header
          className={`relative flex h-(--grid-band) shrink-0 items-center justify-between ${SMALL}`}
          style={{ paddingInline: "var(--grid-inset)" }}
        >
          <span className="flex-1">Catering</span>
          <Image
            src="/brand/Moment-Logotype.svg"
            alt="Moment"
            width={1437}
            height={220}
            priority
            className="h-auto w-[clamp(96px,9vw,132px)] brightness-0"
          />
          <span className="flex-1 text-right">Brussels</span>
        </header>

        {/* The field: the words bottom-left, in a cleared block. */}
        <div
          className="relative flex flex-1 flex-col justify-end"
          style={{ paddingInline: "var(--grid-margin)" }}
        >
          <div
            data-grid-hole
            className="w-full px-(--grid-gutter) pt-(--grid-gutter) pb-[4svh] md:w-[calc((100cqw-2*var(--grid-margin))*8/12)]"
          >
            {/* The one trilingual line. */}
            <p className={SMALL}>
              <span lang="fr">Bientôt en ligne</span> ·{" "}
              <span lang="nl">Binnenkort online</span> · Coming soon
            </p>
            <h1 className="font-owners-narrow-bold mt-[2.5svh] text-[15vw] leading-[0.88] tracking-[-0.005em] uppercase md:text-[min(6.6vw,12svh)] md:whitespace-nowrap">
              Good things
              <br />
              take a moment.
            </h1>
            <p className="font-archivo-light mt-[3svh] max-w-[40ch] text-[18px] leading-normal">
              Our new website is coming very soon. In the meantime, find us on
              Instagram or write to us.
            </p>

            {/* The sign-up, drawn like the site's inputs and its sky button.
                Inert in this preview. */}
            <form
              className="mt-[3.5svh] max-w-120"
              onSubmit={(event) => event.preventDefault()}
            >
              <label
                htmlFor="cs-email"
                className="font-archivo-light block text-[18px] leading-snug"
              >
                Leave your email and be the first to know.
              </label>
              <div className="mt-3 flex border border-sky bg-cream focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-black">
                <input
                  id="cs-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="font-archivo-light min-w-0 flex-1 bg-transparent px-3.5 py-3 text-[16px] outline-none placeholder:text-black/50"
                />
                <button
                  type="submit"
                  className={`border-l border-sky bg-sky px-4.5 transition-colors duration-500 hover:bg-cream ${SMALL}`}
                >
                  Notify me
                </button>
              </div>
              <p className="font-archivo-light mt-2.5 text-[13px] text-black/60">
                We&apos;ll only use it to tell you when the new site opens.
              </p>
            </form>
          </div>
        </div>

        {/* Contact line, in the bottom band (it wraps on a phone). */}
        <footer
          className="font-archivo-light relative flex min-h-(--grid-band) shrink-0 flex-wrap items-center gap-x-6 gap-y-2.5 py-3 text-[14px]"
          style={{ paddingInline: "var(--grid-inset)" }}
        >
          <span className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/moment.brussels/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:opacity-60"
            >
              <Image src="/brand/instagram.svg" alt="" width={18} height={18} />
            </a>
            <a
              href="https://www.facebook.com/moment.brussels/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="hover:opacity-60"
            >
              <Image src="/brand/facebook.svg" alt="" width={18} height={18} />
            </a>
          </span>
          <a href="tel:+32472355153" className="hover:opacity-60">
            +32 472 35 51 53
          </a>
          <a href="mailto:info@moment-lab.be" className="hover:opacity-60">
            info@moment-lab.be
          </a>
          <span className="md:ml-auto">Rue des Glands 21A, 1190 Forest</span>
        </footer>
      </section>
    </div>
  );
}
