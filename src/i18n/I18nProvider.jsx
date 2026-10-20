import { useEffect, useMemo, useState } from 'react'
import { detectLanguage, isLanguage } from './languages.js'
import { makeTranslator } from './translate.js'
import { I18nContext } from './useI18n.js'

const STORAGE_KEY = 'language'

// A language picked in the switcher wins; otherwise use the browser's.
function readLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (isLanguage(stored)) return stored
  } catch {
    // Storage can be unavailable (private mode).
  }
  return detectLanguage()
}

function I18nProvider({ children }) {
  const [language, setLanguage] = useState(readLanguage)
  const value = useMemo(
    () => ({
      ...makeTranslator(language),
      setLanguage(code) {
        if (!isLanguage(code)) return
        setLanguage(code)
        try {
          localStorage.setItem(STORAGE_KEY, code)
        } catch {
          // The choice still applies until the page is closed.
        }
      },
    }),
    [language],
  )

  useEffect(() => {
    document.documentElement.lang = value.locale
    document.title = value.t('pageTitle')
  }, [value])

  return <I18nContext value={value}>{children}</I18nContext>
}

export default I18nProvider
