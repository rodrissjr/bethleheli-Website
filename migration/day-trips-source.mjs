const asset = (path, alt) => ({path: `migration/assets/day-trips/optimized/${path}`, alt})

export const dayTripsSource = {
  inventory: {
    driveFolderId: '1CWAQBl5YvbRk3PfQ2-m1SZJcgCPfTLw9',
    dayTripsFolderId: '18gRbPvuSORBRyBnXCcRXwkinKyANPfvr',
    sourceDocuments: [
      {
        id: '17sK3wjmM-znSMHyB7svPtdYAp6hWE-6e',
        name: '3- day trips content.docx',
        localPath: 'migration/assets/day-trips/source-documents/3-day-trips-content.docx',
      },
      {
        id: '14rCTgEp7oP2HnPKI2sUZBUWlg0vlB9vL',
        name: 'Kilimanjaro Day Trip via Marangu Rout3.docx',
        localPath:
          'migration/assets/day-trips/source-documents/kilimanjaro-day-trip-via-marangu-route.docx',
      },
    ],
    imageFolders: [
      {id: '1cv1XqazG0JU5bvnbi_Q9fzmWp44Wq_nO', name: 'images for chemka day trip'},
      {
        id: '1RrRIpI6QcSCz3fkbY6nYxhYDhR95FQAu',
        name: 'images for Materuni waterfalls & coffe trip',
      },
      {id: '1FSWm9q7OsOijR_MnpNzrPud__W_SlU-q', name: 'MARANGU -PHOTOS + ITINERARAY'},
    ],
    decisions: [
      'Prices were not supplied, so all four trips remain price on request.',
      'The Marangu day trip uses only the client Marangu gallery.',
      'The Drive did not include a dedicated Serval gallery; the existing website wildlife and client safari transport images are retained for that trip.',
      'All imported image files used by Sanity are below 250,000 bytes.',
    ],
  },
  trips: [
    {
      title: 'Materuni Waterfall & Coffee Day Trip',
      slug: 'materuni-waterfall-and-coffee-day-trip',
      categories: ['dayTrip'],
      durationDays: 1,
      heroImage: asset(
        'materuni/materuni-waterfall.webp',
        'Materuni Waterfall descending through the green foothills of Mount Kilimanjaro',
      ),
      overviewImages: [
        asset('materuni/materuni-coffee-hero.webp', 'Guests preparing coffee beans in Materuni village'),
        asset('materuni/materuni-coffee-pounding.webp', 'Traditional coffee pounding during the Materuni experience'),
        asset('materuni/materuni-coffee-guests.webp', 'Visitors learning about Chagga coffee traditions in Materuni'),
        asset('materuni/materuni-coffee-roasting.webp', 'Traditional coffee roasting in Materuni village'),
      ],
      heroSummary:
        'Walk beneath Kilimanjaro’s green foothills, discover Chagga coffee traditions and refresh your spirit at Materuni Waterfall.',
      overviewParagraphs: [
        'Join Betheli Expeditions for a full day of nature, culture and freshly brewed coffee in Materuni village. Departing from Arusha or Moshi, the experience combines a guided waterfall walk, a hands-on coffee-making session and a traditional local lunch.',
        'Village paths pass farmland and lush vegetation on the way to the waterfall. The trail can be muddy and slippery, so sturdy walking shoes are recommended. The order of activities may change with weather and local arrangements.',
      ],
      practicalInformation: [
        {
          title: 'Departure and duration',
          details:
            'This is a full-day private trip with return transport from an agreed hotel in Arusha or Moshi. Pickup time is confirmed with your final arrangements.',
        },
        {
          title: 'What to bring',
          details:
            'Bring comfortable walking shoes with good grip, a light rain jacket, sun protection, drinking-water bottle and a camera.',
        },
        {
          title: 'Walking conditions and fitness',
          details:
            'Moderate fitness is recommended. The waterfall trail crosses farmland and lush vegetation and can become muddy or slippery after rain.',
        },
        {
          title: 'Activity order',
          details:
            'The waterfall walk, traditional lunch and bean-to-cup coffee experience are all included, but their order may change with weather and local arrangements.',
        },
      ],
      itineraryFor: 'Nature, culture and coffee day trip',
      travelDatesText: 'Available year-round, subject to local conditions',
      guestsText: 'Private arrangements based on group size',
      destinations: ['Materuni village', 'Materuni Waterfall', 'Mount Kilimanjaro foothills'],
      planningTitle: 'Experience Materuni Waterfall and Chagga coffee culture in one day.',
      planningDescription:
        'Share your departure hotel and group size for a personalised quote from Arusha or Moshi.',
      itinerary: [
        {
          dayType: 'other',
          title: 'Materuni Waterfall, village lunch and coffee experience',
          summary:
            'Travel from Arusha or Moshi to Materuni village, walk with a local guide to the waterfall, enjoy lunch and prepare coffee from bean to cup before returning to your hotel.',
          experience:
            'Meet your local guide in Materuni and learn about Chagga life, plants and farming along the waterfall trail. After time beside the falls, return to the village for a traditional lunch and a hands-on session roasting, pounding and grinding coffee beans, accompanied by local songs and stories.',
          mealPlan: 'lunch',
          image: asset('materuni/materuni-waterfall.webp', 'Materuni Waterfall on the day-trip walking route'),
        },
      ],
      inclusionsEyebrow: 'YOUR DAY TRIP, TAKEN CARE OF',
      inclusionsTitle: 'What is included in your Materuni day trip',
      inclusionsDescription:
        'The final quote confirms pickup time and the arrangements for your group.',
      includedServiceKeys: [
        'day-trip-transfers',
        'local-day-trip-guide',
        'day-trip-entry-fees',
        'cultural-visit',
        'day-trip-lunch',
        'drinking-water',
        'local-trip-coordination',
      ],
      notIncluded: [
        'Tips and personal expenses',
        'Drinks other than those specifically listed',
        'Activities not listed in the confirmed itinerary',
      ],
      seo: {
        title: 'Materuni Waterfall & Coffee Day Trip',
        description:
          'Walk to Materuni Waterfall, learn traditional Chagga coffee making and enjoy a local lunch on a private day trip from Arusha or Moshi.',
      },
    },
    {
      title: 'Chemka Hot Springs Day Trip',
      slug: 'chemka-hot-springs-day-trip',
      categories: ['dayTrip'],
      durationDays: 1,
      heroImage: asset('chemka/chemka-springs-hero.webp', 'Clear blue water beneath trees at Chemka Hot Springs'),
      overviewImages: [
        asset('chemka/chemka-forest-pool.webp', 'The forest-framed pool at Chemka Hot Springs'),
        asset('chemka/chemka-clear-water.webp', 'Clear water and leafy banks at Chemka Hot Springs'),
        asset('chemka/chemka-shaded-pool.webp', 'A shaded swimming area at Chemka Hot Springs'),
        asset('chemka/chemka-rope-swing.webp', 'A visitor using the rope swing at Chemka Hot Springs'),
      ],
      heroSummary:
        'Slow down, float beneath the trees and enjoy a refreshing escape at Chemka Hot Springs.',
      overviewParagraphs: [
        'Discover Chemka Hot Springs, also known as Kikuletwa Hot Springs, on a relaxing full-day trip from Arusha or Moshi. Clear water and leafy surroundings offer a peaceful break before or after a safari or Kilimanjaro climb.',
        'Despite the name, the water is refreshing rather than hot. Some areas are deep, so guests should enter only where they feel comfortable and follow local safety guidance. Children and non-swimmers require close supervision.',
      ],
      practicalInformation: [
        {
          title: 'Departure and duration',
          details:
            'This is a full-day private trip with return transport from an agreed hotel in Arusha or Moshi. The final road section to the springs is unpaved.',
        },
        {
          title: 'What to bring',
          details:
            'Pack swimwear, a towel, sandals or water shoes, sun protection, a change of clothes and a refillable drinking-water bottle.',
        },
        {
          title: 'Swimming safety',
          details:
            'The spring water is refreshing rather than hot and some areas are deep. Enter only where you feel comfortable; children and non-swimmers require close supervision.',
        },
        {
          title: 'Your day at Chemka',
          details:
            'There is time to swim, use the shaded banks, take photographs and enjoy the included picnic lunch before the afternoon return journey.',
        },
      ],
      itineraryFor: 'Swimming and relaxation day trip',
      travelDatesText: 'Available year-round, subject to road and local conditions',
      guestsText: 'Private arrangements based on group size',
      destinations: ['Chemka Hot Springs', 'Kikuletwa'],
      planningTitle: 'Add a refreshing Chemka escape to your Tanzania journey.',
      planningDescription:
        'Share your departure hotel and group size for a personalised quote from Arusha or Moshi.',
      itinerary: [
        {
          dayType: 'other',
          title: 'Chemka Hot Springs swimming and picnic',
          summary:
            'Travel through the countryside to Chemka, swim or relax beneath the trees, enjoy a picnic lunch and return to Arusha or Moshi in the afternoon.',
          experience:
            'The final stretch follows an unpaved road before you arrive at the springs. Spend unhurried time swimming, relaxing in the shade and photographing the clear pool, then enjoy a picnic lunch before the return drive.',
          mealPlan: 'lunch',
          image: asset('chemka/chemka-rope-swing.webp', 'Rope swing beside the clear water at Chemka Hot Springs'),
        },
      ],
      inclusionsEyebrow: 'YOUR DAY TRIP, TAKEN CARE OF',
      inclusionsTitle: 'What is included in your Chemka day trip',
      inclusionsDescription:
        'The final quote confirms pickup time and the arrangements for your group.',
      includedServiceKeys: [
        'day-trip-transfers',
        'day-trip-entry-fees',
        'day-trip-lunch',
        'drinking-water',
        'local-trip-coordination',
      ],
      notIncluded: [
        'Additional drinks',
        'Equipment hire, if required',
        'Tips and personal expenses',
        'Activities not listed in the confirmed itinerary',
      ],
      seo: {
        title: 'Chemka Hot Springs Day Trip',
        description:
          'Swim and relax at clear, tree-lined Chemka Hot Springs with return transport, entry, picnic lunch and drinking water from Arusha or Moshi.',
      },
    },
    {
      title: 'Serval Wildlife Day Trip',
      slug: 'serval-wildlife-day-trip',
      categories: ['dayTrip', 'safari'],
      durationDays: 1,
      heroImage: asset('serval/serval-wildlife-hero.png', 'Cheetahs in northern Tanzania wildlife country'),
      overviewImages: [
        asset('serval/serval-wildlife-overview.webp', 'Zebra crossing open grassland in northern Tanzania'),
        asset('serval/serval-transfer.webp', 'Betheli Expeditions safari vehicle used for day-trip transport'),
      ],
      heroSummary:
        'Step into a green retreat in the foothills of Mount Kilimanjaro and discover Tanzania’s wildlife from a different perspective.',
      overviewParagraphs: [
        'Visit Serval Wildlife in the Siha area on a day trip from Arusha or Moshi, combining a scheduled guided wildlife experience, photography and time to relax in the green foothills of Mount Kilimanjaro.',
        'The on-site team provides a briefing and explains the animals in their care. Guests must follow staff instructions throughout the visit. Encounters depend on animal welfare and facility rules, so specific interactions cannot be guaranteed.',
      ],
      practicalInformation: [
        {
          title: 'Departure and duration',
          details:
            'Return private transfers are arranged from an agreed hotel in Arusha or Moshi. Entry time depends on the facility’s confirmed availability.',
        },
        {
          title: 'What to bring',
          details:
            'Wear comfortable shoes and bring sun protection, a refillable drinking-water bottle and a camera. Avoid flash photography and follow staff guidance.',
        },
        {
          title: 'Animal welfare and encounters',
          details:
            'The guided experience follows the facility’s current animal-welfare rules. Specific animal interactions cannot be promised and may change on the day.',
        },
        {
          title: 'Meals',
          details:
            'Lunch and additional drinks are not included. An optional lunch may be arranged when availability and timing allow.',
        },
      ],
      itineraryFor: 'Guided wildlife experience and photography',
      travelDatesText: 'Available year-round, subject to facility availability',
      guestsText: 'Private transfers based on group size',
      destinations: ['Serval Wildlife', 'Siha', 'Mount Kilimanjaro foothills'],
      planningTitle: 'Plan a relaxed wildlife day in the Kilimanjaro foothills.',
      planningDescription:
        'Share your departure hotel, preferred date and group size so the team can confirm availability and quote.',
      itinerary: [
        {
          dayType: 'other',
          title: 'Transfer to Serval Wildlife and guided visit',
          summary:
            'Travel from your Arusha or Moshi hotel to Serval Wildlife, join the scheduled guided experience and return after the visit.',
          experience:
            'Enjoy countryside views on the journey to Siha. After the on-site briefing, learn about the animals in the facility’s care and take photographs where permitted. An optional lunch may be arranged before the return transfer.',
          image: asset('serval/serval-transfer.webp', 'Betheli Expeditions vehicle ready for a northern Tanzania day trip'),
        },
      ],
      inclusionsEyebrow: 'YOUR DAY TRIP, TAKEN CARE OF',
      inclusionsTitle: 'What is included in your Serval Wildlife day trip',
      inclusionsDescription:
        'The final quote confirms entry availability, pickup time and the arrangements for your group.',
      includedServiceKeys: [
        'day-trip-transfers',
        'local-day-trip-guide',
        'day-trip-entry-fees',
        'drinking-water',
        'local-trip-coordination',
      ],
      notIncluded: [
        'Lunch and additional drinks',
        'Tips and personal expenses',
        'Activities or animal encounters not listed in the confirmed itinerary',
      ],
      seo: {
        title: 'Serval Wildlife Day Trip from Arusha or Moshi',
        description:
          'Visit Serval Wildlife in the Kilimanjaro foothills with return transfers and a scheduled guided wildlife experience from Arusha or Moshi.',
      },
    },
    {
      title: 'Kilimanjaro Day Trip via Marangu Route',
      slug: 'kilimanjaro-day-trip-via-marangu-route',
      categories: ['dayTrip', 'kilimanjaro'],
      durationDays: 1,
      trekkingDays: 1,
      routeDistanceKm: 16,
      heroImage: asset('marangu/marangu-day-hike-hero.webp', 'Hikers on the Marangu Route on Mount Kilimanjaro'),
      overviewImages: [
        asset('marangu/marangu-rainforest.webp', 'Marangu Route rainforest on Mount Kilimanjaro'),
        asset('marangu/marangu-trail.webp', 'Hikers following the Marangu Route trail'),
        asset('marangu/mandara-hut.webp', 'Mandara Hut on the Marangu Route'),
      ],
      heroSummary:
        'Experience the spirit of Mount Kilimanjaro in a single day on a guided rainforest hike from Marangu Gate to Mandara Hut.',
      overviewParagraphs: [
        'Walk beneath the rainforest canopy, listen to birdsong and follow the legendary Marangu Route with Betheli Expeditions. This rewarding day hike offers a genuine taste of Africa’s highest mountain without attempting the summit.',
        'The return hike covers approximately 16 kilometres and normally takes 6–8 hours, depending on pace and conditions. Mandara Hut sits at roughly 2,720 metres. Weather, daylight and guest wellbeing determine the final turnaround point.',
      ],
      practicalInformation: [
        {
          title: 'Route facts',
          details:
            'The guided route runs from Marangu Gate to Mandara Hut and back: approximately 16 km return, 6–8 hours of hiking and a highest point of about 2,720 metres. Difficulty is moderate.',
        },
        {
          title: 'What to bring',
          details:
            'Bring sturdy hiking shoes, a daypack, rain jacket, warm layer, sun hat, sunscreen and a refillable drinking-water bottle.',
        },
        {
          title: 'Trail and turnaround',
          details:
            'Rainforest paths can be wet and slippery. The guide adjusts pace and the turnaround point for weather, daylight and guest wellbeing; this day hike does not reach Uhuru Peak.',
        },
        {
          title: 'Departure timing',
          details:
            'Pickup is early from Moshi and earlier from Arusha so there is enough time for park registration, the ascent, picnic lunch and a safe descent before dark.',
        },
      ],
      itineraryFor: 'Moderate Kilimanjaro rainforest day hike',
      travelDatesText: 'Available year-round, subject to park and trail conditions',
      guestsText: 'Private arrangements based on group size',
      destinations: ['Marangu Gate', 'Mandara Hut', 'Mount Kilimanjaro rainforest'],
      planningTitle: 'Take your first steps on Kilimanjaro via the Marangu Route.',
      planningDescription:
        'Share your departure hotel, date and group size so the team can confirm park arrangements and quote.',
      itinerary: [
        {
          dayType: 'trekking',
          title: 'Marangu Gate to Mandara Hut and return',
          summary:
            'Transfer from Moshi or Arusha to Marangu Gate, complete park registration and hike through rainforest to Mandara Hut before descending to the gate.',
          experience:
            'Follow a professional mountain guide beneath towering trees, ferns and moss-covered branches while looking for monkeys and forest birds. Enjoy a packed picnic lunch at Mandara Hut. If time, weather and energy allow, the guide may include a short walk towards Maundi Crater before the descent.',
          mealPlan: 'lunch',
          image: asset('marangu/marangu-rainforest.webp', 'Hikers walking through the Marangu Route rainforest'),
        },
      ],
      inclusionsEyebrow: 'YOUR DAY HIKE, TAKEN CARE OF',
      inclusionsTitle: 'What is included in your Marangu day hike',
      inclusionsDescription:
        'The final quote confirms pickup time, park arrangements and the services for your group.',
      includedServiceKeys: [
        'day-trip-transfers',
        'mountain-guide',
        'park-conservation-fees',
        'day-trip-lunch',
        'drinking-water',
        'local-trip-coordination',
      ],
      notIncluded: [
        'Hotel accommodation and airport transfers',
        'Flights and visa fees',
        'Travel insurance covering hiking activities',
        'Personal hiking equipment and clothing',
        'Tips and personal expenses',
        'Meals and drinks not specifically listed',
      ],
      seo: {
        title: 'Kilimanjaro Marangu Route Day Hike',
        description:
          'Hike from Marangu Gate to Mandara Hut through Kilimanjaro rainforest on a guided 16 km day trip with transfers, park fees and picnic lunch.',
      },
    },
  ],
}
