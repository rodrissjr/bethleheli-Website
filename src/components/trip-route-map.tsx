"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import type { CmsTripRouteMap, CmsTripRouteStop } from "@/sanity/content-types";

const InteractiveMap = dynamic(
  () => import("@/components/trip-route-map-leaflet").then(module => module.TripRouteMapLeaflet),
  {
    ssr: false,
    loading: () => <div className="trip-route-map-loading" role="status"><span>Loading interactive map…</span></div>,
  },
);

function destinationLink(stop: CmsTripRouteStop) {
  if (!stop.href) return null;
  const external = stop.href.startsWith("https://");
  return <a href={stop.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>Explore this destination ↗</a>;
}

export function TripRouteMap({ route }: { route: CmsTripRouteMap }) {
  const [activeKey, setActiveKey] = useState(route.stops[0]?.key || "");

  const activeStop = route.stops.find(stop => stop.key === activeKey) || route.stops[0];

  if (!route.stops.length) {
    return <div className="trip-route-card trip-route-card-fallback">
      {route.fallbackImage ? (
        <Image
          src={route.fallbackImage.src}
          alt={route.fallbackImage.alt || route.label}
          width={840}
          height={600}
          sizes="(max-width: 900px) 100vw, 420px"
        />
      ) : <p role="status">Route map details are being prepared.</p>}
    </div>;
  }

  return <section className="trip-route-card" aria-label={route.label}>
    <InteractiveMap
      label={route.label}
      stops={route.stops}
      activeKey={activeStop.key}
      onSelect={setActiveKey}
    />
    <div className="trip-route-details">
      <h3>Your Route</h3>
      <ol aria-label="Trip route stops">
        {route.stops.map((stop, index) => <li key={stop.key} className={stop.key === activeStop.key ? "active" : ""}>
          <button
            type="button"
            aria-label={`${stop.markerLabel || String(index + 1).padStart(2, "0")} ${stop.name}${stop.dayLabel ? ` ${stop.dayLabel}` : ""}`}
            aria-current={stop.key === activeStop.key ? "location" : undefined}
            aria-pressed={stop.key === activeStop.key}
            onClick={() => setActiveKey(stop.key)}
          >
            <span>{stop.markerLabel || String(index + 1).padStart(2, "0")}</span>
            <strong>{stop.name}</strong>
            <small>{stop.dayLabel}</small>
          </button>
        </li>)}
      </ol>
      <div className="trip-route-selection" aria-live="polite" aria-atomic="true">
        <strong>{activeStop.name}</strong>
        {activeStop.description ? <p>{activeStop.description}</p> : null}
        {destinationLink(activeStop)}
      </div>
    </div>
    <span className="sr-only" aria-live="polite">Selected route stop: {activeStop.name}</span>
  </section>;
}
