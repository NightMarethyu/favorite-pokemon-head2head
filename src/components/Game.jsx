import { useEffect } from 'react'
import { useHead2Head } from '../game/useHead2Head.js'
import Arena from './Arena.jsx'
import FavoritesPanel from './FavoritesPanel.jsx'
import GameOver from './GameOver.jsx'
import TeamPanel from './TeamPanel.jsx'

function teamTitle(phase) {
  if (phase === 'over') return 'Your Final Team'
  if (phase === 'suddenDeath') return 'Ranking So Far'
  return 'Your Team'
}

// Start loading the next challenger's sprite so it shows up straight away.
function usePreloadSprite(pokemon) {
  useEffect(() => {
    if (!pokemon?.sprite) return
    const image = new Image()
    image.src = pokemon.sprite
  }, [pokemon])
}

function Game({ pool, initialState, filterLabel, onSave, onChangeFilters }) {
  const game = useHead2Head(pool, initialState)
  usePreloadSprite(game.next)

  // Save after every pick so the game can be picked up again later.
  useEffect(() => {
    onSave?.(game.state)
  }, [game.state, onSave])

  return (
    <>
      <p className="filter-summary">{filterLabel}</p>

      {game.isOver ? (
        <GameOver
          champion={game.champion}
          onRestart={game.restart}
          onChangeFilters={onChangeFilters}
        />
      ) : game.phase === 'suddenDeath' ? (
        <>
          <p className="progress">
            <strong className="phase-title">Sudden Death</strong>
            Placing {game.suddenDeath.placing} of {game.suddenDeath.total}
          </p>
          <Arena
            champion={game.champion}
            challenger={game.challenger}
            leftLabel="Finalist"
            rightLabel="Finalist"
            onPickLeft={game.pickLeft}
            onPickRight={game.pickRight}
          />
        </>
      ) : (
        <>
          <p className="progress">
            {game.remaining} of {game.total} left
          </p>
          <Arena
            champion={game.champion}
            challenger={game.challenger}
            leftLabel={game.streak > 0 ? 'Champion' : 'Contender'}
            rightLabel="Challenger"
            wins={game.streak}
            onPickLeft={game.pickLeft}
            onPickRight={game.pickRight}
            onFavoriteLeft={game.favoriteLeft}
            onFavoriteRight={game.favoriteRight}
          />
        </>
      )}

      <TeamPanel team={game.team} title={teamTitle(game.phase)} />

      {game.phase === 'main' && (
        <FavoritesPanel favorites={game.favorites} onRemove={game.unfavorite} />
      )}

      {!game.isOver && (
        <div className="game-actions">
          <button type="button" className="restart restart-subtle" onClick={game.restart}>
            Start over
          </button>
          <button type="button" className="restart restart-subtle" onClick={onChangeFilters}>
            Change filters
          </button>
        </div>
      )}
    </>
  )
}

export default Game
