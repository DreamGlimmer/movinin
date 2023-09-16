import LocalizedStrings from 'react-localization'
import * as LangHelper from '../common/LangHelper'

const strings = new LocalizedStrings({
  fr: {
    DASHBOARD: 'Tableau de bord',
    HOME: 'Accueil',
    AGENCIES: 'Agencies',
    LOCATIONS: 'Lieux',
    PROPERTIES: 'Propriétés',
    USERS: 'Utilisateurs',
    ABOUT: 'À propos',
    TOS: "Conditions d'utilisation",
    CONTACT: 'Contact',
    LANGUAGE: 'Langue',
    LANGUAGE_FR: 'Français',
    LANGUAGE_EN: 'English',
    SETTINGS: 'Paramètres',
    SIGN_OUT: 'Déconnexion',
  },
  en: {
    DASHBOARD: 'Dashboard',
    HOME: 'Home',
    AGENCIES: 'Agencies',
    LOCATIONS: 'Locations',
    PROPERTIES: 'Properties',
    USERS: 'Users',
    ABOUT: 'About',
    TOS: 'Terms of Service',
    CONTACT: 'Contact',
    LANGUAGE: 'Language',
    LANGUAGE_FR: 'Français',
    LANGUAGE_EN: 'English',
    SETTINGS: 'Settings',
    SIGN_OUT: 'Sign out',
  },
})

LangHelper.setLanguage(strings)
export { strings }
