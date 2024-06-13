import React from 'react'
import ReactDOM from 'react-dom/client'
import { ToastContainer } from 'react-toastify'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

import { frFR as corefrFR, enUS as coreenUS } from '@mui/material/locale'
import { frFR, enUS } from '@mui/x-date-pickers/locales'
import { frFR as dataGridfrFR, enUS as dataGridenUS } from '@mui/x-data-grid/locales'
import { disableDevTools } from ':disable-react-devtools'
import * as helper from './common/helper'
import * as UserService from './services/UserService'
import env from './config/env.config'
import App from './App'

import { strings as activateStrings } from './lang/activate'
import { strings as bookingFilterStrings } from './lang/booking-filter'
import { strings as bookingListStrings } from './lang/booking-list'
import { strings as bookingPropertyListStrings } from './lang/booking-property-list'
import { strings as bookingStrings } from './lang/booking'
import { strings as bookingsStrings } from './lang/bookings'
import { strings as changePasswordStrings } from './lang/change-password'
import { strings as checkoutStrings } from './lang/checkout'
import { strings as commonStrings } from './lang/common'
import { strings as headerStrings } from './lang/header'
import { strings as homeStrings } from './lang/home'
import { strings as masterStrings } from './lang/master'
import { strings as noMatchStrings } from './lang/no-match'
import { strings as notificationsStrings } from './lang/notifications'
import { strings as propertiesStrings } from './lang/properties'
import { strings as propertyStrings } from './lang/property'
import { strings as rentalTermStrings } from './lang/rental-term'
import { strings as resetPasswordStrings } from './lang/reset-password'
import { strings as settingstrings } from './lang/settings'
import { strings as signInStrings } from './lang/sign-in'
import { strings as signUpStrings } from './lang/sign-up'
import { strings as soldOutStrings } from './lang/sold-out'

import 'react-toastify/dist/ReactToastify.min.css'
import './assets/css/common.css'
import './assets/css/index.css'

if (env.isProduction) {
  disableDevTools()
}

let language = env.DEFAULT_LANGUAGE
const user = JSON.parse(localStorage.getItem('mi-user') ?? 'null')
let lang = UserService.getQueryLanguage()

if (lang) {
  if (!env.LANGUAGES.includes(lang)) {
    lang = localStorage.getItem('mi-language')

    if (lang && !env.LANGUAGES.includes(lang)) {
      lang = env.DEFAULT_LANGUAGE
    }
  }

  try {
    if (user) {
      language = user.language
      if (lang && lang.length === 2 && user.language !== lang) {
        const data = {
          id: user.id,
          language: lang,
        }

        const status = await UserService.validateAccessToken()

        if (status === 200) {
          const _status = await UserService.updateLanguage(data)
          if (_status !== 200) {
            helper.error(null, commonStrings.CHANGE_LANGUAGE_ERROR)
          }
        }

        language = lang
      }
    } else if (lang) {
      language = lang
    }
    UserService.setLanguage(language)
    commonStrings.setLanguage(language)
  } catch (err) {
    helper.error(err, commonStrings.CHANGE_LANGUAGE_ERROR)
  }
} else {
  //
  // If language not set, set language by IP
  //
  let storedLang

  if (user && user.language) {
    storedLang = user.language
  } else {
    const slang = localStorage.getItem('mi-language')
    if (slang && slang.length === 2) {
      storedLang = slang
    }
  }

  const updateLang = (_lang: string) => {
    UserService.setLanguage(_lang)

    activateStrings.setLanguage(_lang)
    bookingFilterStrings.setLanguage(_lang)
    bookingListStrings.setLanguage(_lang)
    bookingPropertyListStrings.setLanguage(_lang)
    bookingStrings.setLanguage(_lang)
    bookingsStrings.setLanguage(_lang)
    changePasswordStrings.setLanguage(_lang)
    checkoutStrings.setLanguage(_lang)
    commonStrings.setLanguage(_lang)
    headerStrings.setLanguage(_lang)
    homeStrings.setLanguage(_lang)
    masterStrings.setLanguage(_lang)
    noMatchStrings.setLanguage(_lang)
    notificationsStrings.setLanguage(_lang)
    propertiesStrings.setLanguage(_lang)
    propertyStrings.setLanguage(_lang)
    rentalTermStrings.setLanguage(_lang)
    resetPasswordStrings.setLanguage(_lang)
    settingstrings.setLanguage(_lang)
    signInStrings.setLanguage(_lang)
    signUpStrings.setLanguage(_lang)
    soldOutStrings.setLanguage(_lang)
  }

  if (env.SET_LANGUAGE_FROM_IP && !storedLang) {
    console.log('::')
    const country = await UserService.getCountryFromIP()

    if (country === 'France' || country === 'Morocco') {
      updateLang('fr')
    } else {
      updateLang(env.DEFAULT_LANGUAGE)
    }
  }
}

language = UserService.getLanguage()
const isFr = language === 'fr'

const theme = createTheme(
  {
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        "'Segoe UI'",
        'Roboto',
        "'Helvetica Neue'",
        'Arial',
        'sans-serif',
        "'Apple Color Emoji'",
        "'Segoe UI Emoji'",
        "'Segoe UI Symbol'",
      ].join(','),
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: '#fafafa',
          },
        },
      },
      MuiFormControl: {
        styleOverrides: {
          root: {
            '& .Mui-disabled': {
              color: '#333 !important',
            },
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            '& .Mui-checked': {
              color: '#0D63C9 !important',
            },
            '& .Mui-checked+.MuiSwitch-track': {
              opacity: 0.7,
              backgroundColor: '#0D63C9 !important',
            },
          },
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          root: {
            '& .MuiAutocomplete-inputRoot': {
              paddingRight: '20px !important',
            },
          },
          listbox: {
            '& .Mui-focused': {
              backgroundColor: '#eee !important',
            },
          },
          option: {
            // Hover
            // '&[data-focus="true"]': {
            //     backgroundColor: '#eee !important',
            //     borderColor: 'transparent',
            // },
            // Selected
            '&[aria-selected="true"]': {
              backgroundColor: '#faad43 !important',
            },
          },
        },
      },
    },
  },
  isFr ? frFR : enUS,
  isFr ? dataGridfrFR : dataGridenUS,
  isFr ? corefrFR : coreenUS,
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={theme}>
    <CssBaseline>
      <App />
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover
        theme="dark"
      />
    </CssBaseline>
  </ThemeProvider>,
)
