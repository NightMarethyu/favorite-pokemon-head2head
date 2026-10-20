import { TYPE_ICONS } from '../data/typeArt.js'

function MatchupCard({ pokemon, label, wins, onPick, onFavorite }) {
  const showWins = wins !== undefined

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
          {pokemon.name}
          {pokemon.types.length > 0 && (
            <span className="card-types">
              {pokemon.types.map(
                (type) =>
                  TYPE_ICONS.has(type) && (
                    <img
                      key={type}
                      className="card-type-icon"
                      src={TYPE_ICONS.get(type)}
                      alt={type}
                      title={type}
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
          <span className="card-wins" aria-label={`${wins} wins`}>
            Wins: {wins}
          </span>
        )}
      </button>
      {onFavorite && (
        <button
          type="button"
          className="card-favorite"
          onClick={onFavorite}
          title={`Send ${pokemon.name} straight to Sudden Death`}
        >
          ★ Favorite
        </button>
      )}
    </div>
  )
}

export default MatchupCard
