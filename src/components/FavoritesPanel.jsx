import { useI18n } from '../i18n/useI18n.js'

// Pokémon marked as favorites, waiting for Sudden Death. During the main round
// a favorite can be removed, which puts it back into the draw.
function FavoritesPanel({ favorites, onRemove }) {
  const { t, pokemonName } = useI18n()

  return (
    <section className="favorites" aria-label={t('favorites')}>
      <h2 className="team-title">{t('favorites')}</h2>
      {favorites.length === 0 ? (
        <p className="favorites-empty">{t('favoritesEmpty')}</p>
      ) : (
        <ul className="favorites-list">
          {favorites.map((pokemon) => (
            <li key={pokemon.id} className="favorites-item">
              {pokemon.sprite && (
                <img className="favorites-sprite" src={pokemon.sprite} alt="" />
              )}
              <span>{pokemonName(pokemon)}</span>
              {onRemove && (
                <button
                  type="button"
                  className="favorites-remove"
                  onClick={() => onRemove(pokemon.id)}
                  aria-label={t('removeFavorite', pokemonName(pokemon))}
                  title={t('putBack')}
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
