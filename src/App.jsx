import { useCallback, useState } from 'react'
import Game from './components/Game.jsx'
import LanguageSwitcher from './components/LanguageSwitcher.jsx'
import SetupScreen from './components/SetupScreen.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import { EMPTY_FILTERS, describeFilters } from './data/filters.js'
import { createGame } from './game/head2head.js'
import { openSave } from './game/saves.js'
import { useSaves } from './hooks/useSaves.js'
import { useI18n } from './i18n/useI18n.js'
import { useTheme } from './hooks/useTheme.js'

function App() {
  const i18n = useI18n()
  const { theme, toggleTheme } = useTheme()
  const { summaries, saves, activeSave, create, update, remove, setActive, importData } = useSaves()
  // The open game: { id, filters, pool, state }, or null on the setup screen.
  // A game left open last visit picks up where it was.
  const [run, setRun] = useState(() => openSave(activeSave))
  // The last filters chosen, kept so "Change filters" starts from them.
  const [filters, setFilters] = useState(() => run?.filters ?? EMPTY_FILTERS)

  function start(nextFilters, pool) {
    const state = createGame(pool)
    const id = create(nextFilters, state)
    setFilters(nextFilters)
    setRun({ id, filters: nextFilters, pool, state })
  }

  function resume(id) {
    const opened = openSave(saves.find((save) => save.id === id))
    if (!opened) return
    setActive(id)
    setFilters(opened.filters)
    setRun(opened)
  }

  function leave() {
    setActive(null)
    setRun(null)
  }

  const runId = run?.id
  const saveRun = useCallback((state) => update(runId, state), [update, runId])

  return (
    <div className="app">
      <header className="app-header">
        <h1>{i18n.t('siteTitle')}</h1>
        <div className="header-actions">
          <LanguageSwitcher />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      <main className="app-main">
        {run ? (
          <Game
            key={run.id}
            pool={run.pool}
            initialState={run.state}
            filterLabel={describeFilters(run.filters, i18n)}
            onSave={saveRun}
            onChangeFilters={leave}
          />
        ) : (
          <SetupScreen
            initialFilters={filters}
            saves={summaries}
            onStart={start}
            onResume={resume}
            onDelete={remove}
            onImport={importData}
          />
        )}
      </main>
    </div>
  )
}

export default App
