"use client";

import { useEffect } from "react";

export function AdTrackingCapture() {
  useEffect(() => {
    try {
      const previous = JSON.parse(sessionStorage.getItem("utm") || "{}") as Record<string, string>;
      const allowed = new Set(["utm_source", "utm_medium", "utm_campaign", "fbclid"]);
      const captured = Object.fromEntries(
        Array.from(new URLSearchParams(window.location.search).entries()).filter(
          ([key, value]) => allowed.has(key) && value.length > 0,
        ),
      );

      if (Object.keys(captured).length > 0) {
        sessionStorage.setItem("utm", JSON.stringify({ ...previous, ...captured }));
      }
    } catch {
      // Tracking must never interfere with browsing or form submission.
    }
  }, []);

  return null;
}
