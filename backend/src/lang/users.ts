import LocalizedStrings from 'react-localization'
import * as langHelper from '../common/langHelper'

const strings = new LocalizedStrings({
  fr: {
    NEW_USER: 'Nouvel utilisateur',
  },
  en: {
    NEW_USER: 'New user',
  },
})

langHelper.setLanguage(strings)
export { strings }
