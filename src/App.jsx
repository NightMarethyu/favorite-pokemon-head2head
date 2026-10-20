import { useCallback, useEffect, useRef, useState } from 'react'
import FavoritesGrid from './components/FavoritesGrid.jsx'
import Game from './components/Game.jsx'
import HomeScreen from './components/HomeScreen.jsx'
import LanguageSwitcher from './components/LanguageSwitcher.jsx'
import PokemonWiki from './components/PokemonWiki.jsx'
import QuickStart from './components/QuickStart.jsx'
import SetupScreen from './components/SetupScreen.jsx'
import SiteFooter from './components/SiteFooter.jsx'
import SiteMenu from './components/SiteMenu.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import TypeChart from './components/TypeChart.jsx'
import { EMPTY_FILTERS, describeFilters } from './data/filters.js'
import { CLASSIC, gameMode, startGame } from './game/modes.js'
import { openSave } from './game/saves.js'
import { useSaves } from './hooks/useSaves.js'
import { useI18n } from './i18n/useI18n.js'
import { useTheme } from './hooks/useTheme.js'

// Tools have their own address (#3x3) so they can be linked to directly. A
// tool can add more after a slash, like a wiki page at #wiki/25.
const TOOL_HASHES = { grid: '#3x3', types: '#types', wiki: '#wiki' }

const hashIsFor = (hash, toolHash) => hash === toolHash || hash.startsWith(`${toolHash}/`)

function screenFromHash() {
  const entry = Object.entries(TOOL_HASHES).find(([, hash]) =>
    hashIsFor(window.location.hash, hash),
  )
  return entry ? entry[0] : 'home'
}

function App() {
  const i18n = useI18n()
  const { theme, toggleTheme } = useTheme()
  const { summaries, saves, activeSave, create, update, refresh, remove, setActive, importData } =
    useSaves()
  // Without an open game: 'home', 'quick' (the short start for newcomers), or
  // 'setup' (every filter and mode). Tools from the menu: 'grid', 'types', 'wiki'.
  const [screen, setScreen] = useState(screenFromHash)
  // The open game: { id, filters, pool, state }, or null.
  const [run, setRun] = useState(null)
  // The last choices, kept so "Change filters" starts from them.
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [mode, setMode] = useState(CLASSIC)

  // A link out of a game (a Pokémon's wiki page from the final team) remembers
  // the game, so the browser's back button reopens it.
  const returnTo = useRef(null)
  const latest = useRef({ run, resume })
  useEffect(() => {
    latest.current = { run, resume }
  })

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

  // The menu leaves an open game where it is; it stays saved to continue.
  function navigate(next) {
    refresh()
    setRun(null)
    returnTo.current = null
    setScreen(next)
    // Picking the tool you're in goes back to its start (#wiki/25 -> #wiki).
    const hash = TOOL_HASHES[next]
    if (!run && next === screen && hash && window.location.hash !== hash)
      window.location.hash = hash
  }

  const shownScreen = run ? 'game' : screen

  useEffect(() => {
    const hash = TOOL_HASHES[shownScreen] ?? ''
    if (hash ? hashIsFor(window.location.hash, hash) : !window.location.hash) return
    const { pathname, search } = window.location
    window.history.replaceState(null, '', `${pathname}${search}${hash}`)
  }, [shownScreen])

  useEffect(() => {
    const onHashChange = () => {
      const next = screenFromHash()
      const { run: open, resume: reopen } = latest.current
      if (open) returnTo.current = open.id
      refresh()
      if (next === 'home' && returnTo.current) {
        reopen(returnTo.current)
        returnTo.current = null
        return
      }
      setRun(null)
      setScreen(next)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [refresh])

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
  } else if (screen === 'grid') {
    content = <FavoritesGrid />
  } else if (screen === 'types') {
    content = <TypeChart />
  } else if (screen === 'wiki') {
    content = <PokemonWiki />
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
            <button type="button" className="app-title" onClick={() => navigate('home')}>
              {i18n.t('siteTitle')}
            </button>
          </h1>
        )}
        <div className="header-actions">
          <SiteMenu current={shownScreen} onNavigate={navigate} />
          <LanguageSwitcher />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      <main className="app-main">{content}</main>

      <SiteFooter />
    </div>
  )
}

export default App
