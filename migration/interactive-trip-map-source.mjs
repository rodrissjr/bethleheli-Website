export const interactiveTripMapSource = {
  tripSlug: '7-day-northern-tanzania-safari-mara-river-crossing',
  destinations: [
    {
      slug: 'arusha',
      title: 'Arusha',
      location: {lat: -3.3869, lng: 36.683},
      summary: 'Arrival, briefing and the northern circuit starting point.',
    },
    {
      slug: 'tarangire-national-park',
      title: 'Tarangire National Park',
      location: {lat: -3.8333, lng: 36.0},
      summary: 'Baobab country, river habitat and an unhurried first game drive.',
    },
    {
      slug: 'ngorongoro-crater',
      title: 'Ngorongoro Crater',
      location: {lat: -3.1618, lng: 35.5877},
      summary: 'Descend into the crater for a remarkable day of wildlife viewing.',
    },
    {
      slug: 'central-serengeti',
      title: 'Central Serengeti',
      location: {lat: -2.3333, lng: 34.8333},
      summary: 'Open plains, kopjes and classic Serengeti game-viewing country.',
    },
    {
      slug: 'northern-serengeti',
      title: 'Northern Serengeti',
      location: {lat: -1.504, lng: 34.738},
      summary: 'Northern plains and the Mara River region, explored according to wildlife movement.',
    },
  ],
  routeStops: [
    {destinationSlug: 'arusha', dayLabel: 'Day 1', markerLabel: '01', destinationPageLink: '/contact'},
    {destinationSlug: 'tarangire-national-park', dayLabel: 'Day 2', markerLabel: '02', destinationPageLink: '/safari'},
    {destinationSlug: 'ngorongoro-crater', dayLabel: 'Day 3', markerLabel: '03', destinationPageLink: '/safari'},
    {destinationSlug: 'central-serengeti', dayLabel: 'Day 4', markerLabel: '04', destinationPageLink: '/safari'},
    {destinationSlug: 'northern-serengeti', dayLabel: 'Days 5–6', markerLabel: '05', destinationPageLink: '/safari'},
  ],
}
