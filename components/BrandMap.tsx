"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import "./brand-map.css";
import { useEffect, useRef } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import type { MapPoint } from "@/components/PartnerMap";
import { brandStyle, MAP_COLORS } from "@/lib/map/brandStyle";

/**
 * A point, plus what only the atelier has: a line about collection and a
 * link to order (26 November 2026).
 */
export type BrandMapPoint = MapPoint & {
  note?: string;
  cta?: { href: string; label: string };
};

type BrandMapProps = {
  points: BrandMapPoint[];
  /** Geoapify's vector style URL, key included. */
  styleUrl: string;
  labels: {
    directions: string;
    website: string;
    mapLabel: string;
    zoomIn: string;
    zoomOut: string;
    closePopup: string;
    attribution: string;
    /** The legend above the map: what the two kinds of marker mean. */
    legendAtelier: string;
    legendPartners: string;
  };
};

/** Brussels, for an empty map. */
const DEFAULT_CENTER: [number, number] = [4.3528, 50.8466];

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );
}

function directionsUrl(point: MapPoint) {
  return `https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}`;
}

/**
 * Test (v2): the partners on a vector map drawn in the site's own colours —
 * cream ground, white streets, sky-blue water, black labels — instead of
 * Leaflet over raster tiles, whose look cannot be changed.
 *
 * Same behaviour as `PartnerMap`: no wheel zoom and `data-lenis-prevent`, so
 * the smooth-scrolling page never gets trapped; no one-finger pan on phones;
 * the list under the map carries everything for screen readers and search.
 *
 * MapLibre parses tiles in a Web Worker it loads from a URL next to its own
 * module, which a bundle does not have. `new URL(…, import.meta.url)` makes
 * the bundler emit the worker file and hand back its address.
 */
export function BrandMap({ points, styleUrl, labels }: BrandMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let map: MapLibreMap | null = null;
    let cancelled = false;

    (async () => {
      const [maplibre, response] = await Promise.all([
        import("maplibre-gl"),
        fetch(styleUrl),
      ]);
      if (cancelled || !response.ok) return;

      maplibre.setWorkerUrl(
        new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url)
          .href,
      );

      const isMobile = window.matchMedia("(pointer: coarse)").matches;
      map = new maplibre.Map({
        container,
        style: brandStyle(await response.json()),
        center: DEFAULT_CENTER,
        zoom: 12,
        scrollZoom: false,
        dragPan: !isMobile,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        attributionControl: { compact: true },
        locale: {
          "Map.Title": labels.mapLabel,
          "NavigationControl.ZoomIn": labels.zoomIn,
          "NavigationControl.ZoomOut": labels.zoomOut,
          "Popup.Close": labels.closePopup,
          "AttributionControl.ToggleAttribution": labels.attribution,
        },
      });
      map.touchZoomRotate.disableRotation();
      map.addControl(
        new maplibre.NavigationControl({ showCompass: false }),
        "top-right",
      );

      const bounds = new maplibre.LngLatBounds();
      for (const point of points) {
        const element = document.createElement("button");
        element.type = "button";
        element.className = `brand-marker${point.primary ? " brand-marker--primary" : ""}`;
        element.setAttribute("aria-label", point.name);
        // The atelier: the site's mark — the favicon's ( m ) on sky — with
        // its name always beside it, so the map reads without a click.
        if (point.primary) {
          element.innerHTML = `<img src="/brand/map-marker.png" alt="" class="brand-marker__mark" /><span class="brand-marker__label" aria-hidden="true"><strong>${escapeHtml(point.name)}</strong><span>${escapeHtml(point.kindLabel)}</span></span>`;
        }

        const links = [
          `<a href="${directionsUrl(point)}" target="_blank" rel="noopener noreferrer">${escapeHtml(labels.directions)}</a>`,
          point.url
            ? `<a href="${escapeHtml(point.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(labels.website)}</a>`
            : "",
        ]
          .filter(Boolean)
          .join(" · ");
        const note = point.note
          ? `<p class="brand-popup__note">${escapeHtml(point.note)}</p>`
          : "";
        const cta = point.cta
          ? `<p class="brand-popup__cta"><a href="${escapeHtml(point.cta.href)}">${escapeHtml(point.cta.label)} →</a></p>`
          : "";

        const popup = new maplibre.Popup({
          offset: 14,
          maxWidth: "260px",
          className: "brand-popup",
        }).setHTML(
          `<p class="brand-popup__kind">${escapeHtml(point.kindLabel)}</p>
           <p class="brand-popup__name">${escapeHtml(point.name)}</p>
           <p>${escapeHtml(point.address)}</p>
           ${note}
           <p class="brand-popup__links">${links}</p>
           ${cta}`,
        );

        new maplibre.Marker({ element })
          .setLngLat([point.longitude, point.latitude])
          .setPopup(popup)
          .addTo(map);
        bounds.extend([point.longitude, point.latitude]);
      }

      // Frame every point; one point alone gets a street-level zoom. Room
      // all round, and more on the right for the atelier's label, so no
      // marker sits on an edge (26 November 2026). Smaller on a phone.
      if (points.length > 1) {
        const narrow = container.clientWidth < 640;
        map.fitBounds(bounds, {
          padding: narrow
            ? { top: 60, bottom: 60, left: 40, right: 160 }
            : { top: 90, bottom: 90, left: 90, right: 240 },
          maxZoom: 15,
          duration: 0,
        });
      } else if (points.length === 1) {
        map.jumpTo({ center: bounds.getCenter(), zoom: 14 });
      }
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [points, styleUrl, labels]);

  const hasPartners = points.some((point) => !point.primary);

  return (
    <div>
      {/* What the markers mean, before anyone has to click one. */}
      <ul className="font-archivo-light mb-3 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
        <li className="flex items-center gap-2">
          <span aria-hidden className="brand-legend brand-legend--atelier">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/map-marker.png" alt="" />
          </span>
          {labels.legendAtelier}
        </li>
        {hasPartners && (
          <li className="flex items-center gap-2">
            <span aria-hidden className="brand-legend brand-legend--partner" />
            {labels.legendPartners}
          </li>
        )}
      </ul>
      <div
        ref={containerRef}
        data-lenis-prevent
        aria-label={labels.mapLabel}
        className="brand-map h-[60svh] min-h-80 w-full border border-black"
        // The ground colour before the tiles arrive, so there is no flash.
        style={{ backgroundColor: MAP_COLORS.ground }}
      />
    </div>
  );
}
