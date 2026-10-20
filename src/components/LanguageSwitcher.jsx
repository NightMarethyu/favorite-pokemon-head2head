import { useEffect, useRef, useState } from 'react'
import { LANGUAGES } from '../i18n/languages.js'
import { useI18n } from '../i18n/useI18n.js'

// A button with the multilingual icon that opens a short list of languages.
// Each language is listed in its own name so it can be found in any language.
function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n()
  const [open, setOpen] = useState(false)
  const root = useRef(null)

  useEffect(() => {
    if (!open) return
    function close(event) {
      if (event.type === 'keydown' && event.key !== 'Escape') return
      if (event.type === 'pointerdown' && root.current?.contains(event.target)) return
      setOpen(false)
      if (event.type === 'keydown') root.current?.querySelector('button')?.focus()
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

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
