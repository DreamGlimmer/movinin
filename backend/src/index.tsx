import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import Env from './config/env.config'
import { strings as commonStrings } from './lang/common'
import * as UserService from './services/UserService'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { ToastContainer } from 'react-toastify'

import { frFR as corefrFR, enUS as coreenUS } from '@mui/material/locale'
import { frFR, enUS } from '@mui/x-date-pickers/locales'
import { frFR as dataGridfrFR, enUS as dataGridenUS } from '@mui/x-data-grid'
import * as Helper from './common/Helper'
import { disableDevTools } from 'disable-react-devtools'

import 'react-toastify/dist/ReactToastify.min.css'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import './assets/css/common.css'
import './assets/css/index.css'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)

if (process.env.REACT_APP_NODE_ENV === 'production') {
  disableDevTools()
}

let language = Env.DEFAULT_LANGUAGE
const user = JSON.parse(localStorage.getItem('bc-user') ?? 'null')
let lang = UserService.getQueryLanguage()

if (lang) {
  if (!Env.LANGUAGES.includes(lang)) {
    lang = localStorage.getItem('bc-language')

    if (lang && !Env.LANGUAGES.includes(lang)) {
      lang = Env.DEFAULT_LANGUAGE
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
          const status = await UserService.updateLanguage(data)
          if (status !== 200) {
            Helper.error(null, commonStrings.CHANGE_LANGUAGE_ERROR)
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
    Helper.error(err, commonStrings.CHANGE_LANGUAGE_ERROR)
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
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
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
    },
  },
  isFr ? frFR : enUS,
  isFr ? dataGridfrFR : dataGridenUS,
  isFr ? corefrFR : coreenUS,
)

root.render(
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
        pauseOnHover={true}
        icon={true}
        theme="dark"
      />
    </CssBaseline>
  </ThemeProvider>,
)
