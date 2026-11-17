/* eslint-disable @next/next/no-img-element */
import {readFileSync} from "node:fs";
import type {ImgHTMLAttributes} from "react";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {describe, expect, it, vi} from "vitest";

vi.mock("next/image", () => ({
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt || ""} />,
}));

vi.mock("next/dynamic", () => ({
  default: () => function MockInteractiveMap({stops, activeKey, onSelect}: {
    stops: Array<{key: string; name: string}>;
    activeKey: string;
    onSelect: (key: string) => void;
  }) {
    return <div aria-label="Interactive map mock">
      {stops.map(stop => <button key={stop.key} type="button" aria-pressed={stop.key === activeKey} onClick={() => onSelect(stop.key)}>Map marker {stop.name}</button>)}
    </div>;
  },
}));

import {TripRouteMap} from "./trip-route-map";

const route = {
  label: "Test trip route map",
  fallbackImage: {src: "/fallback.png", alt: "Fallback map"},
  stops: [
    {key: "a", name: "Arusha", lat: -3, lng: 36, dayLabel: "Day 1", description: "Start here", markerLabel: "01", href: ""},
    {key: "b", name: "Serengeti", lat: -2, lng: 35, dayLabel: "Day 2", description: "Continue here", markerLabel: "02", href: "/safari"},
  ],
};

describe("TripRouteMap", () => {
  it("marker selection updates the active destination and route-list selection updates the active marker", async () => {
    const user = userEvent.setup();
    render(<TripRouteMap route={route} />);
    await user.click(screen.getByRole("button", {name: "Map marker Serengeti"}));
    expect(screen.getByText("Continue here")).toBeInTheDocument();
    expect(screen.getByRole("button", {name: /02 Serengeti Day 2/})).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", {name: /01 Arusha Day 1/}));
    expect(screen.getByRole("button", {name: "Map marker Arusha"})).toHaveAttribute("aria-pressed", "true");
  });

  it("supports keyboard activation and keeps the route list as a fixed list", async () => {
    const user = userEvent.setup();
    render(<TripRouteMap route={route} />);
    const second = screen.getByRole("button", {name: /02 Serengeti Day 2/});
    second.focus();
    await user.keyboard("{Enter}");
    expect(second).toHaveAttribute("aria-current", "location");
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
  });

  it("renders the static image fallback when map data is missing", () => {
    render(<TripRouteMap route={{...route, stops: []}} />);
    expect(screen.getByRole("img", {name: "Fallback map"})).toBeInTheDocument();
    expect(screen.queryByLabelText("Interactive map mock")).not.toBeInTheDocument();
  });

  it("renders an accessible empty state when neither route points nor a fallback image exist", () => {
    render(<TripRouteMap route={{...route, stops: [], fallbackImage: null}} />);
    expect(screen.getByRole("status")).toHaveTextContent("Route map details are being prepared.");
  });

  it("keeps Leaflet behind a route-only dynamic import", () => {
    const layout = readFileSync("src/app/layout.tsx", "utf8");
    const wrapper = readFileSync("src/components/trip-route-map.tsx", "utf8");
    expect(layout).not.toContain("leaflet");
    expect(wrapper).toContain("dynamic(");
    expect(wrapper).toContain("trip-route-map-leaflet");
  });
});
