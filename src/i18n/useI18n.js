import { createContext, useContext } from 'react'
import { ENGLISH } from './translate.js'

// { ...translator, setLanguage }. See I18nProvider.jsx.
export const I18nContext = createContext({ ...ENGLISH, setLanguage: () => {} })

export function useI18n() {
  return useContext(I18nContext)
}
