"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";

export type MapPoint = {
  id: string;
  name: string;
  /** Already translated: "Café", "Épicerie"… */
  kindLabel: string;
  address: string;
  latitude: number;
  longitude: number;
  url: string | null;
  /** The atelier is drawn differently from the partners. */
  primary?: boolean;
};

type PartnerMapProps = {
  points: MapPoint[];
  tiles: { url: string; attribution: string };
  labels: { directions: string; website: string; mapLabel: string };
};

/** Brussels, for an empty map. */
const DEFAULT_CENTER: [number, number] = [50.8466, 4.3528];

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
 * The partners on a map.
 *
 * Leaflet is imported inside the effect, not at the top: it touches `window`
 * the moment it loads, and this component is still rendered on the server
 * first. Markers are plain styled circles (`divIcon`) rather than Leaflet's
 * default pin images, which break under bundlers and do not match the design.
 *
 * Scroll-wheel zoom is off and the container carries `data-lenis-prevent`: on
 * a page that scrolls smoothly, a map that grabs the wheel traps the visitor
 * halfway down. Zoom is the +/− buttons, a pinch, or a double click.
 *
 * The list under the map, rendered by the page, carries the same information
 * in plain HTML — for screen readers, for search engines, and for anyone whose
 * tiles do not load.
 */
export function PartnerMap({ points, tiles, labels }: PartnerMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let map: LeafletMap | null = null;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled) return;

      map = L.map(container, {
        scrollWheelZoom: false,
        // On a phone, a one-finger swipe over a 60svh map would pan the map
        // instead of the page and trap the visitor halfway down. Pinch zoom,
        // the +/- buttons and the markers still work.
        dragging: !L.Browser.mobile,
        zoomControl: true,
        attributionControl: true,
      }).setView(DEFAULT_CENTER, 12);

      L.tileLayer(tiles.url, {
        attribution: tiles.attribution,
        maxZoom: 19,
      }).addTo(map);

      const markers = points.map((point) => {
        const icon = L.divIcon({
          className: "",
          html: `<span class="partner-marker${point.primary ? " partner-marker--primary" : ""}"></span>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
          popupAnchor: [0, -10],
        });

        const links = [
          `<a href="${directionsUrl(point)}" target="_blank" rel="noopener noreferrer">${escapeHtml(labels.directions)}</a>`,
          point.url
            ? `<a href="${escapeHtml(point.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(labels.website)}</a>`
            : "",
        ]
          .filter(Boolean)
          .join(" · ");

        return L.marker([point.latitude, point.longitude], {
          icon,
          title: point.name,
          alt: point.name,
          keyboard: true,
        })
          .bindPopup(
            `<p class="partner-popup__kind">${escapeHtml(point.kindLabel)}</p>
             <p class="partner-popup__name">${escapeHtml(point.name)}</p>
             <p>${escapeHtml(point.address)}</p>
             <p class="partner-popup__links">${links}</p>`,
          )
          .addTo(map!);
      });

      // Frame every point; one point alone gets a street-level zoom rather
      // than the maximum, which shows a single building and no context.
      if (markers.length > 1) {
        map.fitBounds(L.featureGroup(markers).getBounds(), {
          padding: [40, 40],
          maxZoom: 15,
        });
      } else if (markers.length === 1) {
        map.setView(markers[0].getLatLng(), 14);
      }
    });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [points, tiles, labels]);

  return (
    <div
      ref={containerRef}
      data-lenis-prevent
      role="region"
      aria-label={labels.mapLabel}
      className="partner-map h-[60svh] min-h-80 w-full border border-sky"
    />
  );
}
