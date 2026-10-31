import { defineQuery } from "next-sanity";

const imageFields = /* groq */ `
  asset,
  alt,
  crop,
  hotspot,
  "lqip": asset->metadata.lqip,
  "dimensions": asset->metadata.dimensions
`;

export const TRIP_PAGE_QUERY = defineQuery(/* groq */ `
  *[_type == "trip" && slug.current == $slug][0] {
    _id,
    title,
    categories,
    durationDays,
    trekkingDays,
    routeDistanceKm,
    startingPrice { amount, currency },
    heroImage { ${imageFields} },
    heroSummary,
    overviewParagraphs,
    overviewImages[] { _key, ${imageFields} },
    overviewImage { ${imageFields} },
    itineraryFor,
    travelDatesText,
    guestsText,
    destinations,
    planningTitle,
    planningDescription,
    itinerary[] {
      _key,
      dayType,
      title,
      summary,
      image { ${imageFields} },
      experience,
      mealPlan,
      accommodations[]-> {
        _id,
        propertyName,
        tier,
        coverImage { ${imageFields} },
        gallery[] { ${imageFields} }
      }
    },
    practicalInformation[] { _key, title, details },
    landscapesTitle,
    landscapes[] {
      _key,
      name,
      descriptor,
      iconKey,
      image { ${imageFields} },
      description
    },
    inclusionsEyebrow,
    inclusionsTitle,
    inclusionsDescription,
    includedServiceKeys,
    notIncluded,
    inclusionGroups[] {
      _key,
      marker,
      title,
      description,
      items[] { _key, iconKey, title, description }
    },
    relatedTrips[] {
      _key,
      title,
      summary,
      durationLabel,
      image { ${imageFields} },
      href
    },
    seo {
      title,
      description,
      canonicalPath,
      shareImage { ${imageFields} }
    },
    "sharedMap": *[_id == "tripSettings"][0].map { ${imageFields} }
  }
`);

export const KILIMANJARO_ROUTE_TRIPS_QUERY = defineQuery(/* groq */ `
  *[_type == "trip" && "kilimanjaro" in categories && defined(slug.current)] | order(trekkingDays asc, title asc) {
    _id,
    title,
    "slug": slug.current,
    durationDays,
    trekkingDays,
    routeDistanceKm,
    startingPrice { amount, currency },
    itineraryFor,
    destinations,
    itinerary[] {
      _key,
      dayType,
      title,
      summary,
      experience,
      mealPlan,
      image { ${imageFields} },
      "accommodations": accommodations[]->propertyName
    }
  }
`);

export const GROUP_DEPARTURES_QUERY = defineQuery(/* groq */ `
  *[_type == "groupDeparture" && bookingStatus == "scheduled"] | order(startDate asc) {
    _id,
    routeName,
    durationDays,
    startDate,
    endDate,
    highlights,
    price { amount, currency },
    deposit { amount, currency },
    promotionStatus,
    originalPrice { amount, currency },
    seasonStatus,
    seasonLabel
  }
`);

export const TRIP_SEO_QUERY = defineQuery(/* groq */ `
  *[_type == "trip" && slug.current == $slug][0].seo {
    title,
    description,
    canonicalPath,
    shareImage { ${imageFields} }
  }
`);

export const TRIP_CARDS_QUERY = defineQuery(/* groq */ `
  *[_type == "trip" && defined(slug.current) && slug.current != "northern-serengeti"] | order(coalesce(trekkingDays, durationDays) asc, title asc) {
    _id,
    title,
    "slug": slug.current,
    categories,
    durationDays,
    trekkingDays,
    startingPrice { amount, currency },
    heroImage { ${imageFields} },
    "overviewImage": overviewImages[0] { ${imageFields} },
    "legacyCardImage": cardImage { ${imageFields} }
  }
`);

export const TRIP_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "trip" && defined(slug.current) && slug.current != "northern-serengeti"] | order(slug.current asc) {
    "slug": slug.current,
    _updatedAt
  }
`);
