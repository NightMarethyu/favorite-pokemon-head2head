import { useRef, useState } from 'react'
import { describeFilters } from '../data/filters.js'
import { MAX_SAVES, exportSaves } from '../game/saves.js'
import { useI18n } from '../i18n/useI18n.js'

function formatTime(timestamp, locale) {
  return new Date(timestamp).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })
}

function describeProgress({ phase, placing, round, left, total }, t) {
  if (phase === 'over') return t('progressFinished')
  if (phase === 'suddenDeath') return t('progressSuddenDeath', placing, total)
  if (phase === 'bracket') return t('roundStillIn', round, left, total)
  return t('progressLeft', left, total)
}

// Hands the browser a JSON file to save.
function download(data, filename) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function exportFilename(label) {
  const slug = label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const date = new Date().toISOString().slice(0, 10)
  return `pokemon-head2head-${slug}-${date}.json`
}

// Games saved in this browser, most recently played first. Saves can be
// exported to a file and imported on another device. Export file names stay in
// English so they are safe on any system.
function SavedGames({ saves, onResume, onDelete, onImport }) {
  const i18n = useI18n()
  const { t, pokemonName } = i18n
  const fileInput = useRef(null)
  const [message, setMessage] = useState(null)

  function confirmDelete(save) {
    if (window.confirm(t('confirmDelete', describeFilters(save.filters, i18n)))) {
      onDelete(save.id)
    }
  }

  async function importFile(event) {
    const file = event.target.files[0]
    event.target.value = ''
    if (!file) return
    try {
      const { imported, skipped } = onImport(JSON.parse(await file.text()))
      setMessage(
        imported === 0
          ? t('importNone')
          : t('imported', imported) + (skipped > 0 ? t('importSkipped', skipped) : ''),
      )
    } catch {
      setMessage(t('importInvalid'))
    }
  }

  return (
    <section className="saves" aria-label={t('savedGames')}>
      <h2 className="team-title">{t('savedGames')}</h2>
      {saves.length === 0 ? (
        <p className="saves-empty">{t('savesEmpty')}</p>
      ) : (
        <ul className="saves-list">
          {saves.map((save) => {
            const label = describeFilters(save.filters, i18n)
            return (
              <li key={save.id} className="saves-item">
                {save.leader?.sprite ? (
                  <img className="saves-sprite" src={save.leader.sprite} alt="" />
                ) : (
                  <span className="saves-sprite" />
                )}
                <div className="saves-info">
                  <span className="saves-name">{label}</span>
                  <span className="saves-detail">
                    {t(`${save.mode}Mode`)} · {describeProgress(save.progress, t)}
                    {save.leader &&
                      ` · ${t('labelled', t(save.isOver ? 'leaderFavorite' : 'leaderLeading'), pokemonName(save.leader))}`}
                  </span>
                  <span className="saves-detail">{formatTime(save.updatedAt, i18n.locale)}</span>
                </div>
                <div className="saves-actions">
                  <button type="button" className="restart" onClick={() => onResume(save.id)}>
                    {save.isOver ? t('view') : t('continue')}
                  </button>
                  <button
                    type="button"
                    className="restart restart-subtle"
                    onClick={() =>
                      download(
                        exportSaves([save.id]),
                        exportFilename(describeFilters(save.filters)),
                      )
                    }
                    aria-label={t('exportGame', label)}
                  >
                    {t('export')}
                  </button>
                  <button
                    type="button"
                    className="restart restart-subtle"
                    onClick={() => confirmDelete(save)}
                    aria-label={t('deleteGame', label)}
                  >
                    {t('delete')}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <div className="saves-transfer">
        {saves.length > 0 && (
          <button
            type="button"
            className="restart restart-subtle"
            onClick={() => download(exportSaves(), exportFilename('all-saves'))}
          >
            {t('exportAll')}
          </button>
        )}
        <button
          type="button"
          className="restart restart-subtle"
          onClick={() => fileInput.current.click()}
        >
          {t('import')}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={importFile}
        />
      </div>
      {message && (
        <p className="saves-note" role="status">
          {message}
        </p>
      )}

      {saves.length > 0 && <p className="saves-note">{t('savesNote', MAX_SAVES)}</p>}
    </section>
  )
}

export default SavedGames
