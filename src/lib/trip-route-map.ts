import type { CmsImage, CmsTripRouteMap, CmsTripRouteStop } from "@/sanity/content-types";
import {tripRouteLocations, tripRouteProfiles} from "./trip-route-catalog";

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
    const normalizedName = name.trim().toLowerCase();
    const location = tripRouteLocations[normalizedName];
    if (!location) return [];
    return [{
      key: `legacy-route-stop-${index + 1}`,
      name,
      lat: location.lat,
      lng: location.lng,
      dayLabel: `Stop ${index + 1}`,
      description: location.description,
      markerLabel: String(index + 1).padStart(2, "0"),
      href: "",
    }];
  });
}

export function catalogTripRouteStops(slug: string | null | undefined): CmsTripRouteStop[] {
  return (slug ? tripRouteProfiles[slug] : []).flatMap((stop, index) => {
    const location = tripRouteLocations[(stop.locationKey || stop.name).trim().toLowerCase()];
    if (!location) return [];
    return [{
      key: `catalog-route-stop-${index + 1}`,
      name: stop.name,
      lat: location.lat,
      lng: location.lng,
      dayLabel: stop.dayLabel,
      description: location.description,
      markerLabel: String(index + 1).padStart(2, "0"),
      href: "",
    }];
  });
}

export function createTripRouteMap({
  title,
  tripSlug,
  rawStops,
  legacyDestinations,
  fallbackImage,
}: {
  title: string;
  tripSlug?: string | null;
  rawStops?: RawTripRouteStop[] | null;
  legacyDestinations?: string[] | null;
  fallbackImage?: CmsImage | null;
}): CmsTripRouteMap {
  const configuredStops = presentTripRouteStops(rawStops);
  const catalogStops = catalogTripRouteStops(tripSlug);
  return {
    label: `${title} route map`,
    stops: configuredStops.length ? configuredStops : catalogStops.length ? catalogStops : legacyTripRouteStops(legacyDestinations),
    fallbackImage: fallbackImage || null,
  };
}

export function routeLineCoordinates(stops: CmsTripRouteStop[]) {
  return stops.length > 1 ? stops.map(({ lat, lng }) => [lat, lng] as [number, number]) : [];
}
