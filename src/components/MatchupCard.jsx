function MatchupCard({ pokemon, label, wins, onPick, onFavorite }) {
  const showWins = wins !== undefined

  return (
    <div className="card-slot">
      <button type="button" className="card" onClick={onPick}>
        <span className="card-label">{label}</span>
        <span className="card-name">{pokemon.name}</span>
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
