import LocalizedStrings from 'react-localization'
import * as langHelper from '../common/langHelper'

const strings = new LocalizedStrings({
  fr: {
    PROPERTY: 'Propriété',
    AGENCY: 'Agency',
    RENTER: 'Locataire',
    PRICE: 'Prix',
    STATUS: 'Statut',
    UPDATE_SELECTION: 'Modifier la sélection',
    DELETE_SELECTION: 'Supprimer la sélection',
    UPDATE_STATUS: 'Modification du statut',
    NEW_STATUS: 'Nouveau statut',
    DELETE_BOOKING: 'Êtes-vous sûr de vouloir supprimer cette réservation ?',
    DELETE_BOOKINGS: 'Êtes-vous sûr de vouloir supprimer les réservations sélectionnées ?',
    EMPTY_LIST: 'Pas de réservations.',
    DAYS: 'Jours',
    COST: 'Total',
  },
  en: {
    PROPERTY: 'Property',
    AGENCY: 'Agency',
    RENTER: 'Renter',
    PRICE: 'Price',
    STATUS: 'Status',
    UPDATE_SELECTION: 'Edit selection',
    DELETE_SELECTION: 'Delete selection',
    UPDATE_STATUS: 'Status modification',
    NEW_STATUS: 'New status',
    DELETE_BOOKING: 'Are you sure you want to delete this booking?',
    DELETE_BOOKINGS: 'Are you sure you want to delete the selected bookings?',
    EMPTY_LIST: 'No bookings.',
    DAYS: 'Days',
    COST: 'COST',
  },
})

langHelper.setLanguage(strings)
export { strings }
