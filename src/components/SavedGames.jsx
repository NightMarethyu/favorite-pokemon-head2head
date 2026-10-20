import { describeFilters } from '../data/filters.js'
import { MAX_SAVES } from '../game/saves.js'

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

// Games saved in this browser, most recently played first.
function SavedGames({ saves, onResume, onDelete }) {
  if (saves.length === 0) return null

  function confirmDelete(save) {
    if (window.confirm(`Delete the saved game "${describeFilters(save.filters)}"?`)) {
      onDelete(save.id)
    }
  }

  return (
    <section className="saves" aria-label="Saved games">
      <h2 className="team-title">Saved Games</h2>
      <ul className="saves-list">
        {saves.map((save) => (
          <li key={save.id} className="saves-item">
            {save.leader?.sprite ? (
              <img className="saves-sprite" src={save.leader.sprite} alt="" />
            ) : (
              <span className="saves-sprite" />
            )}
            <div className="saves-info">
              <span className="saves-name">{describeFilters(save.filters)}</span>
              <span className="saves-detail">
                {save.progress}
                {save.leader && ` · ${save.isOver ? 'Favorite' : 'Leading'}: ${save.leader.name}`}
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
                onClick={() => confirmDelete(save)}
                aria-label={`Delete saved game ${describeFilters(save.filters)}`}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p className="saves-note">
        Saved in this browser only. The oldest are removed after {MAX_SAVES} games.
      </p>
    </section>
  )
}

export default SavedGames
