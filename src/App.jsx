import { useCallback, useState } from 'react'
import Game from './components/Game.jsx'
import HomeScreen from './components/HomeScreen.jsx'
import LanguageSwitcher from './components/LanguageSwitcher.jsx'
import QuickStart from './components/QuickStart.jsx'
import SetupScreen from './components/SetupScreen.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import { EMPTY_FILTERS, describeFilters } from './data/filters.js'
import { CLASSIC, gameMode, startGame } from './game/modes.js'
import { openSave } from './game/saves.js'
import { useSaves } from './hooks/useSaves.js'
import { useI18n } from './i18n/useI18n.js'
import { useTheme } from './hooks/useTheme.js'

function App() {
  const i18n = useI18n()
  const { theme, toggleTheme } = useTheme()
  const { summaries, saves, activeSave, create, update, refresh, remove, setActive, importData } =
    useSaves()
  // Without an open game: 'home', 'quick' (the short start for newcomers), or
  // 'setup' (every filter and mode).
  const [screen, setScreen] = useState('home')
  // The open game: { id, filters, pool, state }, or null.
  const [run, setRun] = useState(null)
  // The last choices, kept so "Change filters" starts from them.
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [mode, setMode] = useState(CLASSIC)

  function start(nextFilters, pool, nextMode) {
    const state = startGame(pool, nextMode)
    const id = create(nextFilters, state)
    setFilters(nextFilters)
    setMode(nextMode)
    setRun({ id, filters: nextFilters, pool, state })
  }

  function resume(id) {
    const opened = openSave(saves.find((save) => save.id === id))
    if (!opened) return
    setActive(id)
    setFilters(opened.filters)
    setMode(gameMode(opened.state))
    setScreen('setup')
    setRun(opened)
  }

  // "Change filters" goes back to where the game was set up. The game stays
  // the one to continue from the home screen.
  function changeFilters() {
    refresh()
    setRun(null)
  }

  function goHome() {
    refresh()
    setRun(null)
    setScreen('home')
  }

  const runId = run?.id
  const saveRun = useCallback((state) => update(runId, state), [update, runId])
  const lastGame = summaries.find((save) => save.id === activeSave?.id && !save.isOver) ?? null

  let content
  if (run) {
    content = (
      <Game
        key={run.id}
        pool={run.pool}
        initialState={run.state}
        filterLabel={describeFilters(run.filters, i18n)}
        onSave={saveRun}
        onChangeFilters={changeFilters}
      />
    )
  } else if (screen === 'quick') {
    content = (
      <QuickStart
        initialFilters={filters}
        onStart={start}
        onMoreOptions={() => setScreen('setup')}
      />
    )
  } else if (screen === 'setup') {
    content = (
      <SetupScreen
        initialFilters={filters}
        initialMode={mode}
        onStart={start}
        onQuickStart={() => setScreen('quick')}
      />
    )
  } else {
    content = (
      <HomeScreen
        lastGame={lastGame}
        saves={summaries}
        onNewcomer={() => setScreen('quick')}
        onExpert={() => setScreen('setup')}
        onResume={resume}
        onDelete={remove}
        onImport={importData}
      />
    )
  }

  const onHome = !run && screen === 'home'

  return (
    <div className="app">
      <header className="app-header">
        {onHome ? (
          <span />
        ) : (
          <h1>
            <button type="button" className="app-title" onClick={goHome}>
              {i18n.t('siteTitle')}
            </button>
          </h1>
        )}
        <div className="header-actions">
          <LanguageSwitcher />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      <main className="app-main">{content}</main>
    </div>
  )
}

export default App
