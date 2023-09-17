import LocalizedStrings from 'react-localization'
import * as LangHelper from '../common/LangHelper'

const strings = new LocalizedStrings({
  fr: {
    NO_MATCH: 'Rien à voir ici !',
  },
  en: {
    NO_MATCH: 'Nothing to see here!',
  },
})

LangHelper.setLanguage(strings)
export { strings }
