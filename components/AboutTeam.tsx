import Image from "next/image";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { GridSection } from "@/components/GridSection";

/**
 * Placeholder people and portraits — swap the picsum seeds for the real
 * headshots before launch. The seed keeps each card on the same image between
 * builds rather than reshuffling on every request.
 *
 * Names stay here; roles are keys into the dictionary. A name is the same in
 * every language and a job title is not.
 */
const team = [
  { name: "Camille Verhoeven", role: "founder", seed: "camille" },
  { name: "Youssef Benali", role: "sousChef", seed: "youssef" },
  { name: "Lotte Van Damme", role: "pastry", seed: "lotte" },
  { name: "Marek Nowak", role: "sourcing", seed: "marek" },
  { name: "Inès Dubois", role: "events", seed: "ines" },
  { name: "Tom Peeters", role: "deliveries", seed: "tom" },
] as const;

/**
 * The kitchen, on the same ruled cards as the shop. The card metrics come from
 * the registered `--card-*` properties, so these sit on exactly the type and
 * padding scale the product grid rests at — see globals.css.
 */
export function AboutTeam({ copy }: { copy: Dictionary["about"]["team"] }) {
  return (
    <GridSection className="pt-[12svh] pb-[14svh]">
      <div className="col-start-2 col-end-5 px-(--grid-gutter) pb-[5svh] md:col-end-9">
        <h2 className="font-owners-medium text-[12px] uppercase tracking-wide">
          {copy.label}
        </h2>
      </div>

      <div className="col-start-2 col-end-5 md:col-end-9">
        <ul className="grid grid-cols-2 border-t border-r border-sky md:grid-cols-3">
          {team.map((member) => (
            <li
              key={member.name}
              className="product-card border-b border-l border-sky transition-colors duration-500"
            >
              <div className="h-full py-(--card-pad)">
                <div className="px-(--card-gutter)">
                  <div className="product-card__image relative aspect-4/5 w-full overflow-hidden">
                    <Image
                      src={`https://picsum.photos/seed/${member.seed}/800/1000`}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Stacked rather than the product card's price row: a job
                    title is a phrase, not a number, and set beside the name it
                    wrapped into two ragged columns at every width. */}
                <div className="mt-3 px-(--card-gutter)">
                  <h3 className="font-owners-medium text-(length:--card-type) uppercase tracking-wide">
                    {member.name}
                  </h3>
                  <p className="font-archivo-light mt-1 text-[15px] leading-snug md:text-[16px]">
                    {copy.roles[member.role]}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </GridSection>
  );
}
