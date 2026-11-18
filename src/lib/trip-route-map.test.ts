import {describe, expect, it} from "vitest";
import {liveTripRouteSlugs, tripRouteProfiles} from "./trip-route-catalog";
import {catalogTripRouteStops, createTripRouteMap, presentTripRouteStops, routeLineCoordinates, safeDestinationUrl} from "./trip-route-map";

const raw = [
  {
    _key: "first",
    destination: {title: "First", slug: "first", summary: "First summary", location: {lat: -3, lng: 36}},
    dayLabel: "Day 1",
  },
  {
    _key: "second",
    destination: {title: "Second", slug: "second", location: {lat: -2, lng: 35}},
    coordinateOverride: {lat: -1.5, lng: 34.5},
    markerLabel: "B",
  },
];

describe("trip route map adapter", () => {
  it("preserves configured order and generates safe destination URLs", () => {
    const stops = presentTripRouteStops(raw);
    expect(stops.map(stop => stop.key)).toEqual(["first", "second"]);
    expect(stops[0]).toMatchObject({name: "First", href: "/destinations/first"});
  });

  it("uses coordinate overrides before destination coordinates", () => {
    expect(presentTripRouteStops(raw)[1]).toMatchObject({lat: -1.5, lng: 34.5});
  });

  it("falls back to destination coordinates", () => {
    expect(presentTripRouteStops(raw)[0]).toMatchObject({lat: -3, lng: 36});
  });

  it("removes invalid and incomplete points safely", () => {
    const stops = presentTripRouteStops([
      ...raw,
      {_key: "missing", destination: {title: "Missing", location: null}},
      {_key: "invalid", destination: {title: "Invalid", location: {lat: 91, lng: 20}}},
    ]);
    expect(stops).toHaveLength(2);
  });

  it("does not create a route line for one point and connects multiple points", () => {
    const stops = presentTripRouteStops(raw);
    expect(routeLineCoordinates(stops.slice(0, 1))).toEqual([]);
    expect(routeLineCoordinates(stops)).toEqual([[-3, 36], [-1.5, 34.5]]);
  });

  it("keeps a static fallback when no map points are valid", () => {
    const route = createTripRouteMap({
      title: "Fallback trip",
      rawStops: [{_key: "bad", destination: {title: "Bad", location: null}}],
      fallbackImage: {src: "/map.png", alt: "Static route map"},
    });
    expect(route.stops).toEqual([]);
    expect(route.fallbackImage?.src).toBe("/map.png");
  });

  it("includes every transfer and destination in the 7-day northern safari", () => {
    const stops = catalogTripRouteStops("7-day-northern-tanzania-safari-mara-river-crossing");

    expect(stops.map(stop => stop.name)).toEqual([
      "Kilimanjaro International Airport",
      "Arusha",
      "Tarangire National Park",
      "Karatu",
      "Ngorongoro Crater",
      "Central Serengeti",
      "Northern Serengeti – Mara River",
      "Kogatende Airstrip",
      "Arusha Airport",
      "Kilimanjaro International Airport",
    ]);
    expect(stops.map(stop => stop.dayLabel)).toEqual([
      "Day 1",
      "Day 1",
      "Day 2",
      "Day 2",
      "Day 3",
      "Day 4",
      "Days 5–6",
      "Day 7",
      "Day 7",
      "Day 7",
    ]);
    expect(routeLineCoordinates(stops).at(0)).toEqual(routeLineCoordinates(stops).at(-1));
  });

  it("resolves every destination in every live itinerary route profile", () => {
    expect(liveTripRouteSlugs).toHaveLength(15);
    for (const slug of liveTripRouteSlugs) {
      expect(catalogTripRouteStops(slug), slug).toHaveLength(tripRouteProfiles[slug].length);
      expect(catalogTripRouteStops(slug).length, slug).toBeGreaterThanOrEqual(2);
    }
  });

  it("rejects unsafe destination URLs", () => {
    expect(safeDestinationUrl("javascript:alert(1)", null)).toBe("");
    expect(safeDestinationUrl("//example.com", "safe")).toBe("/destinations/safe");
    expect(safeDestinationUrl("/safari", null)).toBe("/safari");
  });
});
