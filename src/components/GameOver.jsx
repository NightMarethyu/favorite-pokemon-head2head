function GameOver({ champion, onRestart, onChangeFilters }) {
  return (
    <section className="game-over">
      <h2>That's everyone!</h2>
      {champion && (
        <>
          {champion.sprite && (
            <img className="game-over-sprite" src={champion.sprite} alt="" />
          )}
          <p>
            Your favorite: <strong>{champion.name}</strong>
          </p>
        </>
      )}
      <div className="game-actions">
        <button type="button" className="restart" onClick={onRestart}>
          Play again
        </button>
        <button type="button" className="restart restart-subtle" onClick={onChangeFilters}>
          Change filters
        </button>
      </div>
    </section>
  )
}

export default GameOver
