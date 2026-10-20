import { useState } from 'react'
import Game from './components/Game.jsx'
import SetupScreen from './components/SetupScreen.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import { EMPTY_FILTERS, describeFilters } from './data/filters.js'
import { useTheme } from './hooks/useTheme.js'

function App() {
  const { theme, toggleTheme } = useTheme()
  // The last filters chosen, kept so "Change filters" starts from them.
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  // null while on the setup screen. A new id remounts Game for a fresh run.
  const [run, setRun] = useState(null)

  function start(nextFilters, pool) {
    setFilters(nextFilters)
    setRun((current) => ({ id: (current?.id ?? 0) + 1, pool }))
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Pokémon Head-to-Head</h1>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>

      <main className="app-main">
        {run ? (
          <Game
            key={run.id}
            pool={run.pool}
            filterLabel={describeFilters(filters)}
            onChangeFilters={() => setRun(null)}
          />
        ) : (
          <SetupScreen initialFilters={filters} onStart={start} />
        )}
      </main>
    </div>
  )
}

export default App
