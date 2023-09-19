import LocalizedStrings from 'react-localization'
import * as LangHelper from '../common/LangHelper'

const strings = new LocalizedStrings({
  fr: {
    CANCELLATION: 'Annulation',
    CANCELLATION_TOOLTIP: 'La réservation peut être annulée avant la date de commencement de la location.',
    INCLUDED: 'Inclus',
    AVAILABLE: 'Disponile',
    UNAVAILABLE: 'Indisponible',
    VIEW: 'Voir',
    EMPTY_LIST: 'Pas de propriétés.',
    AVAILABILITY: 'Disponibilité',
    PRICE_DAYS_PART_1: 'Prix pour',
    PRICE_DAYS_PART_2: 'jour',
    PRICE_PER_DAY: 'Prix par jour :',
    HOUSE: 'Maison',
    APARTMENT: 'Appartement',
    PLOT: 'Terrain',
    FARM: 'Ferme',
    COMMERCIAL: 'Local commercial',
    INDUSTRIAL: 'Local industriel',
    TOWN_HOUSE: 'Maison de ville',
    AIRCON_TOOLTIP: 'Cette propriété dispose de la climatisation',
    TOOLTIP_1: 'Cette propriété a ',
    BEDROOMS_TOOLTIP_1: 'chambre à coucher',
    BEDROOMS_TOOLTIP_2: 'chambres à coucher',
    BATHROOMS_TOOLTIP_1: 'salle de bain à coucher',
    BATHROOMS_TOOLTIP_2: 'salles de bain à coucher',
    KITCHENS_TOOLTIP_1: 'cuisine',
    PARKING_SPACES_TOOLTIP_1: 'place à de parking',
    PARKING_SPACES_TOOLTIP_2: 'places à de parking',
    FURNISHED_TOOLTIP: 'Ce bien est meublé',
    YEARS: 'ans',
    BOOK: 'Réserver',
    PETS_ALLOWED_TOOLTIP: 'Animaux domestiques autorisés',
  },
  en: {
    CANCELLATION: 'Cancellation',
    CANCELLATION_TOOLTIP: 'The booking can be canceled before the start date of the rental.',
    INCLUDED: 'Included',
    AVAILABLE: 'Available',
    UNAVAILABLE: 'Unavailable',
    VIEW: 'View',
    EMPTY_LIST: 'No properties.',
    AVAILABILITY: 'Availablity',
    PRICE_DAYS_PART_1: 'Price for',
    PRICE_DAYS_PART_2: 'day',
    PRICE_PER_DAY: 'Price per day:',
    HOUSE: 'House',
    APARTMENT: 'Apartment',
    PLOT: 'Plot',
    FARM: 'Famr',
    COMMERCIAL: 'Commercial',
    INDUSTRIAL: 'Industrial',
    TOWN_HOUSE: 'Town House',
    AIRCON_TOOLTIP: 'This property has aircon',
    TOOLTIP_1: 'This property has ',
    BEDROOMS_TOOLTIP_1: 'bedroom',
    BEDROOMS_TOOLTIP_2: '',
    BATHROOMS_TOOLTIP_1: 'bathroom',
    BATHROOMS_TOOLTIP_2: '',
    KITCHENS_TOOLTIP_1: 'kitchen',
    PARKING_SPACES_TOOLTIP_1: 'parking place',
    PARKING_SPACES_TOOLTIP_2: '',
    FURNISHED_TOOLTIP: 'This property is furnished',
    YEARS: 'years',
    BOOK: 'Book now',
    PETS_ALLOWED_TOOLTIP: 'Pets allowed',
  },
})

LangHelper.setLanguage(strings)
export { strings }
