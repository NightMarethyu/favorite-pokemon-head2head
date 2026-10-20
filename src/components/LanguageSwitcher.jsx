import { useCallback, useRef, useState } from 'react'
import { useDismiss } from '../hooks/useDismiss.js'
import { LANGUAGES } from '../i18n/languages.js'
import { useI18n } from '../i18n/useI18n.js'

// A button with the multilingual icon that opens a short list of languages.
// Each language is listed in its own name so it can be found in any language.
function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n()
  const [open, setOpen] = useState(false)
  const root = useRef(null)

  const close = useCallback(() => setOpen(false), [])
  useDismiss(open, close, root)

  const current = LANGUAGES.find((entry) => entry.code === language)

  return (
    <div className="language" ref={root}>
      <button
        type="button"
        className="header-button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`${t('language')}: ${current.label}`}
        title={t('language')}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="language-icon" aria-hidden="true" />
        <span className="language-code">{current.code.toUpperCase()}</span>
      </button>
      {open && (
        <ul className="language-menu">
          {LANGUAGES.map((entry) => (
            <li key={entry.code}>
              <button
                type="button"
                lang={entry.locale}
                className="language-option"
                aria-current={entry.code === language}
                onClick={() => {
                  setLanguage(entry.code)
                  setOpen(false)
                }}
              >
                {entry.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default LanguageSwitcher
