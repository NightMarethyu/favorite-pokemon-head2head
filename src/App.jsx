import Arena from './components/Arena.jsx'
import GameOver from './components/GameOver.jsx'
import TeamPanel from './components/TeamPanel.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import { getPokemonPool } from './data/pokedex.js'
import { useHead2Head } from './game/useHead2Head.js'
import { useTheme } from './hooks/useTheme.js'

// Future generation / game / type options will build this pool from filters.
const POOL = getPokemonPool()

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
        ) : (
          <>
            <p className="progress">
              {game.remaining} of {game.total} left
            </p>
            <Arena
              champion={game.champion}
              challenger={game.challenger}
              streak={game.streak}
              onPickLeft={game.pickLeft}
              onPickRight={game.pickRight}
            />
          </>
        )}

        <TeamPanel team={game.team} title={game.isOver ? 'Your Final Team' : 'Your Team'} />

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
