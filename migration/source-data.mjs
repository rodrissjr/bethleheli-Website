const image = (path, alt) => ({path: `public/images/${path}`, alt})

const gallery = (directory, files, propertyName) =>
  files.map((file, index) =>
    image(`accommodations/gallery/${directory}/${file}`, `${propertyName} accommodation image ${index + 1}`),
  )

export const source = {
  inventory: {
    source: 'Existing hardcoded React content and local public/images assets',
    locales: ['en'],
    publishingScope: 'Published content only; the source has no draft or version history.',
    listingCardsFound: 8,
    detailedTripsFound: 1,
    skippedListingCards: 7,
    skippedReason:
      'These cards intentionally redirect to /trips/northern-serengeti and have no unique itinerary content. No fake trip documents are created.',
  },
  tripSettings: {
    map: image('tanzania-national-parks-map.png', 'Map of Tanzania showing its national parks'),
  },
  accommodations: [
    {
      propertyName: 'Mount Meru Hotel',
      slug: 'mount-meru-hotel',
      tier: 'midRange',
      style: 'hotel',
      destinationGroup: 'safariMainland',
      location: 'Arusha',
      description: 'An Arusha hotel option used before or after the Northern Serengeti safari.',
      coverImage: image('accommodations/mount-meru-hotel.jpg', 'Mount Meru Hotel in Arusha'),
      gallery: gallery(
        'mainland/Midrange/mount_meru_hotel',
        ['01_mount_meru_hotel_arusha.jpg', '02_mount_meru_hotel_arusha.jpg'],
        'Mount Meru Hotel',
      ),
    },
    {
      propertyName: 'Arusha Coffee Lodge',
      slug: 'arusha-coffee-lodge',
      tier: 'luxury',
      style: 'gardenLodge',
      destinationGroup: 'safariMainland',
      location: 'Arusha',
      description: 'A luxury lodge option in Arusha for the arrival night before safari.',
      coverImage: image('accommodations/arusha-coffee-lodge.jpg', 'Arusha Coffee Lodge'),
      gallery: gallery(
        'mainland/Luxury/arusha_coffee_lodge',
        ['01_arusha_coffee_lodge.jpg', '02_arusha_coffee_lodge.jpg'],
        'Arusha Coffee Lodge',
      ),
    },
    {
      propertyName: 'Arumeru River Lodge',
      slug: 'arumeru-river-lodge',
      tier: 'midRange',
      style: 'gardenLodge',
      destinationGroup: 'safariMainland',
      location: 'Arusha',
      description: 'A comfortable green lodge option used around the Tarangire stage of the safari.',
      coverImage: image('accommodations/arumeru-river-lodge.jpg', 'Guest room at Arumeru River Lodge'),
      gallery: gallery(
        'mainland/Midrange/arumeru_river_lodge',
        ['01_arumeru_river_lodge.jpg', '02_arumeru_river_lodge.jpg'],
        'Arumeru River Lodge',
      ),
    },
    {
      propertyName: 'Nimali Tarangire',
      slug: 'nimali-tarangire',
      tier: 'luxury',
      style: 'safariCamp',
      destinationGroup: 'safariMainland',
      location: 'Tarangire',
      description: 'A luxury safari accommodation option for the Tarangire stage of the itinerary.',
      coverImage: image('accommodations/nimali-tarangire.webp', 'Nimali Tarangire safari lodge'),
      gallery: gallery(
        'mainland/Luxury/nimali_serengeti_tarangire',
        ['01_nimali_serengeti_and_nimali_tarangire.jpg', '02_nimali_serengeti_and_nimali_tarangire.webp'],
        'Nimali Tarangire',
      ),
    },
    {
      propertyName: 'Lake Masek Tented Lodge',
      slug: 'lake-masek-tented-lodge',
      tier: 'midRange',
      style: 'tentedSuite',
      destinationGroup: 'safariMainland',
      location: 'Ngorongoro / Ndutu',
      description: 'A mid-range tented lodge option for the Ngorongoro stage of the safari.',
      coverImage: image('accommodations/lake-masek-tented-lodge.jpg', 'Lake Masek Tented Lodge'),
      gallery: gallery(
        'mainland/Midrange/lake_masek_tented_lodge',
        ['01_lake_masek_tented_lodge.jpg', '02_lake_masek_tented_lodge.jpg'],
        'Lake Masek Tented Lodge',
      ),
    },
    {
      propertyName: 'Neptune Ngorongoro Luxury Lodge',
      slug: 'neptune-ngorongoro-luxury-lodge',
      tier: 'luxury',
      style: 'forestLodge',
      destinationGroup: 'safariMainland',
      location: 'Ngorongoro',
      description: 'A luxury highlands lodge option for the Ngorongoro stage of the safari.',
      coverImage: image('accommodations/neptune-ngorongoro.webp', 'Neptune Ngorongoro Luxury Lodge'),
      gallery: gallery(
        'mainland/Luxury/neptune_ngorongoro',
        ['01_neptune_ngorongoro_luxury_lodge.webp', '02_neptune_ngorongoro_luxury_lodge.jpg'],
        'Neptune Ngorongoro Luxury Lodge',
      ),
    },
    {
      propertyName: 'Karibu River Camp',
      slug: 'karibu-river-camp',
      tier: 'midRange',
      style: 'safariCamp',
      destinationGroup: 'safariMainland',
      location: 'Serengeti',
      description: 'A mid-range tented safari camp used for the Central and Northern Serengeti stages.',
      coverImage: image('accommodations/karibu-river-camp.jpg', 'Karibu River Camp tented suite'),
      gallery: gallery(
        'mainland/Midrange/karibu_camps',
        ['01_karibu_river_camp_serengeti.jpg', '02_karibu_river_camp_serengeti.jpg'],
        'Karibu River Camp',
      ),
    },
    {
      propertyName: 'Meliá Serengeti Lodge',
      slug: 'melia-serengeti-lodge',
      tier: 'luxury',
      style: 'forestLodge',
      destinationGroup: 'safariMainland',
      location: 'Serengeti',
      description: 'A luxury lodge option for the Central Serengeti stage of the safari.',
      coverImage: image('accommodations/melia-serengeti-lodge.jpg', 'Meliá Serengeti Lodge'),
      gallery: gallery(
        'mainland/Luxury/meli_serengeti_ngorongoro',
        ['01_meli_serengeti_lodge_and_ngorongoro_lodge.jpg', '02_meli_serengeti_lodge_and_ngorongoro_lodge.jpg'],
        'Meliá Serengeti Lodge',
      ),
    },
    {
      propertyName: 'Lemala Kuria Hills',
      slug: 'lemala-kuria-hills',
      tier: 'luxury',
      style: 'tentedSuite',
      destinationGroup: 'safariMainland',
      location: 'Northern Serengeti',
      description: 'A luxury accommodation option for the Northern Serengeti stage of the safari.',
      coverImage: image('accommodations/lemala-kuria-hills.jpg', 'Lemala Kuria Hills accommodation'),
      gallery: gallery(
        'mainland/Luxury/lemala_camps',
        ['01_lemala_kuria_hills_lemala_camps.jpg', '02_lemala_kuria_hills_lemala_camps.jpg'],
        'Lemala Kuria Hills',
      ),
    },
    {
      propertyName: 'Gran Meliá Arusha',
      slug: 'gran-melia-arusha',
      tier: 'luxury',
      style: 'hotel',
      destinationGroup: 'safariMainland',
      location: 'Arusha',
      description: 'A luxury Arusha hotel option for the final night after safari.',
      coverImage: image('accommodations/gran-melia-arusha.jpg', 'Gran Meliá Arusha'),
      gallery: gallery(
        'mainland/Luxury/gran_meli_arusha',
        ['01_gran_meli_arusha.jpg', '02_gran_meli_arusha.jpg'],
        'Gran Meliá Arusha',
      ),
    },
  ],
  trip: {
    title: '6-Day Northern Serengeti River Crossing Safari',
    cardTitle: 'Northern Serengeti River Crossing',
    slug: 'northern-serengeti',
    categories: ['safari'],
    locationLabel: 'Safari',
    durationDays: 6,
    startingPrice: {amount: 1732, currency: 'USD'},
    cardImage: image('northern-serengeti-migration.webp', 'Wildebeest on the Northern Serengeti plains'),
    heroImage: image('northern-serengeti-migration.webp', 'Great Migration wildebeest in the Northern Serengeti'),
    heroSummary:
      'A migration-focused safari through Tarangire, Central Serengeti, Northern Serengeti and Ngorongoro, with a full day at the Mara River.',
    overviewParagraphs: [
      'Experience Tanzania’s Great Migration on this 6-day safari through Tarangire, Central Serengeti, Northern Serengeti and Ngorongoro Crater. Designed around the river-crossing season, the journey includes a full day exploring Northern Serengeti and the Mara River, where wildebeest and zebra gather in dramatic numbers.',
      'From the elephant-filled plains of Tarangire to the dramatic Mara River and the endless Serengeti, this safari brings together Tanzania’s unforgettable landscapes, diverse wildlife and the extraordinary spectacle of the Great Migration.',
    ],
    overviewImages: [
      image(
        'figma-safari-destinations-destination-photograph.png',
        'Hot-air balloons over the Serengeti at sunset',
      ),
    ],
    itineraryFor: 'Northern Serengeti Safari',
    travelDatesText: 'To be confirmed',
    guestsText: '2 Adults',
    destinations: [
      'Tarangire National Park',
      'Ngorongoro Crater',
      'Central Serengeti',
      'Northern Serengeti – Mara River',
    ],
    planningTitle: 'Experience the 6-Day Northern Serengeti Safari for yourself.',
    planningDescription:
      'Speak with a senior planner for a thoughtful first proposal built around your dates and priorities.',
    itinerary: [
      {
        title: 'Arrival',
        summary:
          'The group arrives at Kilimanjaro International Airport (JRO). A Betheli Expeditions representative meets you and transfers you to your hotel in Arusha.',
        image: image(
          'figma-safari-destinations-destination-photograph4.png',
          'Giraffes near Mount Meru outside Arusha',
        ),
        experience:
          'Settle in, meet your travel team and take time to rest after your flight. Your guide will confirm the following morning’s departure, luggage arrangements and the rhythm of the safari ahead.',
        mealPlan: 'halfBoard',
        accommodationSlugs: ['mount-meru-hotel', 'arusha-coffee-lodge'],
      },
      {
        title: 'Tarangire National Park',
        summary:
          'Leave Arusha for Tarangire National Park, a landscape of baobabs, open grassland and elephant herds. Timings and activities are confirmed with your guide.',
        image: image(
          'figma-safari-destinations-destination-photograph2.png',
          'Elephants gathering at the Tarangire River',
        ),
        experience:
          'Enjoy an unhurried first game drive as you get used to the vehicle and the pace of safari days. Tarangire’s river and ancient baobabs create a beautiful setting for watching wildlife in the afternoon light.',
        mealPlan: 'fullBoard',
        accommodationSlugs: ['arumeru-river-lodge', 'nimali-tarangire'],
      },
      {
        title: 'Ngorongoro Crater',
        summary:
          'Travel to the Ngorongoro Conservation Area and descend into the crater to explore one of East Africa’s most remarkable wildlife habitats.',
        image: image(
          'figma-safari-destinations-destination-photograph1.png',
          'Ngorongoro Crater landscape',
        ),
        experience:
          'The crater floor brings grassland, woodland and lake edges into one extraordinary day. Your guide follows wildlife movement and road conditions, leaving room for quiet observation as well as classic big-game sightings.',
        mealPlan: 'fullBoard',
        accommodationSlugs: ['lake-masek-tented-lodge', 'neptune-ngorongoro-luxury-lodge'],
      },
      {
        title: 'Central Serengeti',
        summary:
          'Continue into the Serengeti, with game viewing along the way as the landscape opens into long horizons and kopjes.',
        image: image('figma-trips-lion-photo.png', 'Lion in the Central Serengeti'),
        experience:
          'Arriving in the central plains is part of the experience: every transfer can become a game drive. Keep your camera ready for lions, giraffe, zebra and the smaller moments that make the Serengeti feel alive.',
        mealPlan: 'fullBoard',
        accommodationSlugs: ['karibu-river-camp', 'melia-serengeti-lodge'],
      },
      {
        title: 'Northern Serengeti',
        summary:
          'Explore Northern Serengeti and the Mara River region, where seasonal migration movements shape the day’s route.',
        image: image(
          'figma-safari-packages-trip-card1.png',
          'Wildebeest and zebra in Northern Serengeti',
        ),
        experience:
          'Spend time around the northern plains and river country with the flexibility to follow wildlife. From July to October, wildebeest and zebra may gather near the Mara River, but crossings and sightings are always guided by nature rather than a timetable.',
        mealPlan: 'fullBoard',
        accommodationSlugs: ['karibu-river-camp', 'lemala-kuria-hills'],
      },
      {
        title: 'Northern Serengeti to Arusha',
        summary:
          'Take a final morning in the north before beginning the return journey to Arusha. Your exact travel arrangement is confirmed with the team.',
        image: image('figma-trips-hero.png', 'Northern Tanzania safari landscape'),
        experience:
          'Use the final drive to reflect on the landscapes, wildlife and people you have met along the way. Your team can help with onward travel details and a smooth connection to the next part of your journey.',
        mealPlan: 'breakfast',
        accommodationSlugs: ['mount-meru-hotel', 'gran-melia-arusha'],
      },
    ],
    landscapesTitle: 'Landscapes of Northern Tanzania',
    landscapes: [
      {
        name: 'Tarangire',
        descriptor: 'Baobabs & elephants',
        iconKey: 'tree',
        image: image(
          'figma-safari-destinations-destination-photograph2.png',
          'Tarangire landscape on safari',
        ),
        description:
          'Tarangire combines open savannah, ancient baobabs and seasonal wildlife around the river. Game drives are paced around the day’s conditions and your group’s interests.',
      },
      {
        name: 'Ngorongoro',
        descriptor: 'Crater floor',
        iconKey: 'mountain',
        image: image(
          'figma-safari-destinations-destination-photograph1.png',
          'Ngorongoro landscape on safari',
        ),
        description:
          'The crater’s grasslands, woodland and soda lake create a compact wildlife landscape. Your guide helps shape the day around the best conditions and a respectful pace.',
      },
      {
        name: 'Central Serengeti',
        descriptor: 'Open plains',
        iconKey: 'zebra',
        image: image('figma-safari-packages-trip-card1.png', 'Central Serengeti open plains'),
        description:
          'Central Serengeti offers long horizons, resident wildlife and a strong base for game drives as the route moves north.',
      },
      {
        name: 'Northern Serengeti',
        descriptor: 'Migration country',
        iconKey: 'grass',
        image: image('figma-trips-lion-photo.png', 'Northern Serengeti on safari'),
        description:
          'Northern Serengeti is shaped by the seasonal movement of wildebeest and zebra. Exact sightings and river crossings can never be guaranteed.',
      },
      {
        name: 'Mara River',
        descriptor: 'Seasonal crossings',
        iconKey: 'water',
        image: image('figma-trips-hero.png', 'Mara River safari landscape'),
        description:
          'The Mara River is a dramatic landscape to explore with your guide. Wildlife movements, water levels and road conditions guide the day’s plan.',
      },
    ],
    inclusionsEyebrow: 'YOUR SAFARI, TAKEN CARE OF',
    inclusionsTitle: 'What’s included in your safari',
    inclusionsDescription:
      'Use this checklist when planning your enquiry. All package details are subject to confirmation in your quote.',
    inclusionGroups: [
      {
        marker: '01 / PREPARATION',
        title: 'Before your safari',
        description: 'Get ready for the journey ahead.',
        items: [
          {
            iconKey: 'route',
            title: 'Arrival and departure transfers',
            description: 'Transfers at the start and end of your trip.',
          },
          {
            iconKey: 'clipboard',
            title: 'Pre-safari briefing',
            description: 'Review your day-by-day plan and practical arrangements before setting off.',
          },
        ],
      },
      {
        marker: '02 / SAFARI DAYS',
        title: 'On safari',
        description: 'The vehicle, guiding and daily essentials.',
        items: [
          {iconKey: 'ticket', title: 'Park and conservation fees', description: 'Entry fees listed in your confirmed proposal.'},
          {iconKey: 'mountain', title: 'Professional safari guide', description: 'Local guiding throughout the route.'},
          {iconKey: 'backpack', title: '4×4 safari vehicle', description: 'A vehicle arranged for the group and itinerary.'},
          {iconKey: 'tent', title: 'Accommodation as confirmed', description: 'Lodge or camp nights selected for your package.'},
          {iconKey: 'utensils', title: 'Meals as listed', description: 'Meal plans confirmed for each overnight stay.'},
          {iconKey: 'droplets', title: 'Drinking water', description: 'Water provisions for safari days as confirmed.'},
        ],
      },
      {
        marker: '03 / ONGOING CARE',
        title: 'Support throughout',
        description: 'Care and coordination along the way.',
        items: [
          {iconKey: 'heart', title: 'Thoughtful pacing and practical support', description: 'Help with the day-to-day details of your journey.'},
          {iconKey: 'message', title: 'On-trip coordination and support', description: 'Help with the day-to-day details of your safari.'},
        ],
      },
    ],
    relatedTrips: [
      {title: '6-Day Machame Route', summary: 'Machame • Hard', durationLabel: '6 DAYS', image: image('figma-kili-group-trip-landscape.png', '6-Day Machame Route'), href: '/kilimanjaro/machame-route'},
      {title: '7-Day Machame Route', summary: 'Machame • Hard', durationLabel: '7 DAYS', image: image('figma-kili-group-trip-landscape1.png', '7-Day Machame Route'), href: '/kilimanjaro/machame-route'},
      {title: '7-Day Lemosho Route', summary: 'Lemosho • Moderate–hard', durationLabel: '7 DAYS', image: image('figma-kili-group-trip-landscape2.png', '7-Day Lemosho Route'), href: '/kilimanjaro/lemosho-route'},
      {title: '8-Day Lemosho Route', summary: 'Lemosho • Moderate–hard', durationLabel: '8 DAYS', image: image('figma-kili-group-trip-landscape3.png', '8-Day Lemosho Route'), href: '/kilimanjaro/lemosho-route'},
    ],
    seo: {
      title: 'Northern Serengeti River Crossing Safari | Betheli',
      description:
        'Explore a six-day Northern Serengeti safari through Tarangire, Ngorongoro and the Mara River region with Betheli Expeditions.',
      canonicalPath: '/trips/northern-serengeti',
      shareImage: image('northern-serengeti-migration.webp', 'Great Migration wildebeest in the Northern Serengeti'),
    },
  },
  groupDepartures: [
    {
      routeName: 'Kilimanjaro via Lemosho route - 7 days',
      durationDays: 7,
      startDate: '2026-10-06',
      endDate: '2026-10-14',
      highlights: ['Starry sky', 'High-Altitude Drop-Off', 'Extra Summit'],
      price: {amount: 3170, currency: 'USD'},
      deposit: {amount: 100, currency: 'USD'},
      bookingStatus: 'scheduled',
      promotionStatus: 'standard',
      seasonStatus: 'standard',
    },
    {
      routeName: 'Kilimanjaro via Machame route - 7 days',
      durationDays: 7,
      startDate: '2026-10-09',
      endDate: '2026-10-17',
      highlights: ['Starts in a Tropical Forest', 'Forest Birds'],
      price: {amount: 3072, currency: 'USD'},
      deposit: {amount: 100, currency: 'USD'},
      bookingStatus: 'scheduled',
      promotionStatus: 'standard',
      seasonStatus: 'standard',
    },
    {
      routeName: 'Kilimanjaro via Rongai route - 6 days',
      durationDays: 6,
      startDate: '2026-10-10',
      endDate: '2026-10-17',
      highlights: ['Fewer hikers', 'Less Rainfall', 'Starts in a Coniferous Forest', 'For experienced hikers'],
      price: {amount: 2767, currency: 'USD'},
      deposit: {amount: 100, currency: 'USD'},
      bookingStatus: 'scheduled',
      promotionStatus: 'standard',
      seasonStatus: 'standard',
    },
    {
      routeName: 'Kilimanjaro via Marangu route - 6 days',
      durationDays: 6,
      startDate: '2026-10-30',
      endDate: '2026-11-06',
      highlights: ['Starts in a Tropical Forest', 'Forest Birds', 'Overnight Stay in Huts'],
      price: {amount: 2638, currency: 'USD'},
      deposit: {amount: 100, currency: 'USD'},
      bookingStatus: 'scheduled',
      promotionStatus: 'standard',
      seasonStatus: 'standard',
    },
    {
      routeName: 'Kilimanjaro via Machame route - 7 days',
      durationDays: 7,
      startDate: '2026-10-31',
      endDate: '2026-11-08',
      highlights: ['Starts in a Tropical Forest', 'Forest Birds'],
      price: {amount: 2765, currency: 'USD'},
      deposit: {amount: 100, currency: 'USD'},
      bookingStatus: 'scheduled',
      promotionStatus: 'discounted',
      originalPrice: {amount: 3072, currency: 'USD'},
      seasonStatus: 'rain',
      seasonLabel: 'Rain Season',
    },
  ],
}
