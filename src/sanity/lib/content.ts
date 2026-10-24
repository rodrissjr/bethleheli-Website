import "server-only";

import type { ClientReturn } from "@sanity/client";
import type { SanityImageSource } from "@sanity/image-url";
import type {
  GROUP_DEPARTURES_QUERY_RESULT,
  TRIP_CARDS_QUERY_RESULT,
  TRIP_PAGE_QUERY_RESULT,
  TRIP_SEO_QUERY_RESULT,
  TRIP_SLUGS_QUERY_RESULT,
} from "../../../sanity.types";
import type {
  CmsGroupDeparture,
  CmsImage,
  CmsSeo,
  CmsTripCard,
  CmsTripPageData,
  CmsTripStay,
} from "@/sanity/content-types";
import { buildInclusionGroups } from "../../../shared/inclusion-catalog";
import type { InclusionIcon } from "../../../shared/inclusion-catalog";
import { sanityClient } from "./client";
import { urlForImage } from "./image";
import {
  GROUP_DEPARTURES_QUERY,
  TRIP_CARDS_QUERY,
  TRIP_PAGE_QUERY,
  TRIP_SEO_QUERY,
  TRIP_SLUGS_QUERY,
} from "./queries";

type RawTrip = NonNullable<TRIP_PAGE_QUERY_RESULT>;
type RawImage = NonNullable<RawTrip["heroImage"]>;
type RawMoney = { amount?: number | null; currency?: string | null };
type RawSeo = TRIP_SEO_QUERY_RESULT;

function isDefined<T>(value: T): value is NonNullable<T> {
  return value != null;
}

const mealPlanLabels: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  breakfastLunch: "Breakfast and lunch",
  lunchDinner: "Lunch and dinner",
  halfBoard: "Half Board",
  fullBoard: "Full Board",
};

const tierLabels: Record<string, CmsTripStay["tier"]> = {
  budget: "Budget",
  midRange: "Mid-range",
  luxury: "Luxury",
};

const landscapeIcons: Record<string, string> = {
  tree: "🌳",
  mountain: "⛰️",
  zebra: "🦓",
  grass: "🌾",
  water: "🌊",
};

const inclusionIcons = new Set<InclusionIcon>([
  "route",
  "clipboard",
  "ticket",
  "mountain",
  "backpack",
  "tent",
  "utensils",
  "droplets",
  "heart",
  "message",
  "users",
  "shield",
]);

function inferInclusionIcon(value: string): InclusionIcon | null {
  const service = value.toLowerCase();

  if (/dietary|allerg/.test(service)) return "heart";
  if (/accommodation|hotel|lodge|camp|hut|stay|sleeping mat|toilet tent/.test(service)) return "tent";
  if (/meal|food|breakfast|lunch|dinner|cook|refreshment/.test(service)) return "utensils";
  if (/water|drink|snorkel/.test(service)) return "droplets";
  if (/fee|permit|tax|ticket|domestic flight|ferry/.test(service)) return "ticket";
  if (/safety|first[ -]?aid|medical|oxygen|rescue|emergency|evacuation/.test(service)) return "shield";
  if (/guide|crew|porter|mountain team/.test(service)) return "users";
  if (/transfer|transport|vehicle|pickup|drop[ -]?off|game drive/.test(service)) return "route";
  if (/briefing|checklist|packing list|equipment check/.test(service)) return "clipboard";
  if (/equipment|duffel|backpack/.test(service)) return "backpack";
  if (/planning|coordination|contact|support/.test(service)) return "message";
  if (/care/.test(service)) return "heart";
  if (/mountain|climb|trail/.test(service)) return "mountain";

  return null;
}

function inclusionIconFor(title: string, description: string, savedIcon?: string | null): InclusionIcon {
  // The service title is authoritative. Descriptions often mention related
  // services (for example, a transfer description can mention a hotel), so
  // they must never override a clear title match.
  const titleIcon = inferInclusionIcon(title);
  if (titleIcon) return titleIcon;

  if (savedIcon && inclusionIcons.has(savedIcon as InclusionIcon)) return savedIcon as InclusionIcon;

  return inferInclusionIcon(description) ?? "clipboard";
}

function presentImage(value: RawImage | null | undefined, width = 1600): CmsImage | null {
  if (!value) return null;
  try {
    return {
      src: urlForImage(value as SanityImageSource).width(width).fit("max").auto("format").url(),
      alt: value.alt || "",
    };
  } catch {
    return null;
  }
}

function formatMoney(value: RawMoney | null | undefined, useGrouping = true) {
  if (typeof value?.amount !== "number") return "";
  const currency = value.currency || "USD";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
    useGrouping,
  }).format(value.amount);
}

function presentSeo(raw: RawSeo): CmsSeo | null {
  const shareImage = presentImage(raw?.shareImage, 1600);
  if (!raw?.title || !raw?.description || !raw?.canonicalPath || !shareImage) return null;
  return {
    title: raw.title,
    description: raw.description,
    canonicalPath: raw.canonicalPath,
    shareImage,
  };
}

async function fetchSanity<const Query extends string>(query: Query, params: Record<string, string>, tags: string[]): Promise<ClientReturn<Query>> {
  return sanityClient.fetch(query, params, process.env.NODE_ENV === "development"
    ? {cache: "no-store"}
    : {next: {revalidate: 60, tags}},
  );
}

export async function getTripPageContent(slug: string): Promise<CmsTripPageData | null> {
  try {
    const raw = await fetchSanity(TRIP_PAGE_QUERY, { slug }, ["sanity", "trip", `trip:${slug}`, "accommodation", "tripSettings"]);
    const heroImage = presentImage(raw?.heroImage);
    const overviewImages = (raw?.overviewImages || [])
      .map(image => presentImage(image, 1600))
      .filter((image): image is CmsImage => Boolean(image));
    const legacyOverviewImage = presentImage(raw?.overviewImage, 1600);
    if (!overviewImages.length && legacyOverviewImage) overviewImages.push(legacyOverviewImage);
    const map = presentImage(raw?.sharedMap, 1200);
    if (!raw || !heroImage || !overviewImages.length || !map) return null;

    const allAccommodations = (raw.itinerary || [])
      .flatMap(day => day.accommodations || [])
      .filter(isDefined);
    const slidesByTier = new Map<CmsTripStay["tier"], CmsTripStay["slides"]>();
    for (const accommodation of allAccommodations) {
      const tier = tierLabels[accommodation.tier || ""];
      if (!tier) continue;
      const slides = (accommodation.gallery || [])
        .map(entry => presentImage(entry, 1400))
        .filter((entry): entry is CmsImage => Boolean(entry))
        .map(entry => ({ property: accommodation.propertyName || "Accommodation", tier, image: entry.src, alt: entry.alt }));
      const current = slidesByTier.get(tier) || [];
      for (const slide of slides) {
        if (!current.some((candidate) => candidate.image === slide.image)) current.push(slide);
      }
      slidesByTier.set(tier, current.slice(0, 10));
    }

    const itinerary = (raw.itinerary || []).map((day, dayIndex) => ({
      key: day._key || `day-${dayIndex + 1}`,
      title: day.title || "Itinerary day",
      summary: day.summary || "",
      image: presentImage(day.image, 1600),
      experience: day.experience || "",
      mealPlan: mealPlanLabels[day.mealPlan || ""] || day.mealPlan || "",
      stays: (day.accommodations || []).filter(isDefined).map(accommodation => {
        const tier = tierLabels[accommodation.tier || ""] || "Mid-range";
        const coverImage = presentImage(accommodation.coverImage, 1400);
        return {
          property: accommodation.propertyName || "Accommodation",
          tier,
          image: coverImage?.src || "",
          alt: coverImage?.alt || accommodation.propertyName || "Accommodation",
          slides: slidesByTier.get(tier) || [],
        } satisfies CmsTripStay;
      }).filter((stay: CmsTripStay) => Boolean(stay.image)),
    })).filter((day): day is typeof day & { image: CmsImage } => Boolean(day.image));

    const presetInclusionGroups = buildInclusionGroups(raw.includedServiceKeys);
    const legacyInclusionGroups = (raw.inclusionGroups || []).map((group, groupIndex) => ({
      key: group._key || `group-${groupIndex + 1}`,
      marker: group.marker || "",
      title: group.title || "Included services",
      description: group.description || "",
      items: (group.items || []).map((item, itemIndex) => ({
        key: item._key || `item-${itemIndex + 1}`,
        icon: inclusionIconFor(item.title || "", item.description || "", item.iconKey),
        title: item.title || "Included service",
        description: item.description || "",
      })),
    }));

    return {
      title: raw.title || "Trip",
      durationDays: raw.durationDays || itinerary.length,
      startingPrice: formatMoney(raw.startingPrice),
      heroImage,
      heroSummary: raw.heroSummary || "",
      overviewParagraphs: raw.overviewParagraphs || [],
      overviewImages,
      itineraryFor: raw.itineraryFor || "",
      travelDatesText: raw.travelDatesText || "",
      guestsText: raw.guestsText || "",
      map,
      destinations: raw.destinations || [],
      planningTitle: raw.planningTitle || "",
      planningDescription: raw.planningDescription || "",
      itinerary,
      landscapesTitle: raw.landscapesTitle || "",
      landscapes: (raw.landscapes || []).map((landscape, index) => ({
        key: landscape._key || `landscape-${index + 1}`,
        icon: landscapeIcons[landscape.iconKey || ""] || "•",
        title: landscape.name || "Landscape",
        descriptor: landscape.descriptor || "",
        image: presentImage(landscape.image, 1600),
        description: landscape.description || "",
      })).filter((landscape): landscape is typeof landscape & { image: CmsImage } => Boolean(landscape.image)),
      inclusionsEyebrow: raw.inclusionsEyebrow || "",
      inclusionsTitle: raw.inclusionsTitle || "",
      inclusionsDescription: raw.inclusionsDescription || "",
      inclusionGroups: presetInclusionGroups.length ? presetInclusionGroups : legacyInclusionGroups,
      relatedTrips: (raw.relatedTrips || []).filter(trip => trip.href !== "/trips/northern-serengeti").map(trip => {
        const image = presentImage(trip.image, 1200);
        return {
          title: trip.title || "Related trip",
          copy: trip.summary || "",
          note: trip.durationLabel || "",
          image: image?.src || "",
          href: trip.href || "/trips",
        };
      }).filter((trip: { image: string }) => Boolean(trip.image)),
    };
  } catch (error) {
    console.error(`Unable to load Sanity trip content for ${slug}.`, error);
    return null;
  }
}

export async function getGroupDepartures(): Promise<CmsGroupDeparture[]> {
  try {
    const raw: GROUP_DEPARTURES_QUERY_RESULT = await fetchSanity(GROUP_DEPARTURES_QUERY, {}, ["sanity", "groupDeparture"]);
    return (raw || []).flatMap(departure => {
      if (!departure.startDate || !departure.endDate || !departure.routeName) return [];
      const start = new Date(`${departure.startDate}T12:00:00Z`);
      const end = new Date(`${departure.endDate}T12:00:00Z`);
      const month = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(start);
      const longStartMonth = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" }).format(start);
      const longEndMonth = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" }).format(end);
      const startDay = String(start.getUTCDate()).padStart(2, "0");
      const endDay = String(end.getUTCDate()).padStart(2, "0");
      const startYear = start.getUTCFullYear();
      const endYear = end.getUTCFullYear();
      const price = departure.price?.amount || 0;
      const originalPrice = departure.originalPrice?.amount || 0;
      const routeAlreadyIncludesDuration = /\b\d+\s*(?:-|–|—)?\s*days?\b/i.test(departure.routeName);
      const duration = departure.durationDays && !routeAlreadyIncludesDuration
        ? `${departure.durationDays} ${departure.durationDays === 1 ? "day" : "days"}`
        : "";
      const range = startYear === endYear
        ? `From ${startDay} ${longStartMonth} – ${endDay} ${longEndMonth}`
        : `From ${startDay} ${longStartMonth} ${startYear} – ${endDay} ${longEndMonth} ${endYear}`;
      return {
        id: departure._id,
        day: startDay,
        month,
        monthIndex: start.getUTCMonth(),
        year: String(startYear),
        dateTime: departure.startDate,
        title: [departure.routeName, duration].filter(Boolean).join(" — "),
        range,
        highlights: departure.highlights || [],
        price: formatMoney(departure.price, false),
        deposit: formatMoney(departure.deposit, false),
        originalPrice: originalPrice ? formatMoney(departure.originalPrice, false) : undefined,
        discountPercent: originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : undefined,
        seasonLabel: departure.seasonStatus === "rain" ? departure.seasonLabel || "Rain Season" : undefined,
      } satisfies CmsGroupDeparture;
    });

  } catch (error) {
    console.error("Unable to load Sanity group departures.", error);
    return [];
  }
}

export async function getTripSeo(slug: string): Promise<CmsSeo | null> {
  try {
    return presentSeo(await fetchSanity(TRIP_SEO_QUERY, { slug }, ["sanity", "trip", `trip:${slug}`]));
  } catch (error) {
    console.error(`Unable to load Sanity SEO for ${slug}.`, error);
    return null;
  }
}

const categoryLabels: Record<string, CmsTripCard["categories"][number]> = {
  kilimanjaro: "Kilimanjaro",
  safari: "Safari",
  zanzibar: "Zanzibar",
};

export async function getTripCards(): Promise<CmsTripCard[]> {
  try {
    const raw: TRIP_CARDS_QUERY_RESULT = await fetchSanity(TRIP_CARDS_QUERY, {}, ["sanity", "trip"]);
    return (raw || []).flatMap((trip) => {
      const cardImage = presentImage(trip.heroImage, 1200)
        || presentImage(trip.overviewImage, 1200)
        || presentImage(trip.legacyCardImage, 1200);
      const categories = (trip.categories || [])
        .map((category) => categoryLabels[category])
        .filter((category): category is CmsTripCard["categories"][number] => Boolean(category));
      if (!trip.slug || !trip.title || !trip.durationDays || !cardImage || !categories.length) return [];
      return [{
        title: trip.title,
        src: cardImage.src,
        href: `/trips/${trip.slug}`,
        categories,
        days: trip.durationDays,
        price: formatMoney(trip.startingPrice),
      } satisfies CmsTripCard];
    });
  } catch (error) {
    console.error("Unable to load Sanity trip cards.", error);
    return [];
  }
}

export async function getTripSlugs(): Promise<TRIP_SLUGS_QUERY_RESULT> {
  try {
    return await fetchSanity(TRIP_SLUGS_QUERY, {}, ["sanity", "trip"]);
  } catch (error) {
    console.error("Unable to load Sanity trip slugs.", error);
    return [];
  }
}
