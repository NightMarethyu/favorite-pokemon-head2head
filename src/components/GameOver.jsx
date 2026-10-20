function GameOver({ champion, onRestart }) {
  return (
    <section className="game-over">
      <h2>That's everyone!</h2>
      {champion && (
        <p>
          Your favorite: <strong>{champion.name}</strong>
        </p>
      )}
      <button type="button" className="restart" onClick={onRestart}>
        Play again
      </button>
    </section>
  )
}

export default GameOver
