import Const from './const'
import * as movininTypes from 'movinin-types'

const Env = {
  isMobile: () => window.innerWidth <= 960,

  APP_TYPE: movininTypes.AppType.Frontend,
  API_HOST: process.env.REACT_APP_MI_API_HOST,
  LANGUAGES: ['fr', 'en'], // ISO 639-1 language codes
  DEFAULT_LANGUAGE: process.env.REACT_APP_MI_DEFAULT_LANGUAGE || 'en',
  PAGE_SIZE: Number.parseInt(String(process.env.REACT_APP_MI_PAGE_SIZE)) || 30,
  PROPERTIES_PAGE_SIZE: Number.parseInt(String(process.env.REACT_APP_MI_PROPERTIES_PAGE_SIZE)) || 15,
  BOOKINGS_PAGE_SIZE: Number.parseInt(String(process.env.REACT_APP_MI_BOOKINGS_PAGE_SIZE)) || 20,
  BOOKINGS_MOBILE_PAGE_SIZE: Number.parseInt(String(process.env.REACT_APP_MI_BOOKINGS_MOBILE_PAGE_SIZE)) || 10,
  CDN_USERS: process.env.REACT_APP_MI_CDN_USERS,
  CDN_PROPERTIES: process.env.REACT_APP_MI_CDN_PROPERTIES,
  PAGE_OFFSET: 200,
  INFINITE_SCROLL_OFFSET: 40,
  AGENCY_IMAGE_WIDTH: Number.parseInt(String(process.env.REACT_APP_MI_COMAPANY_IMAGE_WIDTH)) || 60,
  AGENCY_IMAGE_HEIGHT: Number.parseInt(String(process.env.REACT_APP_MI_COMAPANY_IMAGE_HEIGHT)) || 30,
  PROPERTY_IMAGE_WIDTH: Number.parseInt(String(process.env.REACT_APP_MI_PROPERTY_IMAGE_WIDTH)) || 300,
  PROPERTY_IMAGE_HEIGHT: Number.parseInt(String(process.env.REACT_APP_MI_PROPERTY_IMAGE_HEIGHT)) || 200,
  PROPERTY_OPTION_IMAGE_HEIGHT: 85,
  SELECTED_PROPERTY_OPTION_IMAGE_HEIGHT: 30,
  RECAPTCHA_ENABLED: (process.env.REACT_APP_MI_RECAPTCHA_ENABLED && process.env.REACT_APP_MI_RECAPTCHA_ENABLED.toLowerCase()) === 'true',
  RECAPTCHA_SITE_KEY: process.env.REACT_APP_MI_RECAPTCHA_SITE_KEY,
  MINIMUM_AGE: Number.parseInt(String(process.env.REACT_APP_MI_MINIMUM_AGE)) || 21,
  // PAGINATION_MODE: CLASSIC or INFINITE_SCROLL
  // If you choose CLASSIC, you will get a classic pagination with next and previous buttons on desktop and infinite scroll on mobile.
  // If you choose INFINITE_SCROLL, you will get infinite scroll on desktop and mobile.
  // Defaults to CLASSIC
  PAGINATION_MODE:
    (process.env.REACT_APP_MI_PAGINATION_MODE && process.env.REACT_APP_MI_PAGINATION_MODE.toUpperCase()) === Const.PAGINATION_MODE.INFINITE_SCROLL
      ? Const.PAGINATION_MODE.INFINITE_SCROLL
      : Const.PAGINATION_MODE.CLASSIC,
}

export default Env
