import { useRef, useState } from 'react'
import { describeFilters } from '../data/filters.js'
import { MAX_SAVES, exportSaves } from '../game/saves.js'

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
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

function plural(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`
}

// Games saved in this browser, most recently played first. Saves can be
// exported to a file and imported on another device.
function SavedGames({ saves, onResume, onDelete, onImport }) {
  const fileInput = useRef(null)
  const [message, setMessage] = useState(null)

  function confirmDelete(save) {
    if (window.confirm(`Delete the saved game "${describeFilters(save.filters)}"?`)) {
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
          ? 'No new games in that file.'
          : `Imported ${plural(imported, 'game')}.` +
              (skipped > 0 ? ` Skipped ${skipped} already here or unreadable.` : ''),
      )
    } catch {
      setMessage("That file isn't a saved games file.")
    }
  }

  return (
    <section className="saves" aria-label="Saved games">
      <h2 className="team-title">Saved Games</h2>
      {saves.length === 0 ? (
        <p className="saves-empty">
          No saved games yet. Games save as you play, or import a file from another device.
        </p>
      ) : (
        <ul className="saves-list">
          {saves.map((save) => {
            const label = describeFilters(save.filters)
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
                    {save.progress}
                    {save.leader &&
                      ` · ${save.isOver ? 'Favorite' : 'Leading'}: ${save.leader.name}`}
                  </span>
                  <span className="saves-detail">{formatTime(save.updatedAt)}</span>
                </div>
                <div className="saves-actions">
                  <button type="button" className="restart" onClick={() => onResume(save.id)}>
                    {save.isOver ? 'View' : 'Continue'}
                  </button>
                  <button
                    type="button"
                    className="restart restart-subtle"
                    onClick={() => download(exportSaves([save.id]), exportFilename(label))}
                    aria-label={`Export saved game ${label}`}
                  >
                    Export
                  </button>
                  <button
                    type="button"
                    className="restart restart-subtle"
                    onClick={() => confirmDelete(save)}
                    aria-label={`Delete saved game ${label}`}
                  >
                    Delete
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
            Export all
          </button>
        )}
        <button
          type="button"
          className="restart restart-subtle"
          onClick={() => fileInput.current.click()}
        >
          Import
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

      {saves.length > 0 && (
        <p className="saves-note">
          Saved in this browser only; export a game to move it to another device. The oldest are
          removed after {MAX_SAVES} games.
        </p>
      )}
    </section>
  )
}

export default SavedGames
