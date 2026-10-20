import Arena from './components/Arena.jsx'
import FavoritesPanel from './components/FavoritesPanel.jsx'
import GameOver from './components/GameOver.jsx'
import TeamPanel from './components/TeamPanel.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import { getPokemonPool } from './data/pokedex.js'
import { useHead2Head } from './game/useHead2Head.js'
import { useTheme } from './hooks/useTheme.js'

// Future generation / game / type options will build this pool from filters.
const POOL = getPokemonPool()

function teamTitle(phase) {
  if (phase === 'over') return 'Your Final Team'
  if (phase === 'suddenDeath') return 'Ranking So Far'
  return 'Your Team'
}

function App() {
  const { theme, toggleTheme } = useTheme()
  const game = useHead2Head(POOL)

  return (
    <div className="app">
      <header className="app-header">
        <h1>Pokémon Head-to-Head</h1>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>

      <main className="app-main">
        {game.isOver ? (
          <GameOver champion={game.champion} onRestart={game.restart} />
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
          <button type="button" className="restart restart-subtle" onClick={game.restart}>
            Start over
          </button>
        )}
      </main>
    </div>
  )
}

export default App
