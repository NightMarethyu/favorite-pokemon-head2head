import { DEVELOPER_URL } from '../data/siteLinks.js'
import { useI18n } from '../i18n/useI18n.js'

// The fan project disclaimer, and a link to the developer once it's set in
// src/data/siteLinks.js.
function SiteFooter() {
  const { t } = useI18n()

  return (
    <footer className="app-footer">
      <p>{t('disclaimer')}</p>
      {DEVELOPER_URL && (
        <p>
          <a href={DEVELOPER_URL} target="_blank" rel="noreferrer">
            {t('developerLink')}
          </a>
        </p>
      )}
    </footer>
  )
}

export default SiteFooter
