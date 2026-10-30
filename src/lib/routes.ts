export type PageKey = "home" | "kilimanjaro" | "machame" | "lemosho" | "marangu" | "rongai" | "northernCircuit" | "umbwe" | "safari" | "zanzibar" | "plan" | "contact" | "faq" | "trips" | "northernSerengeti" | "groups" | "thankYou" | "terms";

type Meta = { title: string; description: string; path: string; image: string };

export const pageMeta: Record<PageKey, Meta> = {
  home: { title: "Tanzania journeys made personal", description: "Kilimanjaro climbs, Tanzania safaris and Zanzibar journeys from Betheli Expeditions.", path: "/", image: "/images/figma-home-hero.png" },
  kilimanjaro: { title: "Climb Mount Kilimanjaro", description: "Explore Kilimanjaro routes, the journey and tailored climb planning.", path: "/kilimanjaro", image: "/images/drive-library/lemosho-hero.webp" },
  machame: { title: "Machame Route Kilimanjaro | Itinerary & Distance", description: "Explore the Machame Route day by day, including its 56.7 km distance, rainforest, Shira Plateau, Barranco Wall and summit approach.", path: "/kilimanjaro/machame-route", image: "/images/drive-library/machame-hero.webp" },
  lemosho: { title: "Lemosho Route Kilimanjaro | 8-Day Itinerary", description: "Explore the scenic Lemosho Route itinerary, from western rainforest and Shira Plateau to Barranco, Barafu and the summit attempt.", path: "/kilimanjaro/lemosho-route", image: "/images/drive-library/lemosho-hero.webp" },
  marangu: { title: "Marangu Route Kilimanjaro | 6-Day Hut Itinerary", description: "Review the six-day Marangu Route with hut accommodation, a Horombo acclimatization day, route distance and a full day-by-day plan.", path: "/kilimanjaro/marangu-route", image: "/images/drive-library/marangu-hero.webp" },
  rongai: { title: "Rongai Route Kilimanjaro | 7-Day Itinerary", description: "Follow the quieter seven-day Rongai Route from Kilimanjaro’s northern side to Mawenzi, Kibo, the summit path and Marangu descent.", path: "/kilimanjaro/rongai-route", image: "/images/drive-library/rongai-hero.webp" },
  northernCircuit: { title: "Northern Circuit Kilimanjaro | 9-Day Itinerary", description: "Explore the nine-day Northern Circuit around Kilimanjaro’s remote northern slopes, with route distance, camps and day-by-day details.", path: "/kilimanjaro/northern-circuit", image: "/images/drive-library/northern-circuit-hero.webp" },
  umbwe: { title: "Umbwe Route Kilimanjaro | 6-Day Itinerary", description: "Review the steep six-day Umbwe Route from rainforest and Barranco to Barafu, the summit attempt and Mweka descent.", path: "/kilimanjaro/umbwe-route", image: "/images/drive-library/umbwe-hero.webp" },
  safari: { title: "Tanzania Safari", description: "Explore Tanzania safari parks, wildlife and itinerary ideas.", path: "/safari", image: "/images/drive-library/safari-hero.webp" },
  zanzibar: { title: "Discover Zanzibar", description: "Explore Zanzibar beaches, Stone Town and island journeys.", path: "/zanzibar", image: "/images/figma-zanzibar-hero.png" },
  plan: { title: "Plan Your Tanzania Adventure", description: "Share your travel interests and begin planning a Tanzania journey.", path: "/plan-your-trip", image: "/images/figma-plan-hero.png" },
  contact: { title: "Contact Bathiel Expeditions", description: "Start a conversation with the Bathiel Expeditions team.", path: "/contact", image: "/images/figma-contact-hero.jpg" },
  faq: { title: "Tanzania Travel Questions", description: "Answers to common Kilimanjaro, safari, Zanzibar and booking questions.", path: "/faq", image: "/images/figma-faq-hero.jpg" },
  trips: { title: "Tanzania Trips", description: "Explore thoughtfully designed Kilimanjaro, safari and Zanzibar journeys.", path: "/trips", image: "/images/trips-hero-serengeti.webp" },
  northernSerengeti: { title: "Northern Serengeti River Crossing Safari", description: "View a six-day Northern Serengeti River Crossing Safari itinerary.", path: "/trips/northern-serengeti", image: "/images/figma-trips-hero.png" },
  groups: { title: "Kilimanjaro Climbing Groups", description: "View upcoming Kilimanjaro climbing group departures.", path: "/groups", image: "/images/home-10.jpg" },
  thankYou: { title: "Thank You", description: "Your enquiry has been received by the Betheli Expeditions team.", path: "/thank-you", image: "/images/figma-plan-hero.png" },
  terms: { title: "Booking Terms & Conditions", description: "Read Betheli Expeditions booking, payment, cancellation and travel terms.", path: "/terms-and-conditions", image: "/images/figma-home-hero.png" },
};

export function routeKeyFromSlug(slug?: string[]): PageKey | null {
  const path = `/${(slug || []).join("/")}`.replace(/\/$/, "") || "/";
  const routes: Record<string, PageKey> = {
    "/": "home", "/kilimanjaro": "kilimanjaro", "/kilimanjaro/machame-route": "machame", "/kilimanjaro/lemosho-route": "lemosho", "/kilimanjaro/marangu-route": "marangu", "/kilimanjaro/rongai-route": "rongai", "/kilimanjaro/northern-circuit": "northernCircuit", "/kilimanjaro/umbwe-route": "umbwe", "/safari": "safari", "/zanzibar": "zanzibar", "/plan-your-trip": "plan", "/contact": "contact", "/faq": "faq", "/trips": "trips", "/trips/northern-serengeti": "northernSerengeti", "/groups": "groups", "/thank-you": "thankYou", "/terms-and-conditions": "terms",
  };
  return routes[path] || null;
}
