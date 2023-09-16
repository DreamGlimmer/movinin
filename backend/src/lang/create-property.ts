import LocalizedStrings from 'react-localization'
import Env from '../config/env.config'
import * as LangHelper from '../common/LangHelper'

const strings = new LocalizedStrings({
  fr: {
    NEW_PROPERTY_HEADING: 'Nouvelle propriété',
    NAME: 'Nom',
    PROPERTY_IMAGE_SIZE_ERROR: `L'image doit être au format ${Env.PROPERTY_IMAGE_WIDTH}x${Env.PROPERTY_IMAGE_HEIGHT}`,
    RECOMMENDED_IMAGE_SIZE: `Taille d'image recommandée : ${Env.PROPERTY_IMAGE_WIDTH}x${Env.PROPERTY_IMAGE_HEIGHT}`,
    AGENCY: 'Agency',
    LOCATION: 'Locatlisation',
    AVAILABLE: 'Disponible à la location',
    PROPERTY_TYPE: 'Type',
    PRICE: 'Prix',
    MINIMUM_AGE: 'Âge minimum',
    MINIMUM_AGE_NOT_VALID: "L'âge minimum doit être supérieur ou égal à " + Env.MINIMUM_AGE + ' ans.',

    ADDRESS: 'Adresse',
    DESCRIPTION: 'Description',
    BEDROOMS: 'Chambres à couche',
    BATHROOMS: 'Salles de bain',
    KITCHENS: 'Cuisines',
    PARKING_SPACES: 'Parkings',
    SIZE: 'Superficie',
    AIRCON: 'Climatisation',
    FURNISHED: 'Meublée',
    PETS_ALLOWED: 'Animaux domestiques',
    SOLD_OUT: 'Épuisée',
    HIDDEN: 'Cachée',
    IMAGES: 'Images',
    DESCRIPTION_REQUIRED:'Le champ description est requis',
    RENTAL_TERM: 'Durée de location'
  },
  en: {
    NEW_PROPERTY_HEADING: 'New property',
    NAME: 'Name',
    PROPERTY_IMAGE_SIZE_ERROR: `The image must be in the format ${Env.PROPERTY_IMAGE_WIDTH}x${Env.PROPERTY_IMAGE_HEIGHT}`,
    RECOMMENDED_IMAGE_SIZE: `Recommended image size: ${Env.PROPERTY_IMAGE_WIDTH}x${Env.PROPERTY_IMAGE_HEIGHT}`,
    AGENCY: 'Agency',
    LOCATION: 'Location',
    AVAILABLE: 'Available for rental',
    PROPERTY_TYPE: 'Type',
    PRICE: 'Price',
    MINIMUM_AGE: 'Minimum age',
    MINIMUM_AGE_NOT_VALID: 'Minimum age must be greater than or equal to ' + Env.MINIMUM_AGE + ' years old.',

    ADDRESS: 'Address',
    DESCRIPTION: 'Description',
    BEDROOMS: 'Bedrooms',
    BATHROOMS: 'Bathrooms',
    KITCHENS: 'Kitchens',
    PARKING_SPACES: 'Parking spaces',
    SIZE: 'Size',
    AIRCON: 'Aircon',
    FURNISHED: 'Furnished',
    PETS_ALLOWED: 'Pets allowed',
    SOLD_OUT: 'Sold out',
    HIDDEN: 'Hidden',
    IMAGES: 'Images',
    DESCRIPTION_REQUIRED:'Description is required',
    RENTAL_TERM: 'Rental term',
  },
})

LangHelper.setLanguage(strings)
export { strings }
