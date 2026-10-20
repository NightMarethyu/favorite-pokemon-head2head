import { TYPE_ICONS } from '../data/typeArt.js'
import { useI18n } from '../i18n/useI18n.js'

function MatchupCard({ pokemon, label, wins, onPick, onFavorite }) {
  const { t, pokemonName, typeName } = useI18n()
  const showWins = wins !== undefined
  const name = pokemonName(pokemon)

  return (
    <div className="card-slot">
      <button type="button" className="card" onClick={onPick}>
        <span className="card-label">{label}</span>
        {pokemon.sprite && (
          <img
            className="card-sprite"
            src={pokemon.sprite}
            alt=""
            width="512"
            height="512"
            draggable={false}
          />
        )}
        <span className="card-name">
          {name}
          {pokemon.types.length > 0 && (
            <span className="card-types">
              {pokemon.types.map(
                (type) =>
                  TYPE_ICONS.has(type) && (
                    <img
                      key={type}
                      className="card-type-icon"
                      src={TYPE_ICONS.get(type)}
                      alt={typeName(type)}
                      title={typeName(type)}
                      width="170"
                      height="170"
                      draggable={false}
                    />
                  ),
              )}
            </span>
          )}
        </span>
        {showWins && (
          <span className="card-wins" aria-label={t('winsLabel', wins)}>
            {t('wins', wins)}
          </span>
        )}
      </button>
      {onFavorite && (
        <button
          type="button"
          className="card-favorite"
          onClick={onFavorite}
          title={t('favoriteHint', name)}
        >
          {t('favorite')}
        </button>
      )}
    </div>
  )
}

export default MatchupCard
