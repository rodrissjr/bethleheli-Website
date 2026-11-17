import type { CmsImage, CmsTripRouteMap, CmsTripRouteStop } from "@/sanity/content-types";

export type RawTripRouteStop = {
  _key?: string | null;
  displayName?: string | null;
  dayLabel?: string | null;
  description?: string | null;
  destinationPageLink?: string | null;
  markerLabel?: string | null;
  coordinateOverride?: { lat?: number | null; lng?: number | null } | null;
  destination?: {
    title?: string | null;
    slug?: string | null;
    summary?: string | null;
    location?: { lat?: number | null; lng?: number | null } | null;
  } | null;
};

const legacyLocations: Record<string, { lat: number; lng: number; description: string }> = {
  arusha: { lat: -3.3869, lng: 36.683, description: "Arrival, briefing and the northern circuit starting point." },
  "tarangire national park": { lat: -3.8333, lng: 36, description: "Baobab country, river habitat and an unhurried first game drive." },
  "ngorongoro crater": { lat: -3.1618, lng: 35.5877, description: "Descend into the crater for a remarkable day of wildlife viewing." },
  "ngorongoro conservation area": { lat: -3.1618, lng: 35.5877, description: "Highlands, crater landscapes and exceptional wildlife habitat." },
  "central serengeti": { lat: -2.3333, lng: 34.8333, description: "Open plains, kopjes and classic Serengeti game-viewing country." },
  "northern serengeti": { lat: -1.55, lng: 34.72, description: "Migration country shaped by the seasonal movement of wildlife." },
  "northern serengeti – mara river": { lat: -1.504, lng: 34.738, description: "Northern plains and the Mara River region, explored according to wildlife movement." },
};

function isValidCoordinate(lat: unknown, lng: unknown): boolean {
  return typeof lat === "number" && Number.isFinite(lat) && lat >= -90 && lat <= 90
    && typeof lng === "number" && Number.isFinite(lng) && lng >= -180 && lng <= 180;
}

export function safeDestinationUrl(value?: string | null, slug?: string | null) {
  if (value?.startsWith("/") && !value.startsWith("//")) return value;
  if (value) {
    try {
      const url = new URL(value);
      if (url.protocol === "https:") return url.toString();
    } catch {
      // Invalid editor input is intentionally omitted from the presentation model.
    }
  }
  return slug ? `/destinations/${encodeURIComponent(slug)}` : "";
}

export function presentTripRouteStops(rawStops: RawTripRouteStop[] | null | undefined): CmsTripRouteStop[] {
  return (rawStops || []).flatMap((stop, index) => {
    const override = stop.coordinateOverride;
    const standard = stop.destination?.location;
    const usesOverride = isValidCoordinate(override?.lat, override?.lng);
    const lat = usesOverride ? override?.lat : standard?.lat;
    const lng = usesOverride ? override?.lng : standard?.lng;
    if (!isValidCoordinate(lat, lng)) return [];

    return [{
      key: stop._key || `route-stop-${index + 1}`,
      name: stop.displayName?.trim() || stop.destination?.title?.trim() || `Stop ${index + 1}`,
      lat: lat as number,
      lng: lng as number,
      dayLabel: stop.dayLabel?.trim() || "",
      description: stop.description?.trim() || stop.destination?.summary?.trim() || "",
      markerLabel: stop.markerLabel?.trim() || String(index + 1).padStart(2, "0"),
      href: safeDestinationUrl(stop.destinationPageLink, stop.destination?.slug),
    }];
  });
}

export function legacyTripRouteStops(destinations: string[] | null | undefined): CmsTripRouteStop[] {
  return (destinations || []).flatMap((name, index) => {
    const location = legacyLocations[name.trim().toLowerCase()];
    if (!location) return [];
    return [{
      key: `legacy-route-stop-${index + 1}`,
      name,
      lat: location.lat,
      lng: location.lng,
      dayLabel: index === 0 ? "Day 1" : `Day ${index + 1}`,
      description: location.description,
      markerLabel: String(index + 1).padStart(2, "0"),
      href: "",
    }];
  });
}

export function createTripRouteMap({
  title,
  rawStops,
  legacyDestinations,
  fallbackImage,
}: {
  title: string;
  rawStops?: RawTripRouteStop[] | null;
  legacyDestinations?: string[] | null;
  fallbackImage?: CmsImage | null;
}): CmsTripRouteMap {
  const configuredStops = presentTripRouteStops(rawStops);
  return {
    label: `${title} route map`,
    stops: configuredStops.length ? configuredStops : legacyTripRouteStops(legacyDestinations),
    fallbackImage: fallbackImage || null,
  };
}

export function routeLineCoordinates(stops: CmsTripRouteStop[]) {
  return stops.length > 1 ? stops.map(({ lat, lng }) => [lat, lng] as [number, number]) : [];
}
