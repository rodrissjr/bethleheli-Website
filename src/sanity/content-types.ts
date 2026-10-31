export type CmsImage = {
  src: string;
  alt: string;
};

export type CmsTripStay = {
  property: string;
  tier: "Luxury" | "Mid-range" | "Budget";
  image: string;
  alt: string;
  slides: Array<{
    property: string;
    tier: "Luxury" | "Mid-range" | "Budget";
    image: string;
    alt: string;
  }>;
};

export type CmsTripPageData = {
  title: string;
  durationDays: number;
  startingPrice: string;
  heroImage: CmsImage;
  heroSummary: string;
  overviewParagraphs: string[];
  overviewImages: CmsImage[];
  itineraryFor: string;
  travelDatesText: string;
  guestsText: string;
  map: CmsImage;
  destinations: string[];
  planningTitle: string;
  planningDescription: string;
  itinerary: Array<{
    key: string;
    title: string;
    summary: string;
    image: CmsImage | null;
    experience: string;
    mealPlan: string;
    stays: CmsTripStay[];
  }>;
  practicalInformation: Array<{
    key: string;
    title: string;
    details: string;
  }>;
  landscapesTitle: string;
  landscapes: Array<{
    key: string;
    icon: string;
    title: string;
    descriptor: string;
    image: CmsImage;
    description: string;
  }>;
  inclusionsEyebrow: string;
  inclusionsTitle: string;
  inclusionsDescription: string;
  notIncluded: string[];
  inclusionGroups: Array<{
    key: string;
    marker: string;
    title: string;
    description: string;
    items: Array<{
      key: string;
      icon: string;
      title: string;
      description: string;
    }>;
  }>;
  relatedTrips: Array<{
    title: string;
    copy: string;
    note: string;
    image: string;
    href: string;
  }>;
};

export type CmsKilimanjaroRouteTrip = {
  title: string;
  trekkingDays: number;
  totalItineraryDays: number;
  routeDistanceKm: number | null;
  startingPrice: string;
  itineraryFor: string;
  destinations: string[];
  itinerary: Array<{
    key: string;
    title: string;
    summary: string;
    experience: string;
    mealPlan: string;
    dayType: "trekking" | "arrival" | "departure" | "other";
    accommodations: string[];
    image: CmsImage | null;
  }>;
};

export type CmsTripCard = {
  title: string;
  src: string;
  href: string;
  categories: Array<"Day Trips" | "Kilimanjaro" | "Safari" | "Zanzibar">;
  days: number;
  price: string;
};

export type CmsGroupDeparture = {
  id: string;
  day: string;
  month: string;
  monthIndex: number;
  year: string;
  dateTime: string;
  title: string;
  range: string;
  highlights: string[];
  price: string;
  deposit: string;
  originalPrice?: string;
  discountPercent?: number;
  seasonLabel?: string;
};

export type CmsSeo = {
  title: string;
  description: string;
  canonicalPath: string;
  shareImage: CmsImage;
};
