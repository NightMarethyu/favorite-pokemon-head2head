import { useI18n } from '../i18n/useI18n.js'

function ThemeToggle({ theme, onToggle }) {
  const { t } = useI18n()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className="header-button theme-toggle"
      onClick={onToggle}
      aria-pressed={isDark}
      title={t('themeSwitch', !isDark)}
    >
      {isDark ? t('themeDark') : t('themeLight')}
    </button>
  )
}

export default ThemeToggle
