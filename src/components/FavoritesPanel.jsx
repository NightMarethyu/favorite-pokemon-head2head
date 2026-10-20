// Pokémon marked as favorites, waiting for Sudden Death. During the main round
// a favorite can be removed, which puts it back into the draw.
function FavoritesPanel({ favorites, onRemove }) {
  return (
    <section className="favorites" aria-label="Favorites">
      <h2 className="team-title">★ Favorites</h2>
      {favorites.length === 0 ? (
        <p className="favorites-empty">
          Mark a Pokémon as a favorite to send it straight to Sudden Death, so it doesn't knock
          out the others along the way.
        </p>
      ) : (
        <ul className="favorites-list">
          {favorites.map((pokemon) => (
            <li key={pokemon.id} className="favorites-item">
              <span>{pokemon.name}</span>
              {onRemove && (
                <button
                  type="button"
                  className="favorites-remove"
                  onClick={() => onRemove(pokemon.id)}
                  aria-label={`Remove ${pokemon.name} from favorites`}
                  title="Put back into the draw"
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default FavoritesPanel
