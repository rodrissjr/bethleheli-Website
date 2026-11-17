import {accommodation} from './documents/accommodation'
import {groupDeparture} from './documents/groupDeparture'
import {trip} from './documents/trip'
import {tripSettings} from './documents/tripSettings'
import {destination} from './documents/destination'
import {contentImage} from './objects/contentImage'
import {inclusionGroup} from './objects/inclusionGroup'
import {inclusionItem} from './objects/inclusionItem'
import {itineraryDay} from './objects/itineraryDay'
import {landscape} from './objects/landscape'
import {money} from './objects/money'
import {practicalInfoItem} from './objects/practicalInfoItem'
import {relatedTripCard} from './objects/relatedTripCard'
import {seo} from './objects/seo'
import {routeStop} from './objects/routeStop'

export const schemaTypes = [
  trip,
  destination,
  accommodation,
  groupDeparture,
  tripSettings,
  contentImage,
  money,
  practicalInfoItem,
  seo,
  relatedTripCard,
  itineraryDay,
  landscape,
  inclusionGroup,
  inclusionItem,
  routeStop,
]
