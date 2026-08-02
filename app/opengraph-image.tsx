import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { OG_IMAGE_ALT, OG_IMAGE_SIZE } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const alt = OG_IMAGE_ALT;
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

const CREAM = "#f8f7f2";
const SKY = "#a7c5ee";
const BLACK = "#000000";

/**
 * The share card for every route that doesn't set its own image — product,
 * collection and article pages pass their own photography instead.
 *
 * Satori only supports flexbox, so the ruled grid is drawn as absolutely
 * positioned hairlines rather than the CSS grid the site itself uses.
 */
async function font(file: string) {
  return readFile(join(process.cwd(), "app", "fonts", file));
}

export default async function Image() {
  const [ownersNarrowBold, archivoLight] = await Promise.all([
    font("Owners_Narrow_Bold.otf"),
    font("Archivo_Condensed-Light.ttf"),
  ]);

  // Matches the site's column count at desktop: margins either side of seven
  // columns, so the lines land where they do on the real page.
  const columns = [12.5, 25, 37.5, 50, 62.5, 75, 87.5];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: CREAM,
          color: BLACK,
          padding: "56px 64px",
          position: "relative",
        }}
      >
        {columns.map((left) => (
          <div
            key={left}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${left}%`,
              width: 1,
              background: SKY,
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "22%",
            height: 1,
            background: SKY,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: "18%",
            height: 1,
            background: SKY,
          }}
        />

        <div
          style={{
            display: "flex",
            fontFamily: "Archivo",
            fontSize: 22,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          Brussels
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontFamily: "Owners",
              fontSize: 210,
              lineHeight: 0.82,
              letterSpacing: "-0.02em",
            }}
          >
            {siteConfig.name}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Archivo",
              fontSize: 34,
              lineHeight: 1.3,
              maxWidth: 780,
            }}
          >
            {/* One string, not wrapped JSX text — satori keeps the literal
                whitespace between children rather than collapsing it. Avoid a
                comma straight after a word: Archivo Condensed gives the glyph
                a wide advance, which reads as a double space at this size. */}
            {"Traiteur and event catering — cooked each morning and delivered across the city."}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontFamily: "Archivo",
            fontSize: 22,
            letterSpacing: "0.06em",
          }}
        >
          {siteConfig.url.replace(/^https?:\/\//, "")}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Owners", data: ownersNarrowBold, style: "normal", weight: 700 },
        { name: "Archivo", data: archivoLight, style: "normal", weight: 400 },
      ],
    },
  );
}
