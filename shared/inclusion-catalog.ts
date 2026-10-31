export type InclusionIcon =
  | 'route'
  | 'clipboard'
  | 'ticket'
  | 'mountain'
  | 'backpack'
  | 'tent'
  | 'utensils'
  | 'droplets'
  | 'heart'
  | 'message'
  | 'users'
  | 'shield'

export type InclusionCatalogItem = {
  key: string
  title: string
  description: string
  icon: InclusionIcon
}

export type InclusionCatalogGroup = {
  key: string
  marker: string
  title: string
  description: string
  items: readonly InclusionCatalogItem[]
}

export const inclusionCatalog: readonly InclusionCatalogGroup[] = [
  {
    key: 'planning',
    marker: 'PREPARATION',
    title: 'Before the journey',
    description: 'Planning and practical preparation before departure.',
    items: [
      {key: 'personal-trip-planning', icon: 'message', title: 'Personal trip planning', description: 'Route planning shaped around your dates, priorities and travel style.'},
      {key: 'pre-trip-briefing', icon: 'clipboard', title: 'Pre-trip briefing', description: 'A practical briefing covering the itinerary and final arrangements.'},
      {key: 'equipment-check', icon: 'backpack', title: 'Equipment check', description: 'A review of the clothing and equipment needed for the journey.'},
      {key: 'packing-list', icon: 'clipboard', title: 'Packing list', description: 'A practical packing guide for the selected itinerary.'},
      {key: 'visa-travel-guidance', icon: 'message', title: 'Visa and travel guidance', description: 'General pre-arrival guidance for entry and travel preparation.'},
    ],
  },
  {
    key: 'transport',
    marker: 'TRANSPORT',
    title: 'Transfers and transport',
    description: 'Road, airport and route transport included in the package.',
    items: [
      {key: 'airport-transfers', icon: 'route', title: 'Airport transfers', description: 'Arrival and departure transfers between the airport and the agreed hotel.'},
      {key: 'trailhead-transfers', icon: 'route', title: 'Trailhead transfers', description: 'Road transfers between the agreed base hotel and the trailhead.'},
      {key: 'private-safari-vehicle', icon: 'route', title: 'Private 4×4 safari vehicle', description: 'A private safari vehicle for the confirmed route and game drives.'},
      {key: 'shared-safari-vehicle', icon: 'route', title: 'Shared 4×4 safari vehicle', description: 'A shared safari vehicle for the confirmed group itinerary.'},
      {key: 'domestic-flight', icon: 'ticket', title: 'Domestic flight', description: 'The domestic flight specifically listed in the confirmed itinerary.'},
      {key: 'ferry-tickets', icon: 'ticket', title: 'Ferry tickets', description: 'Ferry tickets specifically listed in the confirmed itinerary.'},
      {key: 'zanzibar-transfers', icon: 'route', title: 'Zanzibar transfers', description: 'Road transfers in Zanzibar as listed in the itinerary.'},
    ],
  },
  {
    key: 'accommodation',
    marker: 'ACCOMMODATION',
    title: 'Places to stay',
    description: 'Overnight stays included in the confirmed package.',
    items: [
      {key: 'pre-trip-hotel', icon: 'tent', title: 'Pre-trip hotel stay', description: 'An optional hotel night before the main journey, useful before a safari or climb. Post-trip accommodation is arranged only when needed.'},
      {key: 'pre-post-trip-hotel', icon: 'tent', title: 'Pre- and post-trip hotel stay', description: 'Hotel nights before or after the main journey as listed in the itinerary.'},
      {key: 'mountain-camping', icon: 'tent', title: 'Mountain camping accommodation', description: 'Tented accommodation and shared camping equipment on the mountain.'},
      {key: 'mountain-huts', icon: 'tent', title: 'Mountain hut accommodation', description: 'Shared mountain huts on routes where hut accommodation is used.'},
      {key: 'safari-lodges-camps', icon: 'tent', title: 'Safari lodges and camps', description: 'Safari accommodation selected for the confirmed package.'},
      {key: 'zanzibar-hotel', icon: 'tent', title: 'Zanzibar hotel accommodation', description: 'Hotel or resort nights in Zanzibar as listed in the itinerary.'},
    ],
  },
  {
    key: 'team',
    marker: 'GUIDING AND STAFF',
    title: 'Your professional team',
    description: 'Local professionals supporting the journey.',
    items: [
      {key: 'mountain-guide', icon: 'users', title: 'Professional mountain guide', description: 'An experienced mountain guide for the confirmed climbing route.'},
      {key: 'assistant-guides', icon: 'users', title: 'Assistant mountain guides', description: 'Assistant guides provided according to the group size and route requirements.'},
      {key: 'porters', icon: 'users', title: 'Mountain porters', description: 'A porter team supporting the climb and carrying expedition equipment.'},
      {key: 'mountain-cook', icon: 'utensils', title: 'Mountain cook', description: 'A cook preparing the included meals during the climb.'},
      {key: 'safari-guide', icon: 'users', title: 'Professional safari guide', description: 'A professional driver-guide throughout the confirmed safari route.'},
      {key: 'zanzibar-guide', icon: 'users', title: 'Local Zanzibar guide', description: 'A local guide for the Zanzibar activities listed in the itinerary.'},
    ],
  },
  {
    key: 'meals',
    marker: 'MEALS AND WATER',
    title: 'Meals and refreshments',
    description: 'Food and drinking water supplied as part of the package.',
    items: [
      {key: 'full-board-meals', icon: 'utensils', title: 'Full-board meals', description: 'Breakfast, lunch and dinner as listed for each itinerary day.'},
      {key: 'breakfast', icon: 'utensils', title: 'Breakfast', description: 'Breakfast on the days specifically listed in the itinerary.'},
      {key: 'lunch-box', icon: 'utensils', title: 'Lunch box', description: 'A packed lunch on the days specifically listed in the itinerary.'},
      {key: 'drinking-water', icon: 'droplets', title: 'Drinking water', description: 'Drinking water supplied during the activities listed in the itinerary.'},
      {key: 'dietary-support', icon: 'heart', title: 'Dietary requirement support', description: 'Advance coordination of dietary requirements where available.'},
    ],
  },
  {
    key: 'fees',
    marker: 'FEES AND ACTIVITIES',
    title: 'Entry fees and experiences',
    description: 'Confirmed fees and guided activities included in the price.',
    items: [
      {key: 'park-conservation-fees', icon: 'ticket', title: 'Park and conservation fees', description: 'Applicable entry and conservation fees for the confirmed route.'},
      {key: 'camping-hut-fees', icon: 'ticket', title: 'Camping or hut fees', description: 'Applicable camping or mountain hut fees for the confirmed route.'},
      {key: 'rescue-fees', icon: 'ticket', title: 'Mountain rescue fees', description: 'Applicable mountain rescue fees included with the climbing permit.'},
      {key: 'game-drives', icon: 'route', title: 'Safari game drives', description: 'Game drives listed in the confirmed day-by-day itinerary.'},
      {key: 'night-game-drive', icon: 'route', title: 'Night game drive', description: 'An authorised night game drive where specifically listed in the itinerary.'},
      {key: 'crater-service-fee', icon: 'ticket', title: 'Ngorongoro Crater service fee', description: 'The crater service fee when a crater game drive is included.'},
      {key: 'walking-safari', icon: 'users', title: 'Guided walking safari', description: 'A guided walking safari with the required local guide or ranger.'},
      {key: 'cultural-visit', icon: 'users', title: 'Community and cultural visit', description: 'The respectful community or cultural experience listed in the itinerary.'},
      {key: 'hot-air-balloon-safari', icon: 'ticket', title: 'Hot-air balloon safari', description: 'A sunrise hot-air balloon flight and the associated experience listed in the itinerary.'},
      {key: 'stone-town-tour', icon: 'route', title: 'Stone Town tour', description: 'A guided Stone Town experience as listed in the itinerary.'},
      {key: 'spice-farm-tour', icon: 'route', title: 'Spice farm tour', description: 'A guided Zanzibar spice farm visit as listed in the itinerary.'},
      {key: 'snorkelling-experience', icon: 'droplets', title: 'Snorkelling experience', description: 'A guided snorkelling activity as listed in the itinerary.'},
    ],
  },
  {
    key: 'equipment',
    marker: 'EQUIPMENT',
    title: 'Expedition equipment',
    description: 'Shared or personal equipment supplied for the journey.',
    items: [
      {key: 'sleeping-mat', icon: 'tent', title: 'Sleeping mat', description: 'A sleeping mat supplied for the mountain camping itinerary.'},
      {key: 'mess-dining-tent', icon: 'tent', title: 'Mess and dining tent', description: 'A shared dining tent supplied on supported camping routes.'},
      {key: 'private-toilet-tent', icon: 'tent', title: 'Private toilet tent', description: 'A private portable toilet tent for the climbing group.'},
      {key: 'duffel-bag', icon: 'backpack', title: 'Expedition duffel bag', description: 'A duffel bag supplied for porter-carried mountain equipment.'},
      {key: 'safety-equipment', icon: 'shield', title: 'Mountain safety equipment', description: 'First-aid and communication equipment carried by the mountain team.'},
      {key: 'emergency-oxygen', icon: 'shield', title: 'Emergency oxygen', description: 'Emergency oxygen carried by the mountain team.'},
    ],
  },
  {
    key: 'support',
    marker: 'SAFETY AND SUPPORT',
    title: 'Support throughout',
    description: 'Practical care and local coordination during the journey.',
    items: [
      {key: 'first-aid-kit', icon: 'shield', title: 'First-aid kit', description: 'A first-aid kit carried by the guiding team.'},
      {key: 'amref-evacuation-cover', icon: 'shield', title: 'AMREF evacuation cover', description: 'AMREF evacuation cover when specifically included in the package.'},
      {key: 'local-trip-coordination', icon: 'message', title: 'Local trip coordination', description: 'Day-to-day coordination by the Betheli Expeditions team.'},
      {key: 'emergency-contact-support', icon: 'shield', title: 'Emergency contact support', description: 'Access to the local operations contact during the journey.'},
      {key: 'government-taxes', icon: 'ticket', title: 'Government taxes', description: 'Applicable government taxes included in the confirmed package price.'},
    ],
  },
]

export const inclusionServiceOptions = inclusionCatalog.flatMap((group) =>
  group.items.map((item) => ({
    title: `${group.marker} — ${item.title}`,
    value: item.key,
  })),
)

export function buildInclusionGroups(selectedKeys: readonly string[] | null | undefined) {
  const selected = new Set(selectedKeys || [])

  return inclusionCatalog
    .map((group) => ({
      key: group.key,
      marker: group.marker,
      title: group.title,
      description: group.description,
      items: group.items.filter((item) => selected.has(item.key)).map((item) => ({...item})),
    }))
    .filter((group) => group.items.length > 0)
    .map((group, groupIndex) => ({
      ...group,
      marker: `${String(groupIndex + 1).padStart(2, '0')} / ${group.marker}`,
    }))
}
