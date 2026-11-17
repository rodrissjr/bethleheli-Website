"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
import type { CmsTripRouteStop } from "@/sanity/content-types";
import { routeLineCoordinates } from "@/lib/trip-route-map";

function escapeMarkerLabel(value: string) {
  return value.replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] || character);
}

function markerIcon(stop: CmsTripRouteStop, active: boolean) {
  return L.divIcon({
    className: `trip-route-marker${active ? " active" : ""}`,
    html: `<span aria-hidden="true">${escapeMarkerLabel(stop.markerLabel)}</span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

export function TripRouteMapLeaflet({
  label,
  stops,
  activeKey,
  onSelect,
}: {
  label: string;
  stops: CmsTripRouteStop[];
  activeKey: string;
  onSelect: (key: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef(new Map<string, L.Marker>());
  const onSelectRef = useRef(onSelect);
  const reducedMotionRef = useRef(false);

  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

  useEffect(() => {
    if (!containerRef.current || !stops.length) return;
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animate = !reducedMotionRef.current;
    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true,
      keyboard: true,
      scrollWheelZoom: true,
      dragging: true,
      touchZoom: true,
      fadeAnimation: animate,
      zoomAnimation: animate,
      markerZoomAnimation: animate,
    });
    mapRef.current = map;
    const markers = new Map<string, L.Marker>();
    markersRef.current = markers;
    L.control.zoom({ position: "topleft" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(map);

    const line = routeLineCoordinates(stops);
    if (line.length) {
      L.polyline(line, { color: "#ea4729", weight: 3, opacity: 1, dashArray: "8 8" }).addTo(map);
    }

    for (const stop of stops) {
      const marker = L.marker([stop.lat, stop.lng], {
        icon: markerIcon(stop, stop.key === activeKey),
        keyboard: true,
        title: `${stop.markerLabel}. ${stop.name}${stop.dayLabel ? `, ${stop.dayLabel}` : ""}`,
        alt: `Select ${stop.name}`,
        riseOnHover: true,
      }).addTo(map);
      marker.on("click", () => onSelectRef.current(stop.key));
      markers.set(stop.key, marker);
    }

    if (stops.length === 1) {
      map.setView([stops[0].lat, stops[0].lng], 9, { animate: false });
    } else {
      map.fitBounds(L.latLngBounds(stops.map(stop => [stop.lat, stop.lng])), {
        padding: [34, 34],
        animate: false,
        maxZoom: 9,
      });
    }

    requestAnimationFrame(() => map.invalidateSize({ animate: false }));
    return () => {
      markers.clear();
      map.remove();
      mapRef.current = null;
    };
    // The map is intentionally initialized only when the configured route changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [label, stops]);

  useEffect(() => {
    for (const stop of stops) {
      markersRef.current.get(stop.key)?.setIcon(markerIcon(stop, stop.key === activeKey));
    }
    const active = stops.find(stop => stop.key === activeKey);
    if (active && mapRef.current) {
      mapRef.current.panTo([active.lat, active.lng], { animate: !reducedMotionRef.current, duration: 0.35 });
    }
  }, [activeKey, stops]);

  return <div className="trip-route-map-canvas" ref={containerRef} role="region" aria-label={label} />;
}
