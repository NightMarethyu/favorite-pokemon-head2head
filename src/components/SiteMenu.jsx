import { useCallback, useRef, useState } from 'react'
import { useDismiss } from '../hooks/useDismiss.js'
import { useI18n } from '../i18n/useI18n.js'

// The site menu: back to the game, and a Tools section for extras like the
// 3×3 grid. New tools go in TOOLS.
const TOOLS = [
  { screen: 'grid', label: 'gridTitle' },
  { screen: 'types', label: 'typeChartTitle' },
  { screen: 'wiki', label: 'wikiTitle' },
]

function SiteMenu({ current, onNavigate }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const root = useRef(null)

  const close = useCallback(() => setOpen(false), [])
  useDismiss(open, close, root)

  function go(screen) {
    setOpen(false)
    onNavigate(screen)
  }

  return (
    <nav className="language site-menu" ref={root} aria-label={t('menu')}>
      <button
        type="button"
        className="header-button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="menu-icon" aria-hidden="true">
          ☰
        </span>
        <span className="menu-label">{t('menu')}</span>
      </button>
      {open && (
        <ul className="language-menu">
          <li>
            <button
              type="button"
              className="language-option"
              aria-current={current === 'home'}
              onClick={() => go('home')}
            >
              {t('menuPlay')}
            </button>
          </li>
          <li className="menu-heading" aria-hidden="true">
            {t('menuTools')}
          </li>
          {TOOLS.map((tool) => (
            <li key={tool.screen}>
              <button
                type="button"
                className="language-option menu-tool"
                aria-label={`${t('menuTools')}: ${t(tool.label)}`}
                aria-current={current === tool.screen}
                onClick={() => go(tool.screen)}
              >
                {t(tool.label)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  )
}

export default SiteMenu
