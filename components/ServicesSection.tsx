import Link from "next/link";
import { GridSection } from "@/components/GridSection";
import { routes } from "@/lib/routes";

const services = [
  {
    index: "01",
    title: "Delivery",
    href: routes.shop,
    body: "Plates, salads and juices prepared each morning and delivered ready to serve — to a desk, a boardroom or a kitchen table.",
  },
  {
    index: "02",
    title: "Events",
    href: routes.events,
    body: "From a twenty-person launch to a seated dinner. We handle the menu, the service and everything that has to happen before the doors open.",
  },
  {
    index: "03",
    title: "Coffee",
    href: routes.coffee,
    body: "A coffee desk for anyone passing by, and the same pastries and juices we send out to our clients.",
  },
] as const;

export function ServicesSection() {
  return (
    <GridSection className="pb-[14svh]">
      <ul className="col-start-2 col-end-5 px-(--grid-gutter) md:col-end-9">
        {services.map(({ index, title, href, body }) => (
          <li key={index} className="border-t border-sky">
            <Link
              href={href}
              className="group grid grid-cols-1 gap-3 py-[5svh] transition-opacity hover:opacity-60 md:grid-cols-12 md:gap-6"
            >
              <span className="font-archivo-light text-[12px] text-black md:col-span-1">
                {index}
              </span>

              <h3 className="font-owners-narrow-bold text-[8vw] leading-[0.95] wrap-break-word text-black uppercase md:col-span-6 md:text-[min(4vw,6svh)]">
                {title}
              </h3>

              <p className="font-archivo-light max-w-prose text-[14px] leading-[1.5] text-black md:col-span-5 md:text-[min(1.15vw,1.7svh)]">
                {body}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </GridSection>
  );
}
