function MatchupCard({ pokemon, label, wins, onPick }) {
  const showWins = wins !== undefined

  return (
    <button type="button" className="card" onClick={onPick}>
      <span className="card-label">{label}</span>
      <span className="card-name">{pokemon.name}</span>
      {showWins && (
        <span className="card-wins" aria-label={`${wins} wins`}>
          Wins: {wins}
        </span>
      )}
    </button>
  )
}

export default MatchupCard
